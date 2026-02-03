import {
  expect,
  fixture as openWcFixture,
  html,
  waitUntil,
} from '@open-wc/testing';
import type { TemplateResult } from 'lit';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { DaiValueEditDialog } from './dai-value-edit-dialog.js';
import { DaiValueField } from './fields/dai-value-field.js';
import { DaiTimestampField } from './fields/dai-timestamp-field.js';
import { parseDoc, testDocs } from '../../test-utils/test-files.js';
import { getFirstAndAssertBySelector } from '../../test-utils/queries.js';
import { Commit, CommitOptions, EditV2, XMLEditor } from '@openscd/oscd-editor';
import Sinon from 'sinon';
import { createElement } from '@openscd/scl-lib/dist/foundation/utils.js';

const enumValues = ['on', 'blocked', 'test', 'test/blocked', 'off'];

if (!customElements.get('dai-value-edit-dialog')) {
  customElements.define('dai-value-edit-dialog', DaiValueEditDialog);
}

function getOscdDialog(element: HTMLElement): OscdDialog | null {
  return element.shadowRoot?.querySelector('oscd-dialog') ?? null;
}

function buildDaiElement(
  doc: XMLDocument,
  name: string,
  values: { value: string; sGroup?: number }[],
): Element {
  const daiElement = createElement(doc, 'DAI', { name });
  values.forEach(({ value, sGroup }) => {
    const valElement = createElement(doc, 'Val', {
      ...(sGroup ? { sGroup: `${sGroup}` } : {}),
    });
    valElement.textContent = value;
    daiElement.append(valElement);
  });
  return daiElement;
}

