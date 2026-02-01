import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { DaiValueCreateDialog } from './dai-value-create-dialog.js';
import { DaiValueField } from './fields/dai-value-field.js';
import { parseDoc, testDocs } from '../../test-utils/test-files.js';
import { getFirstAndAssertBySelector } from '../../test-utils/queries.js';
import { getAncestors } from '../../test-utils/test-harness.js';

if (!customElements.get('dai-value-create-dialog')) {
  customElements.define('dai-value-create-dialog', DaiValueCreateDialog);
}

function getOscdDialog(element: HTMLElement): OscdDialog | null {
  return element.shadowRoot?.querySelector('oscd-dialog') ?? null;
}

describe('dai-value-create-dialog', () => {
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

    const dialog = await fixture<DaiValueCreateDialog>(
      html`<dai-value-create-dialog></dai-value-create-dialog>`,
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

  it('creates values and inserts the DAI structure', async () => {
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
    const lnElement = ancestors.find(element =>
      ['LN0', 'LN'].includes(element.tagName),
    );

    const dialog = await fixture<DaiValueCreateDialog>(
      html`<dai-value-create-dialog></dai-value-create-dialog>`,
    );

    dialog.templateElement = daElement;
    dialog.instanceElement = null;
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
        detail: { value: 'on', sGroup: null },
        bubbles: true,
        composed: true,
      }),
    );

    const saveButton = dialog.shadowRoot?.querySelector(
      'oscd-filled-button[slot="primaryAction"]',
    ) as HTMLElement | null;
    expect(saveButton).to.exist;
    saveButton!.click();

    expect(Array.isArray(lastEdit)).to.equal(false);
    const edit = lastEdit as { parent?: Element; node?: Element };
    expect(edit.parent).to.equal(lnElement);
    const insertedDai = edit.node?.querySelector('DAI');
    expect(insertedDai).to.exist;
    expect(insertedDai?.querySelector('Val')?.textContent).to.equal('on');
  });

  it('handles sparse sGroups when numOfSGs exceeds existing values', async () => {
    const doc = parseDoc(testDocs.withIED_instanciated);
    const settingControl = getFirstAndAssertBySelector(
      doc,
      'IED[name="IED1"] SettingControl',
    );
    settingControl.setAttribute('numOfSGs', '5');
    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType[id="ARtg_Test"] > DA[name="setVal"]',
    );
    const doElement = getFirstAndAssertBySelector(
      doc,
      'LNodeType[id="TCTR_Test"] > DO[name="ARtg"]',
    );
    const ancestors = [
      ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN']),
      doElement,
    ];
    const daiElement = getFirstAndAssertBySelector(
      doc,
      'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"] > DAI[name="setVal"]',
    );
    const namespace =
      doc.documentElement.namespaceURI ?? 'http://www.iec.ch/61850/2003/SCL';
    Array.from(daiElement.querySelectorAll('Val')).forEach(val => val.remove());
    const val1 = doc.createElementNS(namespace, 'Val');
    val1.setAttribute('sGroup', '1');
    val1.textContent = '10';
    const val3 = doc.createElementNS(namespace, 'Val');
    val3.setAttribute('sGroup', '3');
    val3.textContent = '30';
    const val5 = doc.createElementNS(namespace, 'Val');
    val5.setAttribute('sGroup', '5');
    val5.textContent = '50';
    daiElement.append(val1, val3, val5);

    const dialog = await fixture<DaiValueCreateDialog>(
      html`<dai-value-create-dialog></dai-value-create-dialog>`,
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
    expect(fields.length).to.equal(5);
    expect(fields[0].value).to.equal('10');
    expect(fields[1].value).to.equal('');
    expect(fields[2].value).to.equal('30');
    expect(fields[3].value).to.equal('');
    expect(fields[4].value).to.equal('50');

    let lastEdit: unknown = null;
    dialog.addEventListener('oscd-edit-v2', event => {
      lastEdit = (event as CustomEvent<{ edit: unknown }>).detail.edit;
    });

    fields[1].dispatchEvent(
      new CustomEvent('change', {
        detail: { value: '20', sGroup: 2 },
        bubbles: true,
        composed: true,
      }),
    );
    fields[3].dispatchEvent(
      new CustomEvent('change', {
        detail: { value: '40', sGroup: 4 },
        bubbles: true,
        composed: true,
      }),
    );

    const saveButton = dialog.shadowRoot?.querySelector(
      'oscd-filled-button[slot="primaryAction"]',
    ) as HTMLElement | null;
    expect(saveButton).to.exist;
    saveButton!.click();

    const edits = lastEdit as Array<{
      parent?: Element;
      node?: Element;
      reference?: Element | null;
    }>;
    const inserted = edits.filter(edit => edit.parent === daiElement);
    expect(inserted.length).to.equal(5);
    const valuesByGroup = new Map(
      inserted.map(edit => [
        edit.node?.getAttribute('sGroup') ?? '',
        edit.node?.textContent ?? '',
      ]),
    );
    expect(valuesByGroup.get('1')).to.equal('10');
    expect(valuesByGroup.get('2')).to.equal('20');
    expect(valuesByGroup.get('3')).to.equal('30');
    expect(valuesByGroup.get('4')).to.equal('40');
    expect(valuesByGroup.get('5')).to.equal('50');
  });
});
