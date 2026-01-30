import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { DaiValueDialog } from './dai-value-dialog.js';
import { DaiValueField } from './dai-value-field.js';
import { DaiTimestampField } from './dai-timestamp-field.js';
import { parseDoc, testDocs } from '../../test-utils/test-files.js';
import { getFirstAndAssertBySelector } from '../../test-utils/queries.js';
import { getAncestors } from '../../test-utils/test-harness.js';

if (!customElements.get('dai-value-dialog')) {
  customElements.define('dai-value-dialog', DaiValueDialog);
}

function getOscdDialog(element: HTMLElement): OscdDialog | null {
  return element.shadowRoot?.querySelector('oscd-dialog') ?? null;
}

function buildDaiElement(
  doc: XMLDocument,
  name: string,
  values: Array<{ value: string; sGroup?: number }>,
): Element {
  const namespace =
    doc.documentElement.namespaceURI ?? 'http://www.iec.ch/61850/2003/SCL';
  const daiElement = doc.createElementNS(namespace, 'DAI');
  daiElement.setAttribute('name', name);
  values.forEach(({ value, sGroup }) => {
    const valElement = doc.createElementNS(namespace, 'Val');
    valElement.textContent = value;
    if (sGroup) {
      valElement.setAttribute('sGroup', `${sGroup}`);
    }
    daiElement.append(valElement);
  });
  return daiElement;
}