describe('dai-value-edit-dialog', () => {
  let xmlEditor: XMLEditor;
  let dialog: DaiValueEditDialog;
  let editSpy: Sinon.SinonSpy<
    [edit: EditV2, options?: CommitOptions],
    Commit<EditV2>
  >;

  const handleEditEvent = (event: Event) => {
    const editEvent = event as CustomEvent<{ edit: EditV2 }>;
    xmlEditor.commit(editEvent.detail.edit);
  };

  beforeEach(() => {
    xmlEditor = new XMLEditor();
    editSpy = Sinon.spy(xmlEditor, 'commit');
  });

  afterEach(() => {
    dialog.removeEventListener('oscd-edit-v2', handleEditEvent);
    dialog.remove();
    editSpy.restore();
  });

  const fixture = async (template: TemplateResult) => {
    dialog = await openWcFixture<DaiValueEditDialog>(template);
    dialog.addEventListener('oscd-edit-v2', handleEditEvent);
    return dialog;
  };

  it('renders enum values and selected value', async () => {
    const doc = parseDoc(testDocs.withIED);
    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType[id="Beh_Test"] > DA[name="stVal"]',
    );
    const daiElement = buildDaiElement(doc, 'stVal', [{ value: 'off' }]);

    const dialog = await fixture(
      html`<dai-value-edit-dialog
        .templateElement=${daElement}
        .instanceElement=${daiElement}
        .enumValues=${enumValues}
        .valElement=${daiElement.querySelector('Val')}
      ></dai-value-edit-dialog>`,
    );

    dialog.show();

    const oscdDialog = getOscdDialog(dialog);
    expect(oscdDialog).to.exist;
    await waitUntil(() => oscdDialog?.open === true);

    const field = dialog.shadowRoot?.querySelector(
      'dai-value-field',
    ) as DaiValueField | null;
    expect(field).to.exist;
    expect(field?.value).to.equal('off');
    expect(field?.enumValues).to.deep.equal(enumValues);
  });

  it('confirms updated values for the provided Val', async () => {
    const doc = parseDoc(testDocs.withIED);
    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType[id="Beh_Test"] > DA[name="stVal"]',
    );
    const daiElement = doc.querySelector(
      'IED[name="IED1"] LN0 > DOI[name="Beh"] > DAI[name="stVal"]',
    )!;

    const valElement = daiElement.querySelector('Val');
    expect(valElement?.textContent).to.equal('on');

    const dialog = await fixture(
      html`<dai-value-edit-dialog
        .templateElement=${daElement}
        .instanceElement=${daiElement}
        .valElement=${valElement}
        .enumValues=${enumValues}
      ></dai-value-edit-dialog>`,
    );
    dialog.show();

    const oscdDialog = getOscdDialog(dialog);
    expect(oscdDialog).to.exist;
    await waitUntil(() => oscdDialog?.open === true);

    const field = dialog.shadowRoot?.querySelector(
      'dai-value-field',
    ) as DaiValueField | null;
    expect(field).to.exist;
    field!.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: 'off' },
        bubbles: true,
        composed: true,
      }),
    );

    const saveButton = dialog.shadowRoot?.querySelector(
      'oscd-filled-button[slot="primaryAction"]',
    ) as HTMLElement | null;
    expect(saveButton).to.exist;
    saveButton!.click();

    await waitUntil(() => oscdDialog?.open === false, 'dialog did not close');
    await dialog.updateComplete;

    expect(editSpy.calledOnce).to.be.true;
    expect(
      doc.querySelector(
        'IED[name="IED1"] LN0 > DOI[name="Beh"] > DAI[name="stVal"] > Val',
      )?.textContent,
    ).to.equal('off');
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

    const val1 = daiElement.querySelector('Val[sGroup="1"]')!;
    const val2 = daiElement.querySelector('Val[sGroup="2"]')!;

    const dialog = await fixture(
      html`<dai-value-edit-dialog
        .templateElement=${daElement}
        .instanceElement=${daiElement}
        .valElement=${val2}
        .sGroup=${2}
      ></dai-value-edit-dialog>`,
    );

    dialog.show();

    const oscdDialog = getOscdDialog(dialog);
    expect(oscdDialog).to.exist;
    await waitUntil(() => oscdDialog?.open === true);

    const field = dialog.shadowRoot?.querySelector(
      'dai-value-field',
    ) as DaiValueField | null;
    expect(field).to.exist;
    expect(field?.value).to.equal(val2.textContent?.trim());

    field!.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: '42' },
        bubbles: true,
        composed: true,
      }),
    );

    const saveButton = dialog.shadowRoot?.querySelector(
      'oscd-filled-button[slot="primaryAction"]',
    ) as HTMLElement | null;
    expect(saveButton).to.exist;
    saveButton!.click();

    await waitUntil(() => oscdDialog?.open === false, 'dialog did not close');
    await dialog.updateComplete;

    expect(editSpy.calledOnce).to.be.true;
    expect(
      doc.querySelector(
        'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"] > DAI[name="setVal"] > Val[sGroup="1"]',
      )?.textContent,
    ).to.equal(val1.textContent);
    expect(
      doc.querySelector(
        'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"] > DAI[name="setVal"] > Val[sGroup="2"]',
      )?.textContent,
    ).to.equal('42');
  });

  it('opens with the provided sGroup value when Val is missing', async () => {
    const doc = parseDoc(testDocs.withIED_instanciated);

    //Lets change numOfSGs to 3
    const settingsControl = doc.querySelector('LN0 > SettingControl')!;
    settingsControl.setAttribute('numOfSGs', '3');

    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType[id="ARtg_Test"] > DA[name="setVal"]',
    );
    const daiElement = getFirstAndAssertBySelector(
      doc,
      'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"] > DAI[name="setVal"]',
    );

    const dialog = await fixture(
      html`<dai-value-edit-dialog
        .templateElement=${daElement}
        .instanceElement=${daiElement}
        .sGroup=${3}
      ></dai-value-edit-dialog>`,
    );
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

    const dialog = await fixture(
      html`<dai-value-edit-dialog
        .templateElement=${daElement}
        .instanceElement=${daiElement}
        .sGroup=${2}
      ></dai-value-edit-dialog>`,
    );
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

    const dialog = await fixture(
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
    const daiElement = doc.querySelector(
      'IED[name="IED1"] LN0 > DOI[name="Beh"] > DAI[name="t"]',
    )!;

    const valElement = daiElement.querySelector('Val');
    expect(valElement).to.exist;

    const dialog = await fixture(
      html`<dai-value-edit-dialog
        .templateElement=${daElement}
        .instanceElement=${daiElement}
        .valElement=${valElement}
      ></dai-value-edit-dialog>`,
    );

    dialog.show();

    const oscdDialog = getOscdDialog(dialog);
    expect(oscdDialog).to.exist;
    await waitUntil(() => oscdDialog?.open === true);

    const timestampField = dialog.shadowRoot?.querySelector(
      'dai-timestamp-field',
    ) as DaiTimestampField | null;
    expect(timestampField).to.exist;

    timestampField!.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          value: '2025-11-23T11:13:15.000',
          dateValue: '2025-11-23',
          timeValue: '11:13:15',
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

    waitUntil(() => oscdDialog?.open === false, 'dialog did not close');
    await dialog.updateComplete;

    expect(editSpy.calledOnce).to.be.true;

    expect(
      doc.querySelector(
        'IED[name="IED1"] LN0 > DOI[name="Beh"] > DAI[name="t"] > Val',
      )?.textContent,
    ).to.equal('2025-11-23T11:13:15.000');
  });
});
