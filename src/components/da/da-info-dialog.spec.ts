import { expect } from '@open-wc/testing';
import { MISSING_VALUE } from '../../foundation.js';
import { buildDaInfoGroups } from './da-info-dialog.js';
import { parseDoc, testDocs } from '../../test-utils/test-files.js';
import { getFirstAndAssertBySelector } from '../../test-utils/queries.js';
import { getAncestors, nsdocStub } from '../../test-utils/test-harness.js';

describe('da-info-dialog', () => {
  it('builds groups for DA info with instance values', () => {
    const doc = parseDoc(testDocs.withIED_instanciated);

    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType[id="ARtg_Test"] > DA[name="setVal"]',
    );
    const doElement = getFirstAndAssertBySelector(
      doc,
      'LNodeType[id="TCTR_Test"] > DO[name="ARtg"]',
    );
    const daiElement = getFirstAndAssertBySelector(
      doc,
      'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"] > DAI[name="setVal"]',
    );

    const ancestors = [
      ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN']),
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
    expect(groups[0][1].value).to.equal('setVal');
    expect(groups[0][2].value).to.equal(MISSING_VALUE);
    expect(groups[0][3].value).to.equal('SG');
    expect(groups[0][4].value).to.equal('INT32');
    expect(groups[0][5].value).to.equal('10, 12, 13, 14, 15');
    expect(groups[1][0].value).to.equal('ARtg');
    expect(groups[1][1].value).to.equal('ASG');
    expect(groups[2][0].value).to.equal(MISSING_VALUE);
    expect(groups[2][2].value).to.equal('1');
  });

  it('uses missing value placeholders when no instance values exist', () => {
    const doc = parseDoc(testDocs.withIED_instanciated);

    const daElement = getFirstAndAssertBySelector(
      doc,
      'DOType[id="ARtg_Test"] > DA[name="setVal"]',
    );
    const doElement = getFirstAndAssertBySelector(
      doc,
      'LNodeType[id="TCTR_Test"] > DO[name="ARtg"]',
    );
    const ancestors = [
      ...getAncestors(doc, ['IED', 'AccessPoint', 'LDevice', 'LN']),
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
