/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { DAContainer } from './da-container.js';
import { Nsdoc } from '../../foundation/nsdoc.js';
import { parseDoc, testDocs } from '../../test-utils/test-files.js';
import { getFirstAndAssertBySelector } from '../../test-utils/queries.js';
import { getAncestors } from '../../test-utils/test-harness.js';

customElements.define('da-container', DAContainer);

const nsdocStub: Nsdoc = {
  getDataDescription: (element: Element) => ({
    label: `${element.tagName}-label`,
  }),
};

describe('da-container', () => {
  describe('visual', () => {
    it('sets dialog props when DA has no instance element', async () => {
      const doc = parseDoc(testDocs.withIED);

      const daElement = getFirstAndAssertBySelector(
        doc,
        'DOType > DA[name="stVal"]',
      );
      const doElement = getFirstAndAssertBySelector(doc, 'LNodeType > DO');

      const ancestors = [
        ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN0']),
        doElement,
      ];

      const container = await fixture<DAContainer>(html`
        <da-container
          .doc=${doc}
          .docVersion=${0}
          .element=${daElement}
          .instanceElement=${null}
          .nsdoc=${nsdocStub}
          .ancestors=${ancestors}
        ></da-container>
      `);

      await container.updateComplete;

      const infoDialog = container.daInfoDialog;
      expect(infoDialog).to.exist;
      expect(infoDialog.templateElement).to.equal(daElement);
      expect(infoDialog.instanceElement).to.equal(null);
      expect(infoDialog.ancestors).to.deep.equal(ancestors);
      expect(infoDialog.nsdoc).to.equal(nsdocStub);
    });

    it('sets dialog props when DA has an instance element', async () => {
      const doc = parseDoc(testDocs.withIED_instanciated);

      const daElement = getFirstAndAssertBySelector(
        doc,
        'DOType > DA[name="stVal"]',
      );
      const doElement = getFirstAndAssertBySelector(doc, 'LNodeType > DO');
      const daiElement = getFirstAndAssertBySelector(
        doc,
        'LN0 > DOI > DAI[name="stVal"]',
      );

      const ancestors = [
        ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN0']),
        doElement,
      ];

      const container = await fixture<DAContainer>(html`
        <da-container
          .doc=${doc}
          .docVersion=${0}
          .element=${daElement}
          .instanceElement=${daiElement}
          .nsdoc=${nsdocStub}
          .ancestors=${ancestors}
        ></da-container>
      `);

      await container.updateComplete;

      const infoDialog = container.daInfoDialog;
      expect(infoDialog).to.exist;
      expect(infoDialog.templateElement).to.equal(daElement);
      expect(infoDialog.instanceElement).to.equal(daiElement);
      expect(infoDialog.ancestors).to.deep.equal(ancestors);
      expect(infoDialog.nsdoc).to.equal(nsdocStub);
    });

    it('renders a create button for non-struct DA without instance values', async () => {
      const doc = parseDoc(testDocs.withIED_instanciated);
      const daElement = getFirstAndAssertBySelector(
        doc,
        'DOType > DA[name="stVal"]',
      );
      const doElement = getFirstAndAssertBySelector(doc, 'LNodeType > DO');
      const ancestors = [
        ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN0']),
        doElement,
      ];

      const container = await fixture<DAContainer>(html`
        <da-container
          .doc=${doc}
          .docVersion=${0}
          .element=${daElement}
          .instanceElement=${null}
          .nsdoc=${nsdocStub}
          .ancestors=${ancestors}
        ></da-container>
      `);

      await container.updateComplete;

      const toggleButton = container.shadowRoot?.querySelector('#toggleButton');
      expect(toggleButton).to.not.exist;

      const addIcon = Array.from(
        container.shadowRoot?.querySelectorAll('oscd-icon') ?? [],
      ).find(icon => icon.textContent?.trim() === 'add');
      expect(addIcon).to.exist;
    });

    it('renders an edit button when instance values exist', async () => {
      const doc = parseDoc(testDocs.withIED_instanciated);
      const daElement = getFirstAndAssertBySelector(
        doc,
        'DOType > DA[name="stVal"]',
      );
      const doElement = getFirstAndAssertBySelector(doc, 'LNodeType > DO');
      const daiElement = getFirstAndAssertBySelector(
        doc,
        'LN0 > DOI > DAI[name="stVal"]',
      );
      const ancestors = [
        ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN0']),
        doElement,
      ];

      const container = await fixture<DAContainer>(html`
        <da-container
          .doc=${doc}
          .docVersion=${0}
          .element=${daElement}
          .instanceElement=${daiElement}
          .nsdoc=${nsdocStub}
          .ancestors=${ancestors}
        ></da-container>
      `);

      await container.updateComplete;

      const editIcon = Array.from(
        container.shadowRoot?.querySelectorAll('oscd-icon') ?? [],
      ).find(icon => icon.textContent?.trim() === 'edit');
      expect(editIcon).to.exist;
    });

    it('disables create/edit controls for unsupported bType', async () => {
      const doc = parseDoc(testDocs.withIED_instanciated);
      const daElement = getFirstAndAssertBySelector(
        doc,
        'DOType > DA[name="q"]',
      );
      const doElement = getFirstAndAssertBySelector(doc, 'LNodeType > DO');
      const ancestors = [
        ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN0']),
        doElement,
      ];

      const createContainer = await fixture<DAContainer>(html`
        <da-container
          .doc=${doc}
          .docVersion=${0}
          .element=${daElement}
          .instanceElement=${null}
          .nsdoc=${nsdocStub}
          .ancestors=${ancestors}
        ></da-container>
      `);
      await createContainer.updateComplete;

      const addButton = Array.from(
        createContainer.shadowRoot?.querySelectorAll('oscd-icon-button') ?? [],
      ).find(
        button =>
          button.querySelector('oscd-icon')?.textContent?.trim() === 'add',
      ) as HTMLElement | undefined;
      expect(addButton).to.exist;
      expect(addButton?.hasAttribute('disabled')).to.equal(true);

      const daiElement = getFirstAndAssertBySelector(
        doc,
        'LN0 > DOI > DAI[name="stVal"]',
      );
      const editContainer = await fixture<DAContainer>(html`
        <da-container
          .doc=${doc}
          .docVersion=${0}
          .element=${daElement}
          .instanceElement=${daiElement}
          .nsdoc=${nsdocStub}
          .ancestors=${ancestors}
        ></da-container>
      `);
      await editContainer.updateComplete;

      const editButton = Array.from(
        editContainer.shadowRoot?.querySelectorAll('oscd-icon-button') ?? [],
      ).find(
        button =>
          button.querySelector('oscd-icon')?.textContent?.trim() === 'edit',
      ) as HTMLElement | undefined;
      expect(editButton).to.exist;
      expect(editButton?.hasAttribute('disabled')).to.equal(true);
    });

    it('does not render BDA containers when collapsed', async () => {
      const doc = parseDoc(testDocs.withIED_instanciated);
      const doElement = getFirstAndAssertBySelector(doc, 'LNodeType > DO');
      const structDa = getFirstAndAssertBySelector(
        doc,
        'DOType[id="Beh_Test"] > DA[name="Sub2"]',
      );
      const ancestors = [
        ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN0']),
        doElement,
      ];

      const container = await fixture<DAContainer>(html`
        <da-container
          .doc=${doc}
          .docVersion=${0}
          .element=${structDa}
          .instanceElement=${null}
          .nsdoc=${nsdocStub}
          .ancestors=${ancestors}
        ></da-container>
      `);

      await container.updateComplete;

      const bdaContainers =
        container.shadowRoot?.querySelectorAll('da-container') ?? [];
      expect(bdaContainers.length).to.equal(0);
    });
  });

  describe('header actions', () => {
    it('opens the dialog on info button click', async () => {
      const doc = parseDoc(testDocs.withIED_instanciated);

      const daElement = getFirstAndAssertBySelector(
        doc,
        'DOType > DA[name="stVal"]',
      );
      const doElement = getFirstAndAssertBySelector(doc, 'LNodeType > DO');

      const ancestors = [
        ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN0']),
        doElement,
      ];

      const container = await fixture<DAContainer>(html`
        <da-container
          .doc=${doc}
          .docVersion=${0}
          .element=${daElement}
          .instanceElement=${null}
          .nsdoc=${nsdocStub}
          .ancestors=${ancestors}
        ></da-container>
      `);

      await container.updateComplete;

      const infoDialog = container.daInfoDialog;
      expect(infoDialog).to.exist;
      const innerInfoDialog = infoDialog.shadowRoot?.querySelector(
        'info-dialog',
      ) as HTMLElement | null;
      expect(innerInfoDialog).to.exist;
      const oscdDialog = (innerInfoDialog as any)?.shadowRoot?.querySelector(
        'oscd-dialog',
      ) as { open?: boolean } | null;
      expect(oscdDialog).to.exist;

      const nsdocLabel = nsdocStub.getDataDescription(
        daElement,
        ancestors,
      ).label;
      const infoButton = container.shadowRoot?.querySelector(
        `oscd-icon-button[title="${nsdocLabel}"]`,
      ) as HTMLElement | null;
      expect(infoButton).to.exist;
      infoButton!.click();

      await waitUntil(() => oscdDialog?.open === true);
    });
  });

  describe('content interactions', () => {
    it('renders BDA containers when expanded for Struct DA', async () => {
      const doc = parseDoc(testDocs.withIED_instanciated);
      const doElement = getFirstAndAssertBySelector(doc, 'LNodeType > DO');
      const structDa = getFirstAndAssertBySelector(
        doc,
        'DOType[id="Beh_Test"] > DA[name="Sub2"]',
      );
      const ancestors = [
        ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN0']),
        doElement,
      ];

      const container = await fixture<DAContainer>(html`
        <da-container
          .doc=${doc}
          .docVersion=${0}
          .element=${structDa}
          .instanceElement=${null}
          .nsdoc=${nsdocStub}
          .ancestors=${ancestors}
        ></da-container>
      `);

      await container.updateComplete;

      const toggleButton = container.shadowRoot?.querySelector(
        '#toggleButton',
      ) as HTMLElement;
      expect(toggleButton).to.exist;

      toggleButton.click();
      await container.updateComplete;
      expect(container.expanded).to.be.true;

      const bdaContainers =
        container.shadowRoot?.querySelectorAll('da-container') ?? [];
      expect(bdaContainers.length).to.equal(1);
    });

    it('opens the create dialog when clicking the add button', async () => {
      const doc = parseDoc(testDocs.withIED);
      const daElement = getFirstAndAssertBySelector(
        doc,
        'DOType > DA[name="stVal"]',
      );
      const doElement = getFirstAndAssertBySelector(doc, 'LNodeType > DO');
      const ancestors = [
        ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN0']),
        doElement,
      ];

      const container = await fixture<DAContainer>(html`
        <da-container
          .doc=${doc}
          .docVersion=${0}
          .element=${daElement}
          .instanceElement=${null}
          .nsdoc=${nsdocStub}
          .ancestors=${ancestors}
        ></da-container>
      `);
      await container.updateComplete;

      const daiDialog = container.daiValueDialog as HTMLElement;
      expect(daiDialog).to.exist;
      const oscdDialog = (daiDialog as any)?.shadowRoot?.querySelector(
        'oscd-dialog',
      ) as { open?: boolean } | null;
      expect(oscdDialog).to.exist;

      const addButton = Array.from(
        container.shadowRoot?.querySelectorAll('oscd-icon-button') ?? [],
      ).find(
        button =>
          button.querySelector('oscd-icon')?.textContent?.trim() === 'add',
      ) as HTMLElement | undefined;
      expect(addButton).to.exist;
      addButton!.click();
      await waitUntil(() => oscdDialog?.open === true);
    });

    it('opens the edit dialog when clicking the edit button', async () => {
      const doc = parseDoc(testDocs.withIED_instanciated);
      const daElement = getFirstAndAssertBySelector(
        doc,
        'DOType > DA[name="stVal"]',
      );
      const doElement = getFirstAndAssertBySelector(doc, 'LNodeType > DO');
      const daiElement = getFirstAndAssertBySelector(
        doc,
        'LN0 > DOI > DAI[name="stVal"]',
      );
      const ancestors = [
        ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN0']),
        doElement,
      ];

      const container = await fixture<DAContainer>(html`
        <da-container
          .doc=${doc}
          .docVersion=${0}
          .element=${daElement}
          .instanceElement=${daiElement}
          .nsdoc=${nsdocStub}
          .ancestors=${ancestors}
        ></da-container>
      `);
      await container.updateComplete;

      const daiDialog = container.daiValueDialog as HTMLElement;
      expect(daiDialog).to.exist;
      const oscdDialog = (daiDialog as any)?.shadowRoot?.querySelector(
        'oscd-dialog',
      ) as { open?: boolean } | null;
      expect(oscdDialog).to.exist;

      const editButton = Array.from(
        container.shadowRoot?.querySelectorAll('oscd-icon-button') ?? [],
      ).find(
        button =>
          button.querySelector('oscd-icon')?.textContent?.trim() === 'edit',
      ) as HTMLElement | undefined;
      expect(editButton).to.exist;
      editButton!.click();
      await waitUntil(() => oscdDialog?.open === true);
    });
  });
});
