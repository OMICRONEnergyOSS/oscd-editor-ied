import { LitElement } from 'lit';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { OscdSclTextField } from '@omicronenergy/oscd-ui/scl-textfield/OscdSclTextField.js';
import { parseDoc, testDocs } from '../../test-utils/test-files.js';
import { setSclTextFieldValue, typeIn } from '../../test-utils/actions.js';
import { getNamedElement } from '../../test-utils/queries.js';
import { ComponentTestHarness } from '../../test-utils/test-harness.js';
import { AccessPointContainer } from './access-point-container.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { initializeNsdoc } from '../../foundation/nsdoc.js';
import { AccessPointEditDialog } from './access-point-edit-dialog.js';
import type { ServicesAction } from '../services/services-action.js';

customElements.define('access-point-container', AccessPointContainer);

describe('access-point-container', () => {
  let apContainer: AccessPointContainer & LitElement;
  let harness: ComponentTestHarness;
  let doc: XMLDocument;

  let editApButton: OscdIconButton;
  let deleteApButton: HTMLElement;
  let apDialog: AccessPointEditDialog;

  beforeEach(async () => {
    doc = parseDoc(testDocs.withIED);
    const element = getNamedElement(doc, 'AccessPoint', 'AP1')!;
    apContainer = await fixture(
      html`<access-point-container
        .doc=${doc}
        .nsdoc=${initializeNsdoc()}
        .docVersion=${0}
        .selectedLNClasses=${[]}
        .element=${element}
      ></access-point-container>`,
    );
    harness = new ComponentTestHarness(apContainer);

    editApButton = apContainer.shadowRoot?.querySelector(
      '[data-testid="edit-access-point-button"]',
    ) as OscdIconButton;
    deleteApButton = apContainer.shadowRoot?.querySelector(
      '[data-testid="delete-access-point-button"]',
    ) as HTMLElement;
    apDialog = apContainer.shadowRoot?.querySelector(
      'access-point-edit-dialog',
    ) as AccessPointEditDialog;
    await apContainer.updateComplete;
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
    ) as HTMLInputElement & { value: string };
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

  async function clickSaveButton(): Promise<void> {
    const saveButton = apDialog.shadowRoot?.querySelector(
      '[data-testid="save-access-point-button"]',
    ) as HTMLElement;
    harness.commitSpy.resetHistory();
    saveButton.click();
    await waitUntil(() => harness.commitSpy.called, 'edit not committed');
    await harness.element.updateComplete;
  }

  /*
   * Tests
   */
  it('updates the Services tooltip and button when Services changes', async () => {
    const action = apContainer.shadowRoot!.querySelector<ServicesAction>(
      'services-action',
    )!;
    await action.updateComplete;
    const button = action.shadowRoot!.querySelector('oscd-icon-button')!;
    const tooltip = button.parentElement!;
    const actionSlot = apContainer.shadowRoot!
      .querySelector('oscd-action-pane')!
      .shadowRoot!.querySelector<HTMLSlotElement>('slot[name="action"]')!;
    expect(actionSlot.assignedElements().includes(action)).to.be.true;
    expect(tooltip.title).to.equal('This AccessPoint has no Services section');
    expect(button.hasAttribute('disabled')).to.be.true;

    const services = doc.importNode(
      parseDoc(testDocs.withIED_instanciated).querySelector('IED > Services')!,
      true,
    );
    harness.editor.commit({
      parent: apContainer.element,
      node: services,
      reference: apContainer.element.firstElementChild,
    });
    apContainer.docVersion++;
    await apContainer.updateComplete;
    await action.updateComplete;
    expect(tooltip.title).to.equal('Show Services the AccessPoint provides');
    expect(button.hasAttribute('disabled')).to.be.false;

    harness.editor.commit({ node: services });
    apContainer.docVersion++;
    await apContainer.updateComplete;
    await action.updateComplete;
    expect(tooltip.title).to.equal('This AccessPoint has no Services section');
    expect(button.hasAttribute('disabled')).to.be.true;
  });

  it('edits an AccessPoint', async () => {
    editApButton.click();
    await apDialog.updateComplete;

    /* append _RENAMED to the name and change desc (already set to AP1) */
    await setApName('_RENAMED');
    /* set 'Added Desc' to the name and change desc (nothing previously set) */
    await setApDesc('Added Desc');

    await clickSaveButton();

    const updated = getNamedElement(doc, 'AccessPoint', 'AP1_RENAMED');
    expect(updated).to.exist;
    expect(updated?.getAttribute('desc')).to.equal('Added Desc');
  });

  it('deletes an AccessPoint', async () => {
    deleteApButton.click();
    expect(getNamedElement(doc, 'AccessPoint', 'AP1')).to.not.exist;
  });
});
