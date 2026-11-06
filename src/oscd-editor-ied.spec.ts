import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { OscdEditorIED } from './oscd-editor-ied.js';
import { LitElement } from 'lit';
import { parseDoc, testDocs } from './test-utils/test-files.js';
import { getNamedElement } from './test-utils/queries.js';
import { PluginTestHarness } from './test-utils/test-harness.js';
import { Plugin } from '@openscd/oscd-api';
import { typeIn } from './test-utils/actions.js';
import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';
import { IedContainer } from './components/ied/ied-container.js';
import { newEditEventV2 } from '@openscd/oscd-api/utils.js';
import { sendKeys } from '@web/test-runner-commands';
import { VirtualIedCreateDialog } from './components/virtual-ied-create-dialog.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';

customElements.define('oscd-editor-ied', OscdEditorIED);

describe('oscd-editor-ied', () => {
  let oscdEditorIED: OscdEditorIED & LitElement & Plugin;
  let harness: PluginTestHarness;
  let doc: XMLDocument;

  beforeEach(async () => {
    oscdEditorIED = await fixture(html`<oscd-editor-ied></oscd-editor-ied>`);
    harness = new PluginTestHarness(oscdEditorIED);
    doc = parseDoc(testDocs.withIED);
    harness.setDoc('testdoc.scd', doc);
    await oscdEditorIED.updateComplete;
  });

  afterEach(() => {
    harness.dispose();
  });

  it('displays the IED and all its Subcomponents', async () => {
    const iedContainer = oscdEditorIED.shadowRoot?.querySelector(
      'ied-container',
    ) as HTMLElement;
    expect(iedContainer).to.exist;

    const iedActionPane = iedContainer.shadowRoot?.querySelector(
      'oscd-action-pane',
    ) as OscdActionPane;
    expect(iedActionPane).to.exist;
    expect(iedActionPane.label).to.equal('IED1');
    const accessPointContainer = iedContainer.shadowRoot?.querySelector(
      'access-point-container',
    ) as HTMLElement;
    expect(accessPointContainer).to.exist;

    const apActionPane = accessPointContainer.shadowRoot?.querySelector(
      'oscd-action-pane',
    ) as OscdActionPane;
    expect(apActionPane).to.exist;
    expect(apActionPane.label).to.equal('AP1');
  });

  it('keeps alternating pane backgrounds visible through nested components', async () => {
    oscdEditorIED.style.setProperty('--oscd-base2', '#f3f5f6');
    oscdEditorIED.style.setProperty('--md-sys-color-surface', '#fff');
    oscdEditorIED.style.setProperty('--md-sys-color-on-primary', '#fff');

    const iedContainer =
      oscdEditorIED.shadowRoot?.querySelector('ied-container');
    const iedPane = iedContainer?.shadowRoot?.querySelector('oscd-action-pane');
    await waitUntil(
      () =>
        Boolean(
          iedContainer?.shadowRoot
            ?.querySelector('access-point-container')
            ?.shadowRoot?.querySelector('oscd-action-pane')
            ?.shadowRoot?.querySelector('section'),
        ),
      'nested pane did not render',
    );
    const apContainer = iedContainer?.shadowRoot?.querySelector(
      'access-point-container',
    );
    const apPane = apContainer?.shadowRoot?.querySelector('oscd-action-pane');
    const iedSection = iedPane?.shadowRoot?.querySelector('section');
    const apSection = apPane?.shadowRoot?.querySelector('section');

    if (
      !(iedSection instanceof HTMLElement) ||
      !(apSection instanceof HTMLElement)
    ) {
      throw new Error('Expected IED and access point panes');
    }
    await waitUntil(
      () =>
        getComputedStyle(apSection).backgroundColor === 'rgb(243, 245, 246)',
      'nested pane did not acquire the contrasting background',
    );

    expect(getComputedStyle(iedSection).backgroundColor).to.equal(
      'rgb(255, 255, 255)',
    );
    expect(getComputedStyle(apSection).backgroundColor).to.equal(
      'rgb(243, 245, 246)',
    );
  });

  it('creates a virtual IED', async () => {
    const addButton = oscdEditorIED.shadowRoot?.querySelector(
      '[data-testid="add-ied-button"]',
    ) as HTMLElement;
    addButton.click();
    await oscdEditorIED.updateComplete;
    const createDialog = oscdEditorIED.shadowRoot?.querySelector(
      'virtual-ied-create-dialog',
    ) as HTMLElement & { updateComplete: Promise<void> };
    await createDialog.updateComplete;

    const nameInput = createDialog.shadowRoot?.querySelector(
      '[data-testid="ied-name-input"]',
    ) as HTMLInputElement & { value: string };
    await typeIn(nameInput, 'IED_NEW');
    await createDialog.updateComplete;

    const createButton = createDialog.shadowRoot?.querySelector(
      '[slot="primaryAction"]',
    ) as OscdFilledButton;
    expect(createButton).to.exist;
    harness.commitSpy.resetHistory();
    createButton.click();
    await waitUntil(() => harness.commitSpy.called, 'edit not committed');
    await oscdEditorIED.updateComplete;

    expect(getNamedElement(oscdEditorIED.doc, 'IED', 'IED_NEW')).to.exist;
  });

  describe('virtual IED dialog keyboard shortcuts', () => {
    let createDialog: VirtualIedCreateDialog;
    let nameInput: OscdFilledTextField;

    beforeEach(async () => {
      const addButton = oscdEditorIED.shadowRoot!.querySelector<HTMLElement>(
        '[data-testid="add-ied-button"]',
      )!;
      addButton.click();
      await oscdEditorIED.updateComplete;
      createDialog =
        oscdEditorIED.shadowRoot!.querySelector<VirtualIedCreateDialog>(
          'virtual-ied-create-dialog',
        )!;
      await createDialog.updateComplete;
      await waitUntil(() => createDialog.dialog.open);
      nameInput =
        createDialog.shadowRoot!.querySelector<OscdFilledTextField>(
          '[data-testid="ied-name-input"]',
        )!;
      nameInput.focus();
      harness.commitSpy.resetHistory();
    });

    it('creates exactly one IED and closes on Enter in the name field', async () => {
      await typeIn(nameInput, 'IED_NEW');
      await sendKeys({ press: 'Enter' });
      await waitUntil(() => !createDialog.dialog.open);

      expect(harness.commitSpy).to.have.been.calledOnce;
      expect(doc.querySelectorAll('IED[name="IED_NEW"]')).to.have.length(1);
    });

    for (const name of ['', 'IED1', 'Invalid Name']) {
      it(`keeps the dialog open for invalid name "${name}" on Enter`, async () => {
        if (name) {
          await typeIn(nameInput, name);
        }
        await sendKeys({ press: 'Enter' });

        expect(createDialog.dialog.open).to.equal(true);
        expect(harness.commitSpy).not.to.have.been.called;
      });
    }

    it('closes without creating an IED on Escape and clears the name', async () => {
      await typeIn(nameInput, 'IED_NEW');
      await sendKeys({ press: 'Escape' });
      await waitUntil(() => !createDialog.dialog.open);

      expect(harness.commitSpy).not.to.have.been.called;
      createDialog.show();
      await waitUntil(() => createDialog.dialog.open);
      await createDialog.updateComplete;
      expect(nameInput.value).to.equal('');
    });

    it('cancels instead of creating when Enter is pressed on Cancel', async () => {
      await typeIn(nameInput, 'IED_NEW');
      const cancelButton = createDialog.shadowRoot!.querySelector<HTMLElement>(
        '[slot="secondaryAction"]',
      )!;
      cancelButton.focus();
      await sendKeys({ press: 'Enter' });
      await waitUntil(() => !createDialog.dialog.open);

      expect(harness.commitSpy).not.to.have.been.called;
    });

    for (const options of [{ isComposing: true }, { repeat: true }]) {
      it(`ignores Enter with ${Object.keys(options)[0]}`, async () => {
        await typeIn(nameInput, 'IED_NEW');
        nameInput.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Enter',
            bubbles: true,
            composed: true,
            cancelable: true,
            ...options,
          }),
        );

        expect(createDialog.dialog.open).to.equal(true);
        expect(harness.commitSpy).not.to.have.been.called;
      });
    }
  });

  it('keeps the selected IED after document has been edited', async () => {
    const ied2 = getNamedElement(oscdEditorIED.doc, 'IED', 'IED2')!;
    const ap2 = getNamedElement(doc, 'AccessPoint', 'AP2')!;

    oscdEditorIED.selectedIEDs = [ied2];
    await oscdEditorIED.updateComplete;

    const initialContainer = oscdEditorIED.shadowRoot?.querySelector(
      'ied-container',
    ) as IedContainer;
    const initialPane = initialContainer.shadowRoot?.querySelector(
      'oscd-action-pane',
    ) as OscdActionPane;
    expect(initialPane.label).to.equal('IED2');

    // Lets trigger an edit by deleting the AP2
    const newAPEdits = {
      element: ap2,
      attributes: { name: 'AP_Deux' },
    };
    oscdEditorIED.dispatchEvent(newEditEventV2(newAPEdits));
    await oscdEditorIED.updateComplete;

    const updatedContainer = oscdEditorIED.shadowRoot?.querySelector(
      'ied-container',
    ) as IedContainer;
    const updatedPane = updatedContainer.shadowRoot?.querySelector(
      'oscd-action-pane',
    ) as OscdActionPane;
    expect(updatedPane.label).to.equal('IED2');

    const accessPointContainers =
      updatedContainer.shadowRoot?.querySelectorAll('access-point-container') ??
      [];
    const accessPointLabels = Array.from(accessPointContainers).map(
      container =>
        (
          container.shadowRoot?.querySelector(
            'oscd-action-pane',
          ) as OscdActionPane
        ).label,
    );
    expect(accessPointLabels).to.include('AP_Deux');
  });
});
