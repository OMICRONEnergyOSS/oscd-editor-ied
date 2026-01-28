/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, fixture, html } from '@open-wc/testing';
import { DAContainer } from './da-container.js';
import { Nsdoc } from '../../foundation/nsdoc.js';
import { parseDoc, testDocs } from '../../test-utils/test-files.js';
import { getFirstAndAssertBySelector } from '../../test-utils/queries.js';
import { getAncestors } from '../../test-utils/test-harness.js';
import {
  determineUninitializedStructure,
  initializeElements,
} from '../../foundation/dai.js';
import { createElement } from '@openscd/scl-lib/dist/foundation/utils.js';

customElements.define('da-container', DAContainer);

const nsdocStub: Nsdoc = {
  getDataDescription: (element: Element) => ({
    label: `${element.tagName}-label`,
  }),
};

function createDaiInstance(
  parentLn: Element,
  doElement: Element,
  daElement: Element,
): Element {
  const [parent, templateStructure] = determineUninitializedStructure(
    parentLn,
    [doElement, daElement],
  );
  const created = initializeElements(templateStructure);
  parent.appendChild(created);

  if (created.tagName === 'DAI') {
    return created;
  }
  const dai = created.querySelector('DAI');
  if (!dai) {
    throw new Error('Expected DAI element to be created for DA template');
  }
  return dai;
}

