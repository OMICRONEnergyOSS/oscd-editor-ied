import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { DaiValueEditDialog } from './dai-value-edit-dialog.js';
import { DaiValueField } from './fields/dai-value-field.js';
import { DaiTimestampField } from './fields/dai-timestamp-field.js';
import { parseDoc, testDocs } from '../../test-utils/test-files.js';
import { getFirstAndAssertBySelector } from '../../test-utils/queries.js';

if (!customElements.get('dai-value-edit-dialog')) {
  customElements.define('dai-value-edit-dialog', DaiValueEditDialog);
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

describe('dai-value-edit-dialog', () => {
  it('renders enum values and selected value', async () => {
    const doc = parseDoc(testDocs.withIED);
    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType[id="Beh_Test"] > DA[name="stVal"]',
    );
    const daiElement = buildDaiElement(doc, 'stVal', [{ value: 'off' }]);

    const dialog = await fixture<DaiValueEditDialog>(
      html`<dai-value-edit-dialog></dai-value-edit-dialog>`,
    );

    dialog.templateElement = daElement;
    dialog.instanceElement = daiElement;
    dialog.valElement = daiElement.querySelector('Val');
    dialog.enumValues = ['on', 'blocked', 'test', 'test/blocked', 'off'];
    dialog.show();

    const oscdDialog = getOscdDialog(dialog);
    expect(oscdDialog).to.exist;
    await waitUntil(() => oscdDialog?.open === true);

    const field = dialog.shadowRoot?.querySelector(
      'dai-value-field',
    ) as DaiValueField | null;
    expect(field).to.exist;
    expect(field?.value).to.equal('off');
    expect(field?.enumValues).to.deep.equal([
      'on',
      'blocked',
      'test',
      'test/blocked',
      'off',
    ]);
  });

  it('confirms updated values for the provided Val', async () => {
    const doc = parseDoc(testDocs.withIED);
    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType[id="Beh_Test"] > DA[name="stVal"]',
    );
    const daiElement = buildDaiElement(doc, 'stVal', [{ value: 'on' }]);

    const dialog = await fixture<DaiValueEditDialog>(
      html`<dai-value-edit-dialog></dai-value-edit-dialog>`,
    );

    dialog.templateElement = daElement;
    dialog.instanceElement = daiElement;
    const valElement = daiElement.querySelector('Val');
    dialog.valElement = valElement;
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
    const edits = lastEdit as Array<{
      parent?: Element;
      node?: Element;
      reference?: Element | null;
    }>;
    const removed = edits.find(edit => edit.node === valElement);
    expect(removed).to.exist;
    const inserted = edits.find(edit => edit.parent === daiElement);
    expect(inserted).to.exist;
    expect(inserted!.node?.textContent).to.equal('off');
  });

  it('targets the provided sGroup Val when multiple exist', async () => {
    const doc = parseDoc(testDocs.withIED_instanciated);
    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType[id="ARtg_Test"] > DA[name="setVal"]',
    );
    const daiElement = getFirstAndAssertBySelector(
      doc,
      'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"] > DAI[name="setVal"]',
    );
    Array.from(daiElement.querySelectorAll('Val'))
      .filter(val => val.getAttribute('sGroup') === '2')
      .forEach(val => val.remove());
    const val1 = daiElement.querySelector('Val[sGroup="1"]')!;
    const val3 = daiElement.querySelector('Val[sGroup="3"]')!;

    const dialog = await fixture<DaiValueEditDialog>(
      html`<dai-value-edit-dialog></dai-value-edit-dialog>`,
    );

    dialog.templateElement = daElement;
    dialog.instanceElement = daiElement;
    dialog.valElement = val3;
    dialog.sGroup = 3;
    dialog.show();

    const oscdDialog = getOscdDialog(dialog);
    expect(oscdDialog).to.exist;
    await waitUntil(() => oscdDialog?.open === true);

    const field = dialog.shadowRoot?.querySelector(
      'dai-value-field',
    ) as DaiValueField | null;
    expect(field).to.exist;
    expect(field?.value).to.equal(val3.textContent?.trim());

    let lastEdit: unknown = null;
    dialog.addEventListener('oscd-edit-v2', event => {
      lastEdit = (event as CustomEvent<{ edit: unknown }>).detail.edit;
    });

    field!.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: '33', sGroup: null },
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
    expect(edits.find(edit => edit.node === val1)).to.not.exist;
    expect(edits.find(edit => edit.node === val3)).to.exist;
    const inserted = edits.find(edit => edit.parent === daiElement);
    expect(inserted).to.exist;
    expect(inserted!.node?.getAttribute('sGroup')).to.equal('3');
    expect(inserted!.node?.textContent).to.equal('33');
  });

  it('opens with the provided sGroup value when Val is missing', async () => {
    const doc = parseDoc(testDocs.withIED_instanciated);
    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType[id="ARtg_Test"] > DA[name="setVal"]',
    );
    const daiElement = getFirstAndAssertBySelector(
      doc,
      'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"] > DAI[name="setVal"]',
    );

    const dialog = await fixture<DaiValueEditDialog>(
      html`<dai-value-edit-dialog></dai-value-edit-dialog>`,
    );

    dialog.templateElement = daElement;
    dialog.instanceElement = daiElement;
    dialog.valElement = null;
    dialog.sGroup = 3;
    dialog.show();

    const oscdDialog = getOscdDialog(dialog);
    expect(oscdDialog).to.exist;
    await waitUntil(() => oscdDialog?.open === true);

    const field = dialog.shadowRoot?.querySelector(
      'dai-value-field',
    ) as DaiValueField | null;
    expect(field).to.exist;
    expect(field?.value).to.equal('');
  });

  it('inserts a new sGroup Val when missing', async () => {
    const doc = parseDoc(testDocs.withIED_instanciated);
    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType[id="ARtg_Test"] > DA[name="setVal"]',
    );
    const daiElement = getFirstAndAssertBySelector(
      doc,
      'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"] > DAI[name="setVal"]',
    );
    Array.from(daiElement.querySelectorAll('Val'))
      .filter(val => val.getAttribute('sGroup') === '2')
      .forEach(val => val.remove());

    const dialog = await fixture<DaiValueEditDialog>(
      html`<dai-value-edit-dialog></dai-value-edit-dialog>`,
    );

    dialog.templateElement = daElement;
    dialog.instanceElement = daiElement;
    dialog.valElement = null;
    dialog.sGroup = 2;
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
        detail: { value: '22', sGroup: null },
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
    const inserted = edits.find(edit => edit.parent === daiElement);
    expect(inserted).to.exist;
    expect(inserted!.node?.getAttribute('sGroup')).to.equal('2');
    expect(inserted!.node?.textContent).to.equal('22');
  });

  it('inserts missing sGroup before the next larger group', async () => {
    const doc = parseDoc(testDocs.withIED_instanciated);
    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType[id="ARtg_Test"] > DA[name="setVal"]',
    );
    const daiElement = getFirstAndAssertBySelector(
      doc,
      'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"] > DAI[name="setVal"]',
    );
    Array.from(daiElement.querySelectorAll('Val'))
      .filter(val => val.getAttribute('sGroup') === '2')
      .forEach(val => val.remove());
    const val3 = daiElement.querySelector('Val[sGroup="3"]')!;

    const dialog = await fixture<DaiValueEditDialog>(
      html`<dai-value-edit-dialog></dai-value-edit-dialog>`,
    );

    dialog.templateElement = daElement;
    dialog.instanceElement = daiElement;
    dialog.valElement = null;
    dialog.sGroup = 2;
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
        detail: { value: '21', sGroup: null },
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
    const inserted = edits.find(edit => edit.parent === daiElement);
    expect(inserted).to.exist;
    expect(inserted!.reference).to.equal(val3);
  });

  it('confirms timestamp values with normalized time', async () => {
    const doc = parseDoc(testDocs.withIED);
    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType[id="Beh_Test"] > DA[name="t"]',
    );
    const daiElement = buildDaiElement(doc, 't', [
      { value: '2020-01-01T00:00:00.000' },
    ]);

    const dialog = await fixture<DaiValueEditDialog>(
      html`<dai-value-edit-dialog></dai-value-edit-dialog>`,
    );

    dialog.templateElement = daElement;
    dialog.instanceElement = daiElement;
    dialog.valElement = daiElement.querySelector('Val');
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
