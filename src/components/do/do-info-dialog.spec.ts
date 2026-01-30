import { expect, fixture, html } from '@open-wc/testing';
import { Nsdoc } from '../../foundation/nsdoc.js';
import { MISSING_VALUE } from '../../foundation.js';
import { buildDoInfoGroups } from './do-info-dialog.js';
import { parseDoc, testDocs } from '../../test-utils/test-files.js';
import { getFirstAndAssertBySelector } from '../../test-utils/queries.js';
import { getAncestors } from '../../test-utils/test-harness.js';
import { DoInfoDialog } from './do-info-dialog.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';

const nsdocStub: Nsdoc = {
  getDataDescription: (element: Element) => ({
    label: `${element.tagName}-label`,
  }),
};

customElements.define('do-info-dialog', DoInfoDialog);

describe('do-info-dialog', () => {
  it('builds detailed groups for DO info', () => {
    const doc = parseDoc(testDocs.withIED_instanciated);

    const doElement = getFirstAndAssertBySelector(
      doc,
      'LNodeType[id="TCTR_Test"] > DO[name="ARtg"]',
    );
    const doiElement = getFirstAndAssertBySelector(
      doc,
      'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"]',
    );
    const ancestors = getAncestors(doc, [
      'IED',
      'AccessPoint',
      'LDevice',
      'LN',
    ]);

    const groups = buildDoInfoGroups({
      ancestors,
      nsdoc: nsdocStub,
      templateElement: doElement,
      instanceElement: doiElement,
      detailed: true,
    });

    expect(groups).to.have.lengthOf(3);
    const doGroupLabels = groups[0].map(field => field.label);
    expect(doGroupLabels).to.deep.equal([
      'NSDoc description',
      'Data object name',
      'Data object description',
      'Data object common data class',
    ]);
    expect(groups[0][0].value).to.equal('DO-label');
    expect(groups[0][1].value).to.equal('ARtg');
    expect(groups[0][2].value).to.equal(MISSING_VALUE);
    expect(groups[0][3].value).to.equal('ASG');
    expect(groups[1][1].value).to.equal('LN-label');
  });

  it('omits detailed-only fields when detailed is false', () => {
    const doc = parseDoc(testDocs.withIED_instanciated);
    const doElement = getFirstAndAssertBySelector(
      doc,
      'LNodeType[id="TCTR_Test"] > DO[name="ARtg"]',
    );
    const ancestors = getAncestors(doc, [
      'IED',
      'AccessPoint',
      'LDevice',
      'LN',
    ]);

    const groups = buildDoInfoGroups({
      ancestors,
      nsdoc: nsdocStub,
      templateElement: doElement,
      detailed: false,
    });

    expect(groups[0].map(field => field.label)).to.deep.equal([
      'Data object name',
      'Data object common data class',
    ]);
    expect(groups[1][0].value).to.equal(MISSING_VALUE);
  });

  it('renders dialog fields for template and instance data', async () => {
    const doc = parseDoc(testDocs.withIED_instanciated);

    const doElement = getFirstAndAssertBySelector(
      doc,
      'LNodeType[id="TCTR_Test"] > DO[name="ARtg"]',
    );
    const doiElement = getFirstAndAssertBySelector(
      doc,
      'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"]',
    );
    const ancestors = getAncestors(doc, [
      'IED',
      'AccessPoint',
      'LDevice',
      'LN',
    ]);

    const dialog = await fixture<DoInfoDialog>(html`
      <do-info-dialog
        .ancestors=${ancestors}
        .nsdoc=${nsdocStub}
        .templateElement=${doElement}
        .instanceElement=${doiElement}
      ></do-info-dialog>
    `);

    await dialog.updateComplete;

    dialog.show();
    await dialog.updateComplete;

    const infoDialog = dialog.shadowRoot?.querySelector('info-dialog');
    expect(infoDialog).to.exist;

    const fields =
      infoDialog?.shadowRoot?.querySelectorAll('oscd-filled-text-field') ?? [];
    const fieldValues = Array.from(fields).map(field =>
      (field as OscdFilledTextField).value?.toString(),
    );

    expect(fieldValues).to.deep.equal([
      'DO-label',
      'ARtg',
      MISSING_VALUE,
      'ASG',
      MISSING_VALUE,
      'LN-label',
      '1',
      'LD1',
      'AP1',
      'IED1',
    ]);
  });
});
