import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { DaiValueEditDialog } from './dai-value-edit-dialog.js';
import { DaiValueField } from './fields/dai-value-field.js';
import { DaiTimestampField } from './fields/dai-timestamp-field.js';
import { parseDoc, testDocs } from '../../test-utils/test-files.js';
import { getFirstAndAssertBySelector } from '../../test-utils/queries.js';
import { EditV2, XMLEditor } from '@openscd/oscd-editor';
import Sinon from 'sinon';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';
import { enumValues } from '../../test-utils/test-harness.js';

customElements.define('dai-value-edit-dialog', DaiValueEditDialog);

type TestSetupProps = {
  docContents: string;
  templateSelector: string;
  instanceSelector?: string;
  valSelector?: string;
  sGroup?: number | null;
};

/*
 * Don't call this directly, instead call the testSetup function located in the top-level describe.
 * It will automatically delegate to this but also handle cleanup after each test.
 */
const createTestHarness = async ({
  docContents,
  templateSelector,
  instanceSelector,
  valSelector,
  sGroup = null,
}: TestSetupProps) => {
  const xmlEditor = new XMLEditor();
  const editSpy = Sinon.spy(xmlEditor, 'commit');

  const handleEditEvent = (event: Event) => {
    const editEvent = event as CustomEvent<{ edit: EditV2 }>;
    xmlEditor.commit(editEvent.detail.edit);
  };

  const doc = parseDoc(docContents);
  const templateElement = getFirstAndAssertBySelector(doc, templateSelector);
  const instanceElement = instanceSelector
    ? getFirstAndAssertBySelector(doc, instanceSelector)
    : null;
  const valElement = valSelector
    ? getFirstAndAssertBySelector(doc, valSelector)
    : null;

  const daiValueEditDialog = await fixture<DaiValueEditDialog>(html`
    <dai-value-edit-dialog
      .templateElement=${templateElement}
      .instanceElement=${instanceElement}
      .valElement=${valElement}
      .enumValues=${enumValues}
      .sGroup=${sGroup}
    ></dai-value-edit-dialog>
  `);

  daiValueEditDialog.addEventListener('oscd-edit-v2', handleEditEvent);

  const innerDialog =
    daiValueEditDialog.shadowRoot?.querySelector('oscd-dialog') ?? null;
  expect(innerDialog).to.exist;

  const openDialog = async () => {
    expect(innerDialog).to.exist;
    daiValueEditDialog.show();
    await waitUntil(() => innerDialog?.open === true);
  };

  const clickSave = async () => {
    const saveButton = daiValueEditDialog.shadowRoot?.querySelector(
      'oscd-filled-button[slot="primaryAction"]',
    ) as OscdFilledButton | null;
    expect(saveButton).to.exist;
    saveButton!.click();
    await waitUntil(() => innerDialog?.open === false, 'dialog did not close');
    await daiValueEditDialog.updateComplete;
  };

  const dispose = async () => {
    daiValueEditDialog.removeEventListener('oscd-edit-v2', handleEditEvent);
    daiValueEditDialog.remove();
    editSpy.restore();
  };

  await daiValueEditDialog.updateComplete;
  return {
    doc,
    templateElement,
    instanceElement,
    valElement,
    daiValueEditDialog,
    innerDialog: innerDialog!,
    openDialog,
    clickSave,
    editSpy,
    dispose,
  };
};

