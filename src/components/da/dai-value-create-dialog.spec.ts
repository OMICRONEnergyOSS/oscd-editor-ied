import {
  expect,
  fixture as openWcFixture,
  html,
  waitUntil,
} from '@open-wc/testing';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { DaiValueCreateDialog } from './dai-value-create-dialog.js';
import { DaiValueField } from './fields/dai-value-field.js';
import { parseDoc, testDocs } from '../../test-utils/test-files.js';
import { getFirstAndAssertBySelector } from '../../test-utils/queries.js';
import { getAncestors } from '../../test-utils/test-harness.js';
import { EditV2, CommitOptions, Commit } from '@openscd/oscd-api';
import { XMLEditor } from '@openscd/oscd-editor';
import { TemplateResult } from 'lit';
import Sinon from 'sinon';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';

const enumValues = ['on', 'blocked', 'test', 'test/blocked', 'off'];

if (!customElements.get('dai-value-create-dialog')) {
  customElements.define('dai-value-create-dialog', DaiValueCreateDialog);
}

function getOscdDialog(element: HTMLElement): OscdDialog | null {
  return element.shadowRoot?.querySelector('oscd-dialog') ?? null;
}

describe('dai-value-create-dialog', () => {
  let xmlEditor: XMLEditor;
  let dialog: DaiValueCreateDialog;
  let editSpy: Sinon.SinonSpy<
    [edit: EditV2, options?: CommitOptions],
    Commit<EditV2>
  >;
  let oscdDialog: OscdDialog | null;
  let saveButton: OscdFilledButton | null;

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
    dialog = await openWcFixture<DaiValueCreateDialog>(template);
    dialog.addEventListener('oscd-edit-v2', handleEditEvent);

    oscdDialog = getOscdDialog(dialog);
    saveButton = dialog.shadowRoot?.querySelector(
      'oscd-filled-button[slot="primaryAction"]',
    ) as OscdFilledButton | null;

    return dialog;
  };

  const openDialog = async () => {
    dialog.show();

    const oscdDialog = getOscdDialog(dialog);
    expect(oscdDialog).to.exist;
    return await waitUntil(() => oscdDialog?.open === true);
  };

  const clickSaveButton = async () => {
    expect(saveButton).to.exist;
    saveButton!.click();
    await waitUntil(
      () => oscdDialog?.open === false,
      'Dialog did not close after save',
    );
    return dialog.updateComplete;
  };

  it('opens and renders template value', async () => {
    const doc = parseDoc(testDocs.withIED);

    const doElement = getFirstAndAssertBySelector(
      doc,
      'LNodeType[id="PlaceholderLLN0"] > DO[name="Beh"]',
    );
    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType[id="Beh_Test"] > DA[name="stVal"]',
    );

    const ancestors = [
      ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN0']),
      doElement,
    ];

    const dialog = await fixture(
      html`<dai-value-create-dialog
        .templateElement=${daElement}
        .ancestors=${ancestors}
        .enumValues=${enumValues}
      ></dai-value-create-dialog>`,
    );

    await openDialog();

    const templateField = dialog.shadowRoot?.querySelector(
      'oscd-filled-text-field[label="DA template value"]',
    ) as OscdFilledTextField | null;
    expect(templateField).to.exist;
    expect(templateField?.value).to.equal('blocked');

    await clickSaveButton();
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
      ...getAncestors(doc, [
        'IED',
        'AccessPoint',
        'LDevice[inst="LD2"]',
        'LN0',
      ]),
      doElement,
    ];

    const dialog = await fixture(
      html`<dai-value-create-dialog
        .templateElement=${daElement}
        .ancestors=${ancestors}
        .enumValues=${enumValues}
      ></dai-value-create-dialog>`,
    );

    await openDialog();

    const field = dialog.shadowRoot?.querySelector(
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

    await clickSaveButton();

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
    const doc = parseDoc(testDocs.withIED_instanciated);

    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType[id="ARtg_Test"] > DA[name="setMag"]',
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

    const dialog = await fixture(
      html`<dai-value-create-dialog
        .templateElement=${daElement}
        .ancestors=${ancestors}
        .enumValues=${enumValues}
      ></dai-value-create-dialog>`,
    );

    const fields = Array.from(
      dialog.shadowRoot?.querySelectorAll('dai-value-field') ?? [],
    ) as DaiValueField[];
    expect(fields.length).to.equal(5);
    expect(fields[0].value).to.equal('10');
    expect(fields[1].value).to.equal('');
    expect(fields[2].value).to.equal('');
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
