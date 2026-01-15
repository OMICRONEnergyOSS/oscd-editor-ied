import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';
import { OscdSclTextField } from '@omicronenergy/oscd-ui/scl-textfield/OscdSclTextField.js';
import { waitUntil, expect, fixture } from '@open-wc/testing';
import { html } from 'lit';
import { setSclTextFieldValue, typeIn } from '../../test-utils/actions.js';
import {
  getNamedElement,
  getFirstChildElement,
} from '../../test-utils/queries.js';
import { parseDoc, testDocs } from '../../test-utils/test-files.js';
import { ComponentTestHarness } from '../../test-utils/test-harness.js';
import { IedContainer } from './ied-container.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { AccessPointCreateDialog } from './access-point-create-dialog.js';
import { OscdFilledSelect } from '@omicronenergy/oscd-ui/select/OscdFilledSelect.js';
import { OscdSwitch } from '@omicronenergy/oscd-ui/switch/OscdSwitch.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { initializeNsdoc } from '../../foundation/nsdoc.js';
customElements.define('ied-container', IedContainer);

describe('with IED', () => {
  let iedContainer: IedContainer;
  let harness: ComponentTestHarness;
  let doc: XMLDocument;

  let addApButton: OscdIconButton;
  let apDialog: AccessPointCreateDialog;

  beforeEach(async () => {
    doc = parseDoc(testDocs.withIED);
    const element = getNamedElement(doc, 'IED', 'IED1')!;

    iedContainer = await fixture(html`
      <ied-container
        .doc=${doc}
        .nsdoc=${initializeNsdoc()}
        .docVersion=${0}
        .selectedLNClasses=${[]}
        .element=${element}
      ></ied-container>
    `);

    harness = new ComponentTestHarness(iedContainer);

    addApButton = iedContainer.shadowRoot?.querySelector(
      '[data-testid="add-access-point-button"]',
    ) as OscdIconButton;

    apDialog = iedContainer.shadowRoot?.querySelector(
      'access-point-create-dialog',
    ) as AccessPointCreateDialog;

    await iedContainer.updateComplete;
  });

  afterEach(() => {
    harness.dispose();
  });

  /*
   * Helpers
   */
  async function setApName(name: string): Promise<void> {
    const apNameInput = apDialog.shadowRoot?.querySelector(
      '#apName',
    ) as OscdFilledTextField;
    await typeIn(apNameInput, name);
    await apDialog.updateComplete;
  }

  async function setApDesc(desc: string): Promise<void> {
    const descInput = apDialog.shadowRoot?.querySelector(
      'oscd-scl-text-field',
    ) as OscdSclTextField;
    await setSclTextFieldValue(descInput, desc);
    await apDialog.updateComplete;
  }

  async function clickCreateButton(
    apDialog: AccessPointCreateDialog,
  ): Promise<void> {
    const addButton = apDialog.shadowRoot?.querySelector(
      '[data-testid="add-access-point-button"]',
    ) as HTMLElement;
    harness.commitSpy.resetHistory();
    addButton.click();
    await waitUntil(() => harness.commitSpy.called, 'edit not committed');
    await harness.element.updateComplete;
  }

  /*
   * Tests
   */
  it('adds a Basic AccessPoint to an IED', async () => {
    addApButton.click();
    await apDialog.updateComplete;

    await setApName('AP_NEW');
    await setApDesc('AP Desc');

    await clickCreateButton(apDialog);

    const accessPoint = getNamedElement(doc, 'AccessPoint', 'AP_NEW');
    expect(accessPoint).to.exist;
    expect(getFirstChildElement(accessPoint!, 'Server')).to.exist;
  });

  it('adds an AccessPoint with ServerAt', async () => {
    addApButton.click();
    await apDialog.updateComplete;

    await setApName('AP_NEW');
    await setApDesc('AP Desc');

    const addServerAtSwitch = apDialog.shadowRoot?.querySelector(
      'oscd-switch',
    ) as OscdSwitch;
    addServerAtSwitch.click();
    await apDialog.updateComplete;

    const accessPointSelect = apDialog.shadowRoot?.querySelector(
      'oscd-filled-select',
    ) as OscdFilledSelect;
    accessPointSelect.value = 'AP1';
    await accessPointSelect.updateComplete;
    await apDialog.updateComplete;

    await clickCreateButton(apDialog);

    const accessPoint = getNamedElement(doc, 'AccessPoint', 'AP_NEW');
    expect(accessPoint).to.exist;
    expect(getFirstChildElement(accessPoint!, 'ServerAt')).to.exist;
    expect(getFirstChildElement(accessPoint!, 'Server')).to.not.exist;
  });

  it('deletes an IED', async () => {
    const deleteButton = iedContainer.shadowRoot?.querySelector(
      '[data-testid="delete-ied-button"]',
    ) as OscdFilledButton;
    deleteButton.click();
    await iedContainer.updateComplete;

    expect(getNamedElement(doc, 'IED', 'IED1')).to.not.exist;
  });
});
