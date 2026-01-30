import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { DOContainer } from './do-container.js';
import { Nsdoc } from '../../foundation/nsdoc.js';
import { parseDoc, testDocs } from '../../test-utils/test-files.js';
import { getFirstAndAssertBySelector } from '../../test-utils/queries.js';
import { getAncestors } from '../../test-utils/test-harness.js';
import { InfoDialog } from '../info-dialog.js';

customElements.define('do-container', DOContainer);

const nsdocStub: Nsdoc = {
  getDataDescription: (element: Element) => ({
    label: `${element.tagName}-label`,
  }),
};

describe('do-container', () => {
  describe('visual', () => {
    it('renders the header label and info icon', async () => {
      const doc = parseDoc(testDocs.withIED_instanciated);

      const doElement = getFirstAndAssertBySelector(
        doc,
        'LNodeType[id="TCTR_Test"] > DO[name="ARtg"]',
      );
      const doiElement = getFirstAndAssertBySelector(
        doc,
        'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"]',
      );
      const ancestors = getAncestors(doc, [
        'IED',
        'AccessPoint',
        'LDevice',
        'LN',
      ]);

      const container = await fixture<DOContainer>(html`
        <do-container
          .doc=${doc}
          .docVersion=${0}
          .element=${doElement}
          .instanceElement=${doiElement}
          .nsdoc=${nsdocStub}
          .ancestors=${ancestors}
        ></do-container>
      `);

      await container.updateComplete;

      const header = container.shadowRoot?.querySelector(
        'oscd-action-pane',
      ) as HTMLElement | null;
      expect(header).to.exist;

      const nsdocLabel = nsdocStub.getDataDescription(
        doElement,
        ancestors,
      ).label;
      const infoButton = container.shadowRoot?.querySelector(
        `oscd-icon-button[title="${nsdocLabel}"]`,
      ) as HTMLElement | null;
      expect(infoButton).to.exist;
    });

    it('hides the toggle button when no child elements exist', async () => {
      const doc = parseDoc(testDocs.withIED_instanciated);
      const doElement = getFirstAndAssertBySelector(
        doc,
        'LNodeType[id="TCTR_Test"] > DO[name="ARtg"]',
      );
      doElement.setAttribute('type', 'MissingType');
      const doiElement = getFirstAndAssertBySelector(
        doc,
        'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"]',
      );
      const ancestors = getAncestors(doc, [
        'IED',
        'AccessPoint',
        'LDevice',
        'LN',
      ]);

      const container = await fixture<DOContainer>(html`
        <do-container
          .doc=${doc}
          .docVersion=${0}
          .element=${doElement}
          .instanceElement=${doiElement}
          .nsdoc=${nsdocStub}
          .ancestors=${ancestors}
        ></do-container>
      `);

      await container.updateComplete;

      const toggleButton = container.shadowRoot?.querySelector('#toggleButton');
      expect(toggleButton).to.not.exist;
    });
  });

  describe('header actions', () => {
    it('opens the info dialog when clicking the info icon', async () => {
      const doc = parseDoc(testDocs.withIED_instanciated);

      const doElement = getFirstAndAssertBySelector(
        doc,
        'LNodeType[id="TCTR_Test"] > DO[name="ARtg"]',
      );
      const doiElement = getFirstAndAssertBySelector(
        doc,
        'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"]',
      );
      const ancestors = getAncestors(doc, [
        'IED',
        'AccessPoint',
        'LDevice',
        'LN',
      ]);

      const container = await fixture<DOContainer>(html`
        <do-container
          .doc=${doc}
          .docVersion=${0}
          .element=${doElement}
          .instanceElement=${doiElement}
          .nsdoc=${nsdocStub}
          .ancestors=${ancestors}
        ></do-container>
      `);

      await container.updateComplete;

      const infoDialog = container.doInfoDialog;
      expect(infoDialog).to.exist;
      const innerInfoDialog = infoDialog.shadowRoot?.querySelector(
        'info-dialog',
      ) as InfoDialog | null;
      expect(innerInfoDialog).to.exist;
      const oscdDialog = innerInfoDialog!.shadowRoot?.querySelector(
        'oscd-dialog',
      ) as { open?: boolean } | null;
      expect(oscdDialog).to.exist;

      const nsdocLabel = nsdocStub.getDataDescription(
        doElement,
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
    it('renders DA and DO containers after expanding the action pane', async () => {
      const doc = parseDoc(testDocs.withIED_instanciated);

      const doElement = getFirstAndAssertBySelector(
        doc,
        'LNodeType[id="TCTR_Test"] > DO[name="ARtg"]',
      );
      const doiElement = getFirstAndAssertBySelector(
        doc,
        'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"]',
      );
      const ancestors = getAncestors(doc, [
        'IED',
        'AccessPoint',
        'LDevice',
        'LN',
      ]);

      const container = await fixture<DOContainer>(html`
        <do-container
          .doc=${doc}
          .docVersion=${0}
          .element=${doElement}
          .instanceElement=${doiElement}
          .nsdoc=${nsdocStub}
          .ancestors=${ancestors}
        ></do-container>
      `);

      await container.updateComplete;

      const toggleButton = container.shadowRoot?.querySelector(
        '#toggleButton',
      ) as HTMLElement;
      expect(toggleButton).to.exist;

      toggleButton.click();
      await container.updateComplete;
      expect(container.expanded).to.be.true;

      const daContainers =
        container.shadowRoot?.querySelectorAll('da-container') ?? [];
      expect(daContainers.length).to.equal(2);

      const doContainers =
        container.shadowRoot?.querySelectorAll('do-container') ?? [];
      expect(doContainers.length).to.equal(0);
    });
  });
});
