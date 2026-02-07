import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { DaiValueCreateDialog } from './dai-value-create-dialog.js';
import { DaiValueField } from './fields/dai-value-field.js';
import { parseDoc, testDocs } from '../../test-utils/test-files.js';
import { getFirstAndAssertBySelector } from '../../test-utils/queries.js';
import { enumValues, getAncestors } from '../../test-utils/test-harness.js';
import { EditV2 } from '@openscd/oscd-api';
import { XMLEditor } from '@openscd/oscd-editor';
import Sinon from 'sinon';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';

customElements.define('dai-value-create-dialog', DaiValueCreateDialog);

type TestSetupProps = {
  docContents: string;
  templateSelector: string;
  doElementSelector?: string;
  instanceSelector?: string;
  instancePathSelectors: string[];
};

/*
 * Don't call this directly, instead call the testSetup function located in the top-level describe.
 * It will automatically delegate to this but also handle cleanup after each test.
 */
const createTestHarness = async ({
  docContents,
  templateSelector,
  doElementSelector,
  instanceSelector,
  instancePathSelectors: ancestorsSelectors = [],
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
  const doElement = doElementSelector
    ? getFirstAndAssertBySelector(doc, doElementSelector)
    : null;
  const ancestors = [
    ...getAncestors(doc, ancestorsSelectors),
    ...(doElement ? [doElement] : []),
  ];

  const daiValueCreateDialog = await fixture<DaiValueCreateDialog>(html`
    <dai-value-create-dialog
      .templateElement=${templateElement}
      .instanceElement=${instanceElement}
      .enumValues=${enumValues}
      .ancestors=${ancestors}
    ></dai-value-create-dialog>
  `);

  daiValueCreateDialog.addEventListener('oscd-edit-v2', handleEditEvent);

  const innerDialog =
    daiValueCreateDialog.shadowRoot?.querySelector('oscd-dialog') ?? null;
  expect(innerDialog).to.exist;

  const openDialog = async () => {
    expect(innerDialog).to.exist;
    daiValueCreateDialog.show();
    await waitUntil(() => innerDialog?.open === true);
  };

  const clickAndWaitToClose = async (button: OscdFilledButton) => {
    expect(button).to.exist;
    button!.click();
    await waitUntil(() => innerDialog?.open === false, 'dialog did not close');
    await daiValueCreateDialog.updateComplete;
  };

  const clickSave = async () => {
    const saveButton = daiValueCreateDialog.shadowRoot?.querySelector(
      'oscd-filled-button[slot="primaryAction"]',
    ) as OscdFilledButton | null;
    await clickAndWaitToClose(saveButton!);
  };

  const clickCancel = async () => {
    const cancelButton = daiValueCreateDialog.shadowRoot?.querySelector(
      'oscd-outlined-button[slot="secondaryAction"]',
    ) as OscdFilledButton | null;
    await clickAndWaitToClose(cancelButton!);
  };

  const dispose = async () => {
    daiValueCreateDialog.removeEventListener('oscd-edit-v2', handleEditEvent);
    daiValueCreateDialog.remove();
    editSpy.restore();
  };

  await daiValueCreateDialog.updateComplete;
  return {
    doc,
    templateElement,
    instanceElement,
    ancestors,
    daiValueCreateDialog,
    innerDialog: innerDialog!,
    openDialog,
    clickSave,
    clickCancel,
    editSpy,
    dispose,
  };
};

describe('dai-value-create-dialog', () => {
  let disposeFn: (() => Promise<void>) | null = null;

  const testSetup = async (options: TestSetupProps) => {
    const harness = await createTestHarness(options);
    disposeFn = harness.dispose;
    return harness;
  };

  afterEach(() => {
    disposeFn?.();
  });

  it('opens and renders template value', async () => {
    const { daiValueCreateDialog, openDialog, clickCancel } = await testSetup({
      docContents: testDocs.withIED,
      templateSelector: 'DOType[id="Beh_Test"] > DA[name="stVal"]',
      instancePathSelectors: ['IED', 'AccessPoint', 'LDevice', 'LN0'],
    });

    await openDialog();

    const templateField = daiValueCreateDialog.shadowRoot?.querySelector(
      'oscd-filled-text-field[label="DA template value"]',
    ) as OscdFilledTextField | null;
    expect(templateField).to.exist;
    expect(templateField?.value).to.equal('blocked');

    await clickCancel();
  });

  it('creates values and inserts the DAI structure', async () => {
    const { openDialog, daiValueCreateDialog, clickSave, doc } =
      await testSetup({
        docContents: testDocs.withIED,
        templateSelector: 'DOType[id="Beh_Test"] > DA[name="stVal"]',
        doElementSelector: 'LNodeType[id="PlaceholderLLN0"] > DO[name="Beh"]',
        instancePathSelectors: [
          'IED',
          'AccessPoint',
          'LDevice[inst="LD2"]',
          'LN0',
        ],
      });

    await openDialog();

    const field = daiValueCreateDialog.shadowRoot?.querySelector(
      'dai-value-field',
    ) as DaiValueField | null;
    expect(field).to.exist;
    field!.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: 'on' },
        bubbles: true,
        composed: true,
      }),
    );

    await clickSave();

    expect(
      doc.querySelector(
        'IED[name="IED1"] LN0 > DOI[name="Beh"] > DAI[name="stVal"] > Val',
      )?.textContent,
    ).to.equal('on');
  });

  it('displays correct number of fields when numOfSGs is set and DA supports multiple values', async () => {
    /* There is no guarantee that a DAI will have a Val element for every sGroup.
     * If the DA supports multiple values and some are missing, the default DA value (if any)
     * is applied.
     * This test ensures that if some of the sGroups are missing, the dialog still displays all
     */

    const { daiValueCreateDialog, ancestors, openDialog, clickSave } =
      await testSetup({
        docContents: testDocs.withIED_instanciated,
        templateSelector: 'DOType[id="ARtg_Test"] > DA[name="setMag"]',
        doElementSelector: 'LNodeType[id="TCTR_Test"] > DO[name="ARtg"]',
        instancePathSelectors: [
          'IED',
          'AccessPoint',
          'LDevice[inst="LD2"]',
          'LN[lnClass="TCTR"][inst="2"]',
        ],
      });

    await openDialog();

    const fields = Array.from(
      daiValueCreateDialog.shadowRoot?.querySelectorAll('dai-value-field') ??
        [],
    ) as DaiValueField[];
    expect(fields.length).to.equal(7);
    fields.forEach((field, index) => {
      field.dispatchEvent(
        new CustomEvent('change', {
          detail: { value: (index + 1) * 10, sGroup: index + 1 },
          bubbles: true,
          composed: true,
        }),
      );
    });

    await clickSave();

    const ldElement = ancestors.find(el => el.tagName === 'LDevice')!;
    const lnElement = ancestors.find(el => el.tagName === 'LN')!;
    const numberOfSGs = Number(
      getFirstAndAssertBySelector(
        ldElement,
        'LN0 > SettingControl',
      ).getAttribute('numOfSGs'),
    );

    const doiElement = getFirstAndAssertBySelector(
      lnElement,
      'DOI[name="ARtg"]',
    );
    const daiElement = getFirstAndAssertBySelector(
      doiElement,
      'DAI[name="setMag"]',
    );

    const valElements = Array.from(daiElement.getElementsByTagName('Val'));
    expect(
      valElements.length,
      'Number of Val elements does not match numberOfSGs',
    ).to.equal(numberOfSGs);
    valElements.forEach(valEl => {
      const sGroup = valEl.getAttribute('sGroup');
      const value = valEl.textContent?.trim();
      expect(value).to.equal((Number(sGroup) * 10).toString());
    });
  });
});
