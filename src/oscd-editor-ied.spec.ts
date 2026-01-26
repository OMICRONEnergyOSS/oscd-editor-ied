import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import OscdEditorIED from './oscd-editor-ied.js';
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
