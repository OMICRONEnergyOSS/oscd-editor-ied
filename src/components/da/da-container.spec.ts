import { expect, fixture, html } from '@open-wc/testing';
import { DAContainer } from './da-container.js';
import { DaInfoDialog } from './da-info-dialog.js';
import { Nsdoc } from '../../foundation/nsdoc.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { parseDoc, testDocs } from '../../test-utils/test-files.js';
import { getFirstBySelector } from '../../test-utils/queries.js';
import { getAncestors } from '../../test-utils/test-harness.js';

customElements.define('da-container', DAContainer);

const nsdocStub: Nsdoc = {
  getDataDescription: (element: Element) => ({
    label: `${element.tagName}-label`,
  }),
};

describe('da-container', () => {
  it('opens the info dialog and renders expected fields', async () => {
    const doc = parseDoc(testDocs.withIED_instanciated);

    const daElement = getFirstBySelector(doc, 'DOType > DA[name="stVal"]');
    const doElement = getFirstBySelector(doc, 'LNodeType > DO');
    const doiElement = getFirstBySelector(doc, 'LN0 > DOI');
    expect(daElement, 'Missing element for DOType > DA[name="stVal"]').to.exist;
    expect(doElement, 'Missing element for LNodeType > DO').to.exist;
    expect(doiElement, 'Missing element for LN0 > DOI').to.exist;
    const daiElement = doc.createElementNS(
      doc.documentElement.namespaceURI,
      'DAI',
    );
    daiElement.setAttribute('name', 'stVal');
    daiElement.setAttribute('desc', 'ValueDesc');
    const val = doc.createElementNS(doc.documentElement.namespaceURI, 'Val');
    val.textContent = 'on';
    daiElement.appendChild(val);
    doiElement!.appendChild(daiElement);

    const ancestors = [
      ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN0']),
      doElement!,
    ];

    const container = await fixture<DAContainer>(html`
      <da-container
        .doc=${doc}
        .docVersion=${0}
        .element=${daElement!}
        .instanceElement=${daiElement}
        .nsdoc=${nsdocStub}
        .ancestors=${ancestors}
      ></da-container>
    `);

    await container.updateComplete;

    const infoDialog = container.shadowRoot?.querySelector(
      'da-info-dialog',
    ) as DaInfoDialog;
    expect(infoDialog.templateElement).to.equal(daElement);
    expect(infoDialog.instanceElement).to.equal(daiElement);

    const nsdocLabel = nsdocStub.getDataDescription(
      daElement!,
      ancestors,
    ).label;
    const infoButton = container.shadowRoot?.querySelector(
      `oscd-icon-button[title="${nsdocLabel}"]`,
    ) as HTMLElement;

    expect(infoButton).to.exist;
    infoButton.click();
    await infoDialog.updateComplete;

    const infoDialogInner = infoDialog.shadowRoot?.querySelector(
      'info-dialog',
    ) as HTMLElement;
    const fields =
      infoDialogInner.shadowRoot?.querySelectorAll('oscd-filled-text-field') ??
      [];
    const fieldValues = Array.from(fields).map(field =>
      (field as OscdFilledTextField).value?.toString(),
    );

    expect(fieldValues).to.deep.equal([
      'DA-label',
      'stVal',
      'ValueDesc',
      'ST',
      'Enum',
      'on',
      'Beh',
      'ENS',
      'L',
      'LN0-label',
      '',
      'LD1',
      'AP1',
      'IED1',
    ]);
  });

  it('renders a create button for non-struct DA without instance values', async () => {
    const doc = parseDoc(testDocs.withIED_instanciated);
    const daElement = getFirstBySelector(doc, 'DOType > DA[name="stVal"]');
    const doElement = getFirstBySelector(doc, 'LNodeType > DO');
    expect(daElement, 'Missing element for DOType > DA[name="stVal"]').to.exist;
    expect(doElement, 'Missing element for LNodeType > DO').to.exist;

    const ancestors = [
      ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN0']),
      doElement!,
    ];

    const container = await fixture<DAContainer>(html`
      <da-container
        .doc=${doc}
        .docVersion=${0}
        .element=${daElement!}
        .instanceElement=${null}
        .nsdoc=${nsdocStub}
        .ancestors=${ancestors}
      ></da-container>
    `);

    await container.updateComplete;

    const toggleButton = container.shadowRoot?.querySelector('#toggleButton');
    expect(toggleButton).to.not.exist;

    const addIcon = Array.from(
      container.shadowRoot?.querySelectorAll('oscd-icon') ?? [],
    ).find(icon => icon.textContent?.trim() === 'add');
    expect(addIcon).to.exist;
  });

  it('renders BDA containers when expanded for Struct DA', async () => {
    const doc = parseDoc(testDocs.withIED_instanciated);
    const doType = getFirstBySelector(
      doc,
      'DOType[id="Beh$oscd$_c6ed035c8137b35a"]',
    );
    expect(
      doType,
      'Missing element for DOType[id="Beh$oscd$_c6ed035c8137b35a"]',
    ).to.exist;
    const structDa = doc.createElementNS(
      doc.documentElement.namespaceURI,
      'DA',
    );
    structDa.setAttribute('name', 'setVal');
    structDa.setAttribute('fc', 'ST');
    structDa.setAttribute('bType', 'Struct');
    structDa.setAttribute('type', 'SetType');
    doType!.appendChild(structDa);

    const daType = doc.createElementNS(
      doc.documentElement.namespaceURI,
      'DAType',
    );
    daType.setAttribute('id', 'SetType');
    const bda = doc.createElementNS(doc.documentElement.namespaceURI, 'BDA');
    bda.setAttribute('name', 'sub1');
    bda.setAttribute('bType', 'Enum');
    daType.appendChild(bda);
    const templates = getFirstBySelector(doc, 'DataTypeTemplates');
    expect(templates, 'Missing element for DataTypeTemplates').to.exist;
    templates!.appendChild(daType);

    const doElement = getFirstBySelector(doc, 'LNodeType > DO');
    expect(doElement, 'Missing element for LNodeType > DO').to.exist;
    const ancestors = [
      ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN0']),
      doElement!,
    ];

    const container = await fixture<DAContainer>(html`
      <da-container
        .doc=${doc}
        .docVersion=${0}
        .element=${structDa}
        .instanceElement=${null}
        .nsdoc=${nsdocStub}
        .ancestors=${ancestors}
      ></da-container>
    `);

    await container.updateComplete;

    const toggleButton = container.shadowRoot?.querySelector(
      '#toggleButton',
    ) as HTMLElement;
    expect(toggleButton).to.exist;

    toggleButton.click();
    await container.updateComplete;
    expect(container.expanded).to.be.true;

    const bdaContainers =
      container.shadowRoot?.querySelectorAll('da-container') ?? [];
    expect(bdaContainers.length).to.equal(1);
  });
});
