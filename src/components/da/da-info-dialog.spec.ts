import { expect } from '@open-wc/testing';
import { Nsdoc } from '../../foundation/nsdoc.js';
import { MISSING_VALUE } from '../../foundation.js';
import { buildDaInfoGroups } from './da-info-dialog.js';
import { parseDoc, testDocs } from '../../test-utils/test-files.js';
import { getFirstAndAssertBySelector } from '../../test-utils/queries.js';
import { getAncestors } from '../../test-utils/test-harness.js';

const nsdocStub: Nsdoc = {
  getDataDescription: (element: Element) => ({
    label: `${element.tagName}-label`,
  }),
};

describe('da-info-dialog', () => {
  it('builds groups for DA info with instance values', () => {
    const doc = parseDoc(testDocs.withIED_instanciated);

    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType > DA[name="stVal"]',
    );
    const doElement = getFirstAndAssertBySelector(doc, 'LNodeType > DO');
    const doiElement = getFirstAndAssertBySelector(doc, 'LN0 > DOI');
    const daiElement = doc.createElementNS(
      doc.documentElement.namespaceURI,
      'DAI',
    );
    daiElement.setAttribute('name', 'stVal');
    daiElement.setAttribute('desc', 'ValueDesc');
    const val = doc.createElementNS(doc.documentElement.namespaceURI, 'Val');
    val.textContent = 'on';
    daiElement.appendChild(val);
    doiElement.appendChild(daiElement);

    const ancestors = [
      ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN0']),
      doElement,
    ];

    const groups = buildDaInfoGroups({
      ancestors,
      nsdoc: nsdocStub,
      templateElement: daElement,
      instanceElement: daiElement,
    });

    expect(groups).to.have.lengthOf(4);
    expect(groups[0].map(field => field.label)).to.deep.equal([
      'NSDoc description',
      'Data attribute name',
      'Data attribute description',
      'Data attribute functional constraint',
      'Data attribute type',
      'Data attribute value',
    ]);
    expect(groups[0][0].value).to.equal('DA-label');
    expect(groups[0][1].value).to.equal('stVal');
    expect(groups[0][2].value).to.equal('ValueDesc');
    expect(groups[0][3].value).to.equal('ST');
    expect(groups[0][4].value).to.equal('Enum');
    expect(groups[0][5].value).to.equal('on');
    expect(groups[1][0].value).to.equal('Beh');
    expect(groups[1][1].value).to.equal('ENS');
    expect(groups[2][0].value).to.equal('L');
    expect(groups[2][2].value).to.equal('');
  });

  it('uses missing value placeholders when no instance values exist', () => {
    const doc = parseDoc(testDocs.withIED_instanciated);

    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType > DA[name="stVal"]',
    );
    const doElement = getFirstAndAssertBySelector(doc, 'LNodeType > DO');
    const ancestors = [
      ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN0']),
      doElement,
    ];

    const groups = buildDaInfoGroups({
      ancestors,
      nsdoc: nsdocStub,
      templateElement: daElement,
      instanceElement: null,
    });

    expect(groups[0][2].value).to.equal(MISSING_VALUE);
    expect(groups[0][5].value).to.equal(MISSING_VALUE);
  });
});