describe('dai-value-edit-dialog', () => {
  let disposeFn: (() => Promise<void>) | null = null;

  const testSetup = async (options: TestSetupProps) => {
    const harness = await createTestHarness(options);
    disposeFn = harness.dispose;
    return harness;
  };

  afterEach(() => {
    disposeFn?.();
  });

  it('renders enum values and selected value', async () => {
    const { daiValueEditDialog, openDialog } = await testSetup({
      docContents: testDocs.withIED,
      templateSelector: 'DOType[id="Beh_Test"] > DA[name="stVal"]',
      instanceSelector:
        'IED[name="IED1"] LN0 > DOI[name="Beh"] > DAI[name="stVal"]',
      valSelector:
        'IED[name="IED1"] LN0 > DOI[name="Beh"] > DAI[name="stVal"] > Val',
    });

    await openDialog();

    const field = daiValueEditDialog.shadowRoot?.querySelector(
      'dai-value-field',
    ) as DaiValueField | null;
    expect(field).to.exist;
    expect(field?.value).to.equal('on');
    expect(field?.enumValues).to.deep.equal(enumValues);
  });

  it('confirms updated values for the provided Val', async () => {
    const { doc, daiValueEditDialog, openDialog, clickSave, editSpy } =
      await testSetup({
        docContents: testDocs.withIED,
        templateSelector: 'DOType[id="Beh_Test"] > DA[name="stVal"]',
        instanceSelector:
          'IED[name="IED1"] LN0 > DOI[name="Beh"] > DAI[name="stVal"]',
        valSelector:
          'IED[name="IED1"] LN0 > DOI[name="Beh"] > DAI[name="stVal"] > Val',
      });

    await openDialog();

    const field = daiValueEditDialog.shadowRoot?.querySelector(
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

    await clickSave();

    expect(editSpy.calledOnce).to.be.true;
    expect(
      doc.querySelector(
        'IED[name="IED1"] LN0 > DOI[name="Beh"] > DAI[name="stVal"] > Val',
      )?.textContent,
    ).to.equal('off');
  });

  it('targets the provided sGroup Val when multiple exist', async () => {
    const {
      doc,
      instanceElement,
      daiValueEditDialog,
      openDialog,
      clickSave,
      editSpy,
    } = await testSetup({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DOType[id="Beh_Test"] > DA[name="stVal"]',
      instanceSelector:
        'IED[name="IED1"] LN > DOI[name="ARtg"] > DAI[name="setVal"]',
      valSelector:
        'IED[name="IED1"] LN > DOI[name="ARtg"] > DAI[name="setVal"] > Val[sGroup="2"]',
    });

    await openDialog();

    const val1 = instanceElement
      ?.querySelector('Val[sGroup="1"]')
      ?.textContent?.trim();
    const val2 = instanceElement
      ?.querySelector('Val[sGroup="2"]')
      ?.textContent?.trim();

    const field = daiValueEditDialog.shadowRoot?.querySelector(
      'dai-value-field',
    ) as DaiValueField | null;
    expect(field).to.exist;
    expect(field?.value.trim()).to.equal(val2);

    field!.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: '42' },
        bubbles: true,
        composed: true,
      }),
    );

    await clickSave();

    expect(editSpy.calledOnce).to.be.true;
    expect(
      doc.querySelector(
        'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"] > DAI[name="setVal"] > Val[sGroup="1"]',
      )?.textContent,
      "Value remains unchanged for sGroup='1'",
    ).to.equal(val1);
    expect(
      doc.querySelector(
        'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"] > DAI[name="setVal"] > Val[sGroup="2"]',
      )?.textContent,
      "Value updated for sGroup='2'",
    ).to.equal('42');
  });

  it('inserts a new sGroup Val when missing', async () => {
    const { instanceElement, daiValueEditDialog, openDialog, clickSave } =
      await testSetup({
        docContents: testDocs.withIED_instanciated,
        templateSelector: 'DOType[id="ARtg_Test"] > DA[name="setMag"]',
        instanceSelector:
          'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"] > DAI[name="setMag"]',
        sGroup: 2,
      });
    await openDialog();

    const field = daiValueEditDialog.shadowRoot?.querySelector(
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

    clickSave();

    expect(
      instanceElement?.querySelector('Val[sGroup="2"]')?.textContent,
    ).to.equal('22');
  });

  it('saves timestamp values with normalized time', async () => {
    const { doc, daiValueEditDialog, openDialog, clickSave, editSpy } =
      await testSetup({
        docContents: testDocs.withIED,
        templateSelector: 'DOType[id="Beh_Test"] > DA[name="t"]',
        instanceSelector:
          'IED[name="IED1"] LN0 > DOI[name="Beh"] > DAI[name="t"]',
        valSelector:
          'IED[name="IED1"] LN0 > DOI[name="Beh"] > DAI[name="t"] > Val',
      });

    await openDialog();

    const timestampField = daiValueEditDialog.shadowRoot?.querySelector(
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

    await clickSave();

    expect(editSpy.calledOnce).to.be.true;
    expect(
      doc.querySelector(
        'IED[name="IED1"] LN0 > DOI[name="Beh"] > DAI[name="t"] > Val',
      )?.textContent,
    ).to.equal('2025-11-23T11:13:15.000');
  });
});