describe('da-container', () => {
  describe('info dialog', () => {
    it('correct properties are set when DA has no instance element', async () => {
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

    it('correct properties are set when DA has an instance element', async () => {
      const doc = parseDoc(testDocs.withIED_instanciated);

      const daElement = getFirstAndAssertBySelector(
        doc,
        'DOType > DA[name="stVal"]',
      );
      const doElement = getFirstAndAssertBySelector(doc, 'LNodeType > DO');
      const ln0Element = getFirstAndAssertBySelector(doc, 'LN0');
      const daiElement = createDaiInstance(ln0Element, doElement, daElement);

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

      let opened = false;
      const originalShow = infoDialog!.show;
      infoDialog.show = () => {
        opened = true;
        originalShow.call(infoDialog);
      };

      const nsdocLabel = nsdocStub.getDataDescription(
        daElement,
        ancestors,
      ).label;
      const infoButton = container.shadowRoot?.querySelector(
        `oscd-icon-button[title="${nsdocLabel}"]`,
      ) as HTMLElement | null;
      expect(infoButton).to.exist;
      infoButton!.click();

      expect(opened).to.equal(true);
    });
  });

  describe('non-Struct DA rendering', () => {
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
      const ln0Element = getFirstAndAssertBySelector(doc, 'LN0');
      const daiElement = createDaiInstance(ln0Element, doElement, daElement);
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
      const ln0Element = getFirstAndAssertBySelector(doc, 'LN0');
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

      const daiElement = createDaiInstance(ln0Element, doElement, daElement);
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
  });

  describe('Struct DA rendering', () => {
    it('renders BDA containers when expanded for Struct DA', async () => {
      const doc = parseDoc(testDocs.withIED_instanciated);
      const doType = getFirstAndAssertBySelector(
        doc,
        'DOType[id="Beh$oscd$_c6ed035c8137b35a"]',
      );
      const structDa = createElement(doc, 'DA', {
        name: 'setVal',
        fc: 'ST',
        bType: 'Struct',
        type: 'SetType',
      });
      doType.appendChild(structDa);

      const daType = createElement(doc, 'DAType', { id: 'SetType' });
      const bda = createElement(doc, 'BDA', { name: 'sub1', bType: 'Enum' });
      daType.appendChild(bda);
      const templates = getFirstAndAssertBySelector(doc, 'DataTypeTemplates');
      templates.appendChild(daType);

      const doElement = getFirstAndAssertBySelector(doc, 'LNodeType > DO');
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

    it('does not render BDA containers when collapsed', async () => {
      const doc = parseDoc(testDocs.withIED_instanciated);
      const doType = getFirstAndAssertBySelector(
        doc,
        'DOType[id="Beh$oscd$_c6ed035c8137b35a"]',
      );
      const structDa = createElement(doc, 'DA', {
        name: 'setVal',
        fc: 'ST',
        bType: 'Struct',
        type: 'SetType',
      });
      doType.appendChild(structDa);

      const daType = createElement(doc, 'DAType', { id: 'SetType' });
      const bda = createElement(doc, 'BDA', { name: 'sub1', bType: 'Enum' });
      daType.appendChild(bda);
      const templates = getFirstAndAssertBySelector(doc, 'DataTypeTemplates');
      templates.appendChild(daType);

      const doElement = getFirstAndAssertBySelector(doc, 'LNodeType > DO');
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

  describe('DAI create/edit flows', () => {
    it('creates missing DOI/SDI/DAI and inserts Val(s)', async () => {
      const doc = parseDoc(testDocs.withIED);
      const daElement = getFirstAndAssertBySelector(
        doc,
        'DOType > DA[name="stVal"]',
      );
      const doElement = getFirstAndAssertBySelector(doc, 'LNodeType > DO');
      const ln0Element = getFirstAndAssertBySelector(doc, 'LN0');
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

      const daiDialog = container.shadowRoot?.querySelector(
        'dai-value-dialog',
      ) as { show: (data: any) => void } | null;
      expect(daiDialog).to.exist;

      let dialogData: any = null;
      daiDialog!.show = (data: any) => {
        dialogData = data;
      };

      let lastEdit: any = null;
      container.addEventListener('oscd-edit-v2', event => {
        lastEdit = (event as CustomEvent).detail.edit;
      });

      const addButton = Array.from(
        container.shadowRoot?.querySelectorAll('oscd-icon-button') ?? [],
      ).find(
        button =>
          button.querySelector('oscd-icon')?.textContent?.trim() === 'add',
      ) as HTMLElement | undefined;
      expect(addButton).to.exist;
      addButton!.click();

      expect(dialogData).to.exist;
      dialogData.onConfirm(['on']);

      expect(lastEdit).to.exist;
      expect(lastEdit.parent).to.equal(ln0Element);
      const insertedDai = lastEdit.node.querySelector('DAI[name="stVal"]');
      expect(insertedDai).to.exist;
      const val = insertedDai?.querySelector('Val');
      expect(val?.textContent).to.equal('on');
    });

    it('edits existing DAI values (single Val)', async () => {
      const doc = parseDoc(testDocs.withIED_instanciated);
      const daElement = getFirstAndAssertBySelector(
        doc,
        'DOType > DA[name="stVal"]',
      );
      const doElement = getFirstAndAssertBySelector(doc, 'LNodeType > DO');
      const ln0Element = getFirstAndAssertBySelector(doc, 'LN0');

      const defaultVal = doc.createElementNS(
        doc.documentElement.namespaceURI,
        'Val',
      );
      defaultVal.textContent = 'old';
      daElement.appendChild(defaultVal);

      const daiElement = createDaiInstance(ln0Element, doElement, daElement);
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

      const daiDialog = container.shadowRoot?.querySelector(
        'dai-value-dialog',
      ) as { show: (data: any) => void } | null;
      expect(daiDialog).to.exist;

      let dialogData: any = null;
      daiDialog!.show = (data: any) => {
        dialogData = data;
      };

      let lastEdit: any = null;
      container.addEventListener('oscd-edit-v2', event => {
        lastEdit = (event as CustomEvent).detail.edit;
      });

      const editButton = Array.from(
        container.shadowRoot?.querySelectorAll('oscd-icon-button') ?? [],
      ).find(
        button =>
          button.querySelector('oscd-icon')?.textContent?.trim() === 'edit',
      ) as HTMLElement | undefined;
      expect(editButton).to.exist;
      editButton!.click();

      expect(dialogData).to.exist;
      dialogData.onConfirm(['new']);

      expect(Array.isArray(lastEdit)).to.equal(true);
      const edits = lastEdit as Array<any>;
      expect(edits.length).to.equal(2);
      const removed = edits.find(edit => edit.node?.tagName === 'Val');
      const inserted = edits.find(edit => edit.parent === daiElement);
      expect(removed).to.exist;
      expect(inserted).to.exist;
      expect(inserted.node?.tagName).to.equal('Val');
      expect(inserted.node?.textContent).to.equal('new');
    });

    it('edits multiple setting group values', async () => {
      const doc = parseDoc(testDocs.withIED_instanciated);
      const ied = getFirstAndAssertBySelector(doc, 'IED');
      const settingControl = createElement(doc, 'SettingControl', {
        numOfSGs: '2',
      });
      ied.appendChild(settingControl);

      const daElement = getFirstAndAssertBySelector(
        doc,
        'DOType > DA[name="stVal"]',
      );
      daElement.setAttribute('fc', 'SG');
      const doElement = getFirstAndAssertBySelector(doc, 'LNodeType > DO');
      const ln0Element = getFirstAndAssertBySelector(doc, 'LN0');

      const daiElement = createDaiInstance(ln0Element, doElement, daElement);
      Array.from(daiElement.querySelectorAll('Val')).forEach(val =>
        val.remove(),
      );
      const val1 = doc.createElementNS(doc.documentElement.namespaceURI, 'Val');
      val1.setAttribute('sGroup', '1');
      val1.textContent = 'v1';
      const val2 = doc.createElementNS(doc.documentElement.namespaceURI, 'Val');
      val2.setAttribute('sGroup', '2');
      val2.textContent = 'v2';
      daiElement.appendChild(val1);
      daiElement.appendChild(val2);

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

      const daiDialog = container.shadowRoot?.querySelector(
        'dai-value-dialog',
      ) as { show: (data: any) => void } | null;
      expect(daiDialog).to.exist;

      let dialogData: any = null;
      daiDialog!.show = (data: any) => {
        dialogData = data;
      };

      const editButton = Array.from(
        container.shadowRoot?.querySelectorAll('oscd-icon-button') ?? [],
      ).find(
        button =>
          button.querySelector('oscd-icon')?.textContent?.trim() === 'edit',
      ) as HTMLElement | undefined;
      expect(editButton).to.exist;
      editButton!.click();

      expect(dialogData).to.exist;
      expect(dialogData.multipleSettings).to.equal(2);
      expect(dialogData.values).to.deep.equal(['v1', 'v2']);
    });
  });

  describe('enum handling', () => {
    it('provides enum values sorted by ord', async () => {
      const doc = parseDoc(testDocs.withIED);
      const daElement = getFirstAndAssertBySelector(
        doc,
        'DOType > DA[name="stVal"]',
      );
      const doElement = getFirstAndAssertBySelector(doc, 'LNodeType > DO');

      const enumType = createElement(doc, 'EnumType', { id: 'Enum_Test' });
      const enumValB = createElement(doc, 'EnumVal', { ord: '2' });
      enumValB.textContent = 'b';
      const enumValA = createElement(doc, 'EnumVal', { ord: '1' });
      enumValA.textContent = 'a';
      enumType.appendChild(enumValB);
      enumType.appendChild(enumValA);
      const templates = getFirstAndAssertBySelector(doc, 'DataTypeTemplates');
      templates.appendChild(enumType);

      daElement.setAttribute('type', 'Enum_Test');

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

      const daiDialog = container.shadowRoot?.querySelector(
        'dai-value-dialog',
      ) as { show: (data: any) => void } | null;
      expect(daiDialog).to.exist;

      let dialogData: any = null;
      daiDialog!.show = (data: any) => {
        dialogData = data;
      };

      const addButton = Array.from(
        container.shadowRoot?.querySelectorAll('oscd-icon-button') ?? [],
      ).find(
        button =>
          button.querySelector('oscd-icon')?.textContent?.trim() === 'add',
      ) as HTMLElement | undefined;
      expect(addButton).to.exist;
      addButton!.click();

      expect(dialogData).to.exist;
      expect(dialogData.enumValues).to.deep.equal(['a', 'b']);
    });
  });
});
