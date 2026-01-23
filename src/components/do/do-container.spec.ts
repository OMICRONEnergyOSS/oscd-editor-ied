import { expect, fixture, html } from '@open-wc/testing';
import { DOContainer } from './do-container.js';
import { DoInfoDialog } from './do-info-dialog.js';
import { Nsdoc } from '../../foundation/nsdoc.js';
import { MISSING_VALUE } from '../../foundation.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { parseDoc, testDocs } from '../../test-utils/test-files.js';

customElements.define('do-container', DOContainer);

const nsdocStub: Nsdoc = {
  getDataDescription: (element: Element) => ({
    label: `${element.tagName}-label`,
  }),
};

function getFirst(doc: XMLDocument, selector: string): Element {
  const element = doc.querySelector(selector);
  if (!element) {
    throw new Error(`Missing element for ${selector}`);
  }
  return element;
}

describe('do-container', () => {
  it('opens the info dialog and renders the expected fields', async () => {
    const doc = parseDoc(testDocs.withIED_instanciated);

    const doElement = getFirst(doc, 'LNodeType > DO');
    const doiElement = getFirst(doc, 'LN0 > DOI');
    const ancestors = Array.from(
      doc.querySelectorAll('IED, AccessPoint, LDevice, LN0'),
    );

    const container = await fixture<DOContainer>(html`
      <do-container
        .doc=${doc}
        .docVersion=${0}
        .element=${doElement}
        .instanceElement=${doiElement}
        .nsdoc=${nsdocStub}
        .ancestors=${ancestors}
      ></do-container>
    `);

    await container.updateComplete;

    const infoDialog = container.shadowRoot?.querySelector(
      'do-info-dialog',
    ) as DoInfoDialog;

    expect(infoDialog.ancestors).to.equal(ancestors);
    expect(infoDialog.nsdoc).to.equal(nsdocStub);
    expect(infoDialog.templateElement).to.equal(doElement);
    expect(infoDialog.instanceElement).to.equal(doiElement);

    const nsdocLabel = nsdocStub.getDataDescription(doElement, ancestors).label;
    const infoButton = container.shadowRoot?.querySelector(
      `oscd-icon-button[title="${nsdocLabel}"]`,
    ) as HTMLElement;

    expect(infoButton).to.exist;
    infoButton.click();
    await infoDialog.updateComplete;

    const infoDialogInner = infoDialog.shadowRoot?.querySelector(
      'info-dialog',
    ) as HTMLElement;
    expect(infoDialogInner).to.exist;

    const fields =
      infoDialogInner.shadowRoot?.querySelectorAll('oscd-filled-text-field') ??
      [];
    const fieldValues = Array.from(fields).map(field =>
      (field as OscdFilledTextField).value?.toString(),
    );

    expect(fieldValues).to.deep.equal([
      'DO-label',
      'Beh',
      'Behavior',
      'ENS',
      'L',
      'LN0-label',
      '',
      'LD1',
      'AP1',
      'IED1',
    ]);
  });

  it('hides the toggle button when no child elements exist', async () => {
    const doc = parseDoc(testDocs.withIED_instanciated);
    const doElement = getFirst(doc, 'LNodeType > DO');
    doElement.setAttribute('type', 'MissingType');
    const doiElement = getFirst(doc, 'LN0 > DOI');
    const ancestors = Array.from(
      doc.querySelectorAll('IED, AccessPoint, LDevice, LN0'),
    );

    const container = await fixture<DOContainer>(html`
      <do-container
        .doc=${doc}
        .docVersion=${0}
        .element=${doElement}
        .instanceElement=${doiElement}
        .nsdoc=${nsdocStub}
        .ancestors=${ancestors}
      ></do-container>
    `);

    await container.updateComplete;

    const toggleButton = container.shadowRoot?.querySelector('#toggleButton');
    expect(toggleButton).to.not.exist;
  });

  it('renders DA and DO containers after expanding the action pane', async () => {
    const doc = parseDoc(testDocs.withIED_instanciated);

    const doElement = getFirst(doc, 'LNodeType > DO');
    const doiElement = getFirst(doc, 'LN0 > DOI');
    const sdiElement = getFirst(doc, 'LN0 > DOI > SDI');
    const ancestors = Array.from(
      doc.querySelectorAll('IED, AccessPoint, LDevice, LN0'),
    );

    const container = await fixture<DOContainer>(html`
      <do-container
        .doc=${doc}
        .docVersion=${0}
        .element=${doElement}
        .instanceElement=${doiElement}
        .nsdoc=${nsdocStub}
        .ancestors=${ancestors}
      ></do-container>
    `);

    await container.updateComplete;

    const toggleButton = container.shadowRoot?.querySelector(
      '#toggleButton',
    ) as HTMLElement;
    expect(toggleButton).to.exist;

    toggleButton.click();
    await container.updateComplete;
    expect(container.expanded).to.be.true;

    const daContainers =
      container.shadowRoot?.querySelectorAll('da-container') ?? [];
    expect(daContainers.length).to.equal(3);

    const doContainers =
      container.shadowRoot?.querySelectorAll('do-container') ?? [];
    expect(doContainers.length).to.equal(1);
    const nestedDoContainer = doContainers[0] as DOContainer;
    expect(nestedDoContainer.instanceElement).to.equal(sdiElement);
  });
});