describe('dai-value-dialog', () => {
  it('opens and renders template value', async () => {
    const doc = parseDoc(testDocs.withIED);
    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType[id="Beh_Test"] > DA[name="stVal"]',
    );
    const doElement = getFirstAndAssertBySelector(
      doc,
      'LNodeType[id="PlaceholderLLN0"] > DO[name="Beh"]',
    );
    const ancestors = [
      ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN0']),
      doElement,
    ];
    const templateVal = doc.createElementNS(
      doc.documentElement.namespaceURI ?? 'http://www.iec.ch/61850/2003/SCL',
      'Val',
    );
    templateVal.textContent = 'off';
    daElement.append(templateVal);

    const dialog = await fixture<DaiValueDialog>(
      html`<dai-value-dialog></dai-value-dialog>`,
    );

    dialog.templateElement = daElement;
    dialog.instanceElement = null;
    dialog.ancestors = ancestors;
    dialog.show();

    const oscdDialog = getOscdDialog(dialog);
    expect(oscdDialog).to.exist;
    await waitUntil(() => oscdDialog?.open === true);

    const templateField = dialog.shadowRoot?.querySelector(
      'oscd-filled-text-field[label="DA template value"]',
    ) as OscdFilledTextField | null;
    expect(templateField).to.exist;
    expect(templateField?.value).to.equal('off');
  });

  it('renders enum values and selected value', async () => {
    const doc = parseDoc(testDocs.withIED);
    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType[id="Beh_Test"] > DA[name="stVal"]',
    );
    const doElement = getFirstAndAssertBySelector(
      doc,
      'LNodeType[id="PlaceholderLLN0"] > DO[name="Beh"]',
    );
    const ancestors = [
      ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN0']),
      doElement,
    ];
    const daiElement = buildDaiElement(doc, 'stVal', [{ value: 'off' }]);

    const dialog = await fixture<DaiValueDialog>(
      html`<dai-value-dialog></dai-value-dialog>`,
    );

    dialog.templateElement = daElement;
    dialog.instanceElement = daiElement;
    dialog.ancestors = ancestors;
    dialog.show();

    const oscdDialog = getOscdDialog(dialog);
    expect(oscdDialog).to.exist;
    await waitUntil(() => oscdDialog?.open === true);

    const field = dialog.shadowRoot?.querySelector(
      'dai-value-field',
    ) as DaiValueField | null;
    expect(field).to.exist;
    expect(field?.value).to.equal('off');
    expect(field?.enumValues).to.deep.equal(['on', 'off']);
  });

  it('renders multiple setting group fields', async () => {
    const doc = parseDoc(testDocs.withIED_instanciated);
    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType[id="ARtg_Test"] > DA[name="setVal"]',
    );
    const doElement = getFirstAndAssertBySelector(
      doc,
      'LNodeType[id="TCTR_Test"] > DO[name="ARtg"]',
    );
    const daiElement = getFirstAndAssertBySelector(
      doc,
      'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"] > DAI[name="setVal"]',
    );
    const ancestors = [
      ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN']),
      doElement,
    ];

    const dialog = await fixture<DaiValueDialog>(
      html`<dai-value-dialog></dai-value-dialog>`,
    );

    dialog.templateElement = daElement;
    dialog.instanceElement = daiElement;
    dialog.ancestors = ancestors;
    dialog.show();

    const oscdDialog = getOscdDialog(dialog);
    expect(oscdDialog).to.exist;
    await waitUntil(() => oscdDialog?.open === true);

    const fields = Array.from(
      dialog.shadowRoot?.querySelectorAll('dai-value-field') ?? [],
    ) as DaiValueField[];
    expect(fields.length).to.equal(2);
    expect(fields[0].label).to.equal('Val for sGroup 1');
    expect(fields[1].label).to.equal('Val for sGroup 2');
    expect(fields[0].value).to.equal('10');
    expect(fields[1].value).to.equal('12');
  });

  it('confirms updated values', async () => {
    const doc = parseDoc(testDocs.withIED);
    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType[id="Beh_Test"] > DA[name="stVal"]',
    );
    const doElement = getFirstAndAssertBySelector(
      doc,
      'LNodeType[id="PlaceholderLLN0"] > DO[name="Beh"]',
    );
    const ancestors = [
      ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN0']),
      doElement,
    ];
    const daiElement = buildDaiElement(doc, 'stVal', [{ value: 'on' }]);

    const dialog = await fixture<DaiValueDialog>(
      html`<dai-value-dialog></dai-value-dialog>`,
    );

    dialog.templateElement = daElement;
    dialog.instanceElement = daiElement;
    dialog.ancestors = ancestors;
    dialog.show();

    const oscdDialog = getOscdDialog(dialog);
    expect(oscdDialog).to.exist;
    await waitUntil(() => oscdDialog?.open === true);

    let lastEdit: unknown = null;
    dialog.addEventListener('oscd-edit-v2', event => {
      lastEdit = (event as CustomEvent<{ edit: unknown }>).detail.edit;
    });

    const field = dialog.shadowRoot?.querySelector(
      'dai-value-field',
    ) as DaiValueField | null;
    expect(field).to.exist;
    field!.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: 'off', sGroup: null },
        bubbles: true,
        composed: true,
      }),
    );

    const saveButton = dialog.shadowRoot?.querySelector(
      'oscd-filled-button[slot="primaryAction"]',
    ) as HTMLElement | null;
    expect(saveButton).to.exist;
    saveButton!.click();

    expect(Array.isArray(lastEdit)).to.equal(true);
    const edits = lastEdit as Array<{ parent?: unknown; node?: Element }>;
    const inserted = edits.find(edit => edit.parent === daiElement);
    expect(inserted).to.exist;
    expect(inserted!.node?.textContent).to.equal('off');
  });

  it('confirms timestamp values with normalized time', async () => {
    const doc = parseDoc(testDocs.withIED);
    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType[id="Beh_Test"] > DA[name="t"]',
    );
    const doElement = getFirstAndAssertBySelector(
      doc,
      'LNodeType[id="PlaceholderLLN0"] > DO[name="Beh"]',
    );
    const ancestors = [
      ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN0']),
      doElement,
    ];
    const daiElement = buildDaiElement(doc, 't', [
      { value: '2020-01-01T00:00:00.000' },
    ]);

    const dialog = await fixture<DaiValueDialog>(
      html`<dai-value-dialog></dai-value-dialog>`,
    );

    dialog.templateElement = daElement;
    dialog.instanceElement = daiElement;
    dialog.ancestors = ancestors;
    dialog.show();

    const oscdDialog = getOscdDialog(dialog);
    expect(oscdDialog).to.exist;
    await waitUntil(() => oscdDialog?.open === true);

    const timestampField = dialog.shadowRoot?.querySelector(
      'dai-timestamp-field',
    ) as DaiTimestampField | null;
    expect(timestampField).to.exist;

    let lastEdit: unknown = null;
    dialog.addEventListener('oscd-edit-v2', event => {
      lastEdit = (event as CustomEvent<{ edit: unknown }>).detail.edit;
    });

    timestampField!.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          value: '2024-05-06T12:34:56.000',
          dateValue: '2024-05-06',
          timeValue: '12:34:56',
          sGroup: null,
        },
        bubbles: true,
        composed: true,
      }),
    );

    const saveButton = dialog.shadowRoot?.querySelector(
      'oscd-filled-button[slot="primaryAction"]',
    ) as HTMLElement | null;
    expect(saveButton).to.exist;
    saveButton!.click();

    expect(Array.isArray(lastEdit)).to.equal(true);
    const edits = lastEdit as Array<{ parent?: unknown; node?: Element }>;
    const inserted = edits.find(edit => edit.parent === daiElement);
    expect(inserted).to.exist;
    expect(inserted!.node?.textContent).to.equal('2024-05-06T12:34:56.000');
  });
});
