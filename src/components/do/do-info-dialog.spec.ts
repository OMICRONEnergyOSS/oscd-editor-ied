import { expect } from '@open-wc/testing';
import { Nsdoc } from '../../foundation/nsdoc.js';
import { MISSING_VALUE } from '../../foundation.js';
import { buildDoInfoGroups } from './do-info-dialog.js';
import { parseDoc, testDocs } from '../../test-utils/test-files.js';

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

describe('do-info-dialog', () => {
  it('builds detailed groups for DO info', () => {
    const doc = parseDoc(testDocs.withIED_instanciated);

    const doElement = getFirst(doc, 'LNodeType > DO');
    const doiElement = getFirst(doc, 'LN0 > DOI');
    const ancestors = Array.from(
      doc.querySelectorAll('IED, AccessPoint, LDevice, LN0'),
    );

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
    expect(groups[0][1].value).to.equal('Beh');
    expect(groups[0][2].value).to.equal('Behavior');
    expect(groups[0][3].value).to.equal('ENS');
    expect(groups[1][1].value).to.equal('LN0-label');
  });

  it('omits detailed-only fields when detailed is false', () => {
    const doc = parseDoc(testDocs.withIED_instanciated);
    const ln0 = getFirst(doc, 'LN0');
    ln0.removeAttribute('prefix');

    const doElement = getFirst(doc, 'LNodeType > DO');
    const ancestors = Array.from(
      doc.querySelectorAll('IED, AccessPoint, LDevice, LN0'),
    );

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
});
