import { expect } from '@open-wc/testing';
import { getFirstAndAssertBySelector } from '../test-utils/queries.js';
import { parseDoc, testDocs } from '../test-utils/test-files.js';
import {
  DaiCreationInsertStructurePlan,
  daSupportsMultipleValues,
  determineUninitializedStructure,
  getNumOfSGs,
  getTemplatePath,
  initializeElements,
  planDaiCreation,
  resolveDaFromBDA,
} from './dai.js';

const HZRTG_STRUCTURED_ANCESTORS = [
  'LNodeType[id="TCTR_Test"] > DO[name="HzRtg"]',
  'DOType[id="HzRtg_Test"] > DA[name="setMag"]',
];

function setupTestHarness({
  docContents,
  templateSelector,
  lnSelector,
  templatePathSelectors = [],
}: {
  docContents: string;
  templateSelector: string;
  lnSelector: string;
  templatePathSelectors?: string[];
}) {
  const doc = parseDoc(docContents);

  const templateElement = getFirstAndAssertBySelector(doc, templateSelector);

  const lnElement = getFirstAndAssertBySelector(doc, lnSelector);

  const iedToLnAncestors: Element[] = [];
  let current: Element | null = lnElement;

  while (current) {
    iedToLnAncestors.push(current);

    if (current.tagName === 'IED') {
      break;
    }

    current = current.parentElement;
  }

  // reverse so it is [IED, ..., LN]
  iedToLnAncestors.reverse();

  const ancestors = [
    ...iedToLnAncestors,
    ...(templatePathSelectors.length
      ? templatePathSelectors.map(selector =>
          getFirstAndAssertBySelector(doc, selector),
        )
      : []),
  ];

  return {
    doc,
    templateElement,
    lnElement,
    ancestors,
  };
}

function expectStructure(
  root: Element,
  structure: {
    tag: string;
    attrs?: Record<string, string>;
  }[],
) {
  let current: Element | null = root;

  for (const { tag, attrs } of structure) {
    expect(current, `Expected ${tag} but got null`).to.exist;
    expect(current!.tagName).to.equal(tag);

    if (attrs) {
      for (const [key, value] of Object.entries(attrs)) {
        expect(current!.getAttribute(key)).to.equal(value);
      }
    }

    current = current!.firstElementChild;
  }
}

describe('getTemplateStructure tests', () => {
  it('returns only the template element when no DO ancestor exists', () => {
    const { templateElement, ancestors } = setupTestHarness({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DAType[id="AnalogueValue"] > BDA[name="i"]',
      lnSelector: 'IED[name="IED1"] LN0', // unused, but required by harness
    });

    const path = getTemplatePath(templateElement, ancestors);

    expect(path.length).to.equal(1);
    expect(path[0].tagName).to.equal('BDA');
    expect(path[0].getAttribute('name')).to.equal('i');
  });

  it('returns DO → DA path for a direct Data Attribute', () => {
    const { templateElement, ancestors } = setupTestHarness({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DOType[id="Beh_Test"] > DA[name="stVal"]',
      lnSelector: 'IED[name="IED1"] LN0',
      templatePathSelectors: ['LNodeType[id="LLN0_Test"] > DO[name="Beh"]'],
    });

    const path = getTemplatePath(templateElement, ancestors);

    expect(path.length).to.equal(2);

    expect(path[0].tagName).to.equal('DO');
    expect(path[0].getAttribute('name')).to.equal('Beh');

    expect(path[1].tagName).to.equal('DA');
    expect(path[1].getAttribute('name')).to.equal('stVal');
  });

  it('returns full template path for a structured Data Attribute', () => {
    const { templateElement, ancestors } = setupTestHarness({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
      lnSelector: 'IED[name="IED1"] LN0',
      templatePathSelectors: HZRTG_STRUCTURED_ANCESTORS,
    });

    const path = getTemplatePath(templateElement, ancestors);

    expect(path.length).to.equal(3);

    expect(path[0].tagName).to.equal('DO');
    expect(path[0].getAttribute('name')).to.equal('HzRtg');

    expect(path[1].tagName).to.equal('DA');
    expect(path[1].getAttribute('name')).to.equal('setMag');

    expect(path[2].tagName).to.equal('BDA');
    expect(path[2].getAttribute('name')).to.equal('i');
  });

  it('ignores ancestors before the DO element', () => {
    const { templateElement, ancestors } = setupTestHarness({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
      lnSelector: 'IED[name="IED1"] LN0',
      templatePathSelectors: [
        // Rubish prefix ancestors
        'LNodeType[id="TCTR_Test"]',
        ...HZRTG_STRUCTURED_ANCESTORS,
      ],
    });

    const path = getTemplatePath(templateElement, ancestors);

    expect(path.length).to.equal(3);

    expect(path[0].tagName).to.equal('DO');
    expect(path[0].getAttribute('name')).to.equal('HzRtg');

    expect(path[1].tagName).to.equal('DA');
    expect(path[1].getAttribute('name')).to.equal('setMag');

    expect(path[2].tagName).to.equal('BDA');
    expect(path[2].getAttribute('name')).to.equal('i');
  });
});

/*
 * Tip: The Case ID's (in test labels below) match the LN elements in test-files.ts
 * e.g. it('Case 1:... matches the LN (in LD3) with the comment <!-- Case 1... -->
 */
describe('determineUninitializedStructure tests', () => {
  it('Case 1: LN has nothing → missing DOI, SDI, DAI', () => {
    const { lnElement, templateElement, ancestors } = setupTestHarness({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
      lnSelector: 'LDevice[inst="LD3"] LN[inst="1"]',
      templatePathSelectors: HZRTG_STRUCTURED_ANCESTORS,
    });

    const templatePath = getTemplatePath(templateElement, ancestors);

    const [parent, missing] = determineUninitializedStructure(
      lnElement,
      templatePath,
    );

    expect(parent).to.equal(lnElement);
    expect(missing.map(e => e.tagName)).to.deep.equal(['DO', 'DA', 'BDA']);
  });

  it('Case 2: detects missing SDI and DAI when DOI exists', () => {
    const { lnElement, templateElement, ancestors } = setupTestHarness({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
      lnSelector: 'LDevice[inst="LD3"] LN[inst="2"]',
      templatePathSelectors: HZRTG_STRUCTURED_ANCESTORS,
    });

    const templateStructure = getTemplatePath(templateElement, ancestors);

    const [parent, missing] = determineUninitializedStructure(
      lnElement,
      templateStructure,
    );

    expect(parent.tagName).to.equal('DOI');
    expect(parent.getAttribute('name')).to.equal('HzRtg');
    expect(missing.map(e => e.tagName)).to.deep.equal(['DA', 'BDA']);
  });

  it('Case 3: DOI exists with unrelated DAI → missing SDI and DAI', () => {
    const { lnElement, templateElement, ancestors } = setupTestHarness({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
      lnSelector: 'LDevice[inst="LD3"] LN[inst="3"]',
      templatePathSelectors: HZRTG_STRUCTURED_ANCESTORS,
    });

    const templatePath = getTemplatePath(templateElement, ancestors);

    const [parent, missing] = determineUninitializedStructure(
      lnElement,
      templatePath,
    );

    expect(parent.tagName).to.equal('DOI');
    expect(parent.getAttribute('name')).to.equal('HzRtg');
    expect(missing.map(e => e.tagName)).to.deep.equal(['DA', 'BDA']);
  });

  it('Case 4: SDI exists, missing DAI → missing BDA only', () => {
    const { lnElement, templateElement, ancestors } = setupTestHarness({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
      lnSelector: 'LDevice[inst="LD3"] LN[inst="4"]',
      templatePathSelectors: HZRTG_STRUCTURED_ANCESTORS,
    });

    const templatePath = getTemplatePath(templateElement, ancestors);

    const [parent, missing] = determineUninitializedStructure(
      lnElement,
      templatePath,
    );

    expect(parent.tagName).to.equal('SDI');
    expect(parent.getAttribute('name')).to.equal('setMag');
    expect(missing.map(e => e.tagName)).to.deep.equal(['BDA']);
  });

  it('Case 5: DAI exists (no Val) → fully initialized', () => {
    const { lnElement, templateElement, ancestors } = setupTestHarness({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
      lnSelector: 'LDevice[inst="LD3"] LN[inst="5"]',
      templatePathSelectors: HZRTG_STRUCTURED_ANCESTORS,
    });

    const templatePath = getTemplatePath(templateElement, ancestors);

    const [parent, missing] = determineUninitializedStructure(
      lnElement,
      templatePath,
    );

    expect(parent.tagName).to.equal('DAI');
    expect(parent.getAttribute('name')).to.equal('i');
    expect(missing).to.deep.equal([]);
  });

  it('Case 6: DAI and Val exist → fully initialized', () => {
    const { lnElement, templateElement, ancestors } = setupTestHarness({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
      lnSelector: 'LDevice[inst="LD3"] LN[inst="6"]',
      templatePathSelectors: HZRTG_STRUCTURED_ANCESTORS,
    });

    const templatePath = getTemplatePath(templateElement, ancestors);

    const [parent, missing] = determineUninitializedStructure(
      lnElement,
      templatePath,
    );

    expect(parent.tagName).to.equal('DAI');
    expect(parent.getAttribute('name')).to.equal('i');
    expect(missing).to.deep.equal([]);
  });

  it('Case 7: Simple DA, DOI exists but wrong DAI → missing DA', () => {
    const { lnElement, templateElement, ancestors } = setupTestHarness({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DOType[id="ARtg_Test"] > DA[name="setMag"]',
      lnSelector: 'LDevice[inst="LD3"] LN[inst="7"]',
      templatePathSelectors: ['LNodeType[id="TCTR_Test"] > DO[name="ARtg"]'],
    });

    const templatePath = getTemplatePath(templateElement, ancestors);

    const [parent, missing] = determineUninitializedStructure(
      lnElement,
      templatePath,
    );

    expect(parent.tagName).to.equal('DOI');
    expect(parent.getAttribute('name')).to.equal('ARtg');
    expect(missing.map(e => e.tagName)).to.deep.equal(['DA']);
    expect(missing[0].getAttribute('name')).to.equal('setMag');
  });

  it('does not mutate inputs - safe to call multiple times', () => {
    /* Added this test as a regression test for input mutation */
    const { lnElement, templateElement, ancestors } = setupTestHarness({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DOType[id="ARtg_Test"] > DA[name="setMag"]',
      lnSelector: 'LDevice[inst="LD3"] LN[inst="7"]',
      templatePathSelectors: ['LNodeType[id="TCTR_Test"] > DO[name="ARtg"]'],
    });

    const templatePath = getTemplatePath(templateElement, ancestors);

    const r1 = determineUninitializedStructure(lnElement, templatePath);
    const r2 = determineUninitializedStructure(lnElement, templatePath);

    expect(r1).to.deep.equal(r2);
  });
});

describe('initializeElements tests', () => {
  it('creates full DOI → SDI → DAI → Val structure', () => {
    const { templateElement, ancestors } = setupTestHarness({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
      lnSelector: 'LDevice[inst="LD3"] LN[inst="1"]',
      templatePathSelectors: HZRTG_STRUCTURED_ANCESTORS,
    });

    const structure = getTemplatePath(templateElement, ancestors);
    const insertElement = initializeElements(structure);

    expectStructure(insertElement, [
      { tag: 'DOI', attrs: { name: 'HzRtg' } },
      { tag: 'SDI', attrs: { name: 'setMag' } },
      { tag: 'DAI', attrs: { name: 'i' } },
    ]);

    expect(
      Array.from(insertElement.querySelectorAll('DAI > Val')).length,
      'Inserted DAI should not contain Val elements',
    ).to.equal(0);
  });

  it('creates only DAI when template path contains only DA', () => {
    const { templateElement, lnElement, ancestors } = setupTestHarness({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DOType[id="ARtg_Test"] > DA[name="setMag"]',
      lnSelector: 'LDevice[inst="LD3"] LN[inst="7"]',
      templatePathSelectors: ['LNodeType[id="TCTR_Test"] > DO[name="ARtg"]'],
    });

    const structure = getTemplatePath(templateElement, ancestors);
    const [, missing] = determineUninitializedStructure(lnElement, structure);
    const insertElement = initializeElements(missing);

    expectStructure(insertElement, [{ tag: 'DAI', attrs: { name: 'setMag' } }]);
  });
});

describe('planDaiCreation', () => {
  describe('structured DA (HzRtg.setMag.i)', () => {
    it('Case 1: LN has nothing → insert DOI/SDI/DAI', () => {
      const { templateElement, lnElement, ancestors } = setupTestHarness({
        docContents: testDocs.withIED_instanciated,
        templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
        lnSelector: 'LDevice[inst="LD3"] LN[lnClass="TCTR"][inst="1"]',
        templatePathSelectors: HZRTG_STRUCTURED_ANCESTORS,
      });

      const templatePath = getTemplatePath(templateElement, ancestors);
      const plan = planDaiCreation(
        lnElement,
        templatePath,
      ) as DaiCreationInsertStructurePlan;

      expect(plan.kind).to.equal('insert-structure');

      expect(plan.parent).to.equal(lnElement);

      expectStructure(plan.node, [
        { tag: 'DOI', attrs: { name: 'HzRtg' } },
        { tag: 'SDI', attrs: { name: 'setMag' } },
        { tag: 'DAI', attrs: { name: 'i' } },
      ]);

      expect(plan.dai.getAttribute('name')).to.equal('i');
    });

    it('Case 2: DOI exists, empty → insert SDI/DAI', () => {
      const { templateElement, lnElement, ancestors } = setupTestHarness({
        docContents: testDocs.withIED_instanciated,
        templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
        lnSelector: 'LDevice[inst="LD3"] LN[lnClass="TCTR"][inst="2"]',
        templatePathSelectors: HZRTG_STRUCTURED_ANCESTORS,
      });

      const templatePath = getTemplatePath(templateElement, ancestors);
      const plan = planDaiCreation(
        lnElement,
        templatePath,
      ) as DaiCreationInsertStructurePlan;

      expect(plan.kind).to.equal('insert-structure');
      expect(plan.parent.tagName).to.equal('DOI');
      expect(plan.parent.getAttribute('name')).to.equal('HzRtg');

      expectStructure(plan.node, [
        { tag: 'SDI', attrs: { name: 'setMag' } },
        { tag: 'DAI', attrs: { name: 'i' } },
      ]);
    });

    it('Case 3: DOI exists, unrelated DAI → insert SDI/DAI', () => {
      const { templateElement, lnElement, ancestors } = setupTestHarness({
        docContents: testDocs.withIED_instanciated,
        templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
        lnSelector: 'LDevice[inst="LD3"] LN[lnClass="TCTR"][inst="3"]',
        templatePathSelectors: HZRTG_STRUCTURED_ANCESTORS,
      });

      const templatePath = getTemplatePath(templateElement, ancestors);
      const plan = planDaiCreation(
        lnElement,
        templatePath,
      ) as DaiCreationInsertStructurePlan;

      expect(plan.kind).to.equal('insert-structure');
      expect(plan.parent.tagName).to.equal('DOI');
      expect(plan.parent.getAttribute('name')).to.equal('HzRtg');

      expectStructure(plan.node, [
        { tag: 'SDI', attrs: { name: 'setMag' } },
        { tag: 'DAI', attrs: { name: 'i' } },
      ]);
    });

    it('Case 4: SDI exists, missing DAI → insert DAI only', () => {
      const { templateElement, lnElement, ancestors } = setupTestHarness({
        docContents: testDocs.withIED_instanciated,
        templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
        lnSelector: 'LDevice[inst="LD3"] LN[lnClass="TCTR"][inst="4"]',
        templatePathSelectors: HZRTG_STRUCTURED_ANCESTORS,
      });

      const templatePath = getTemplatePath(templateElement, ancestors);
      const plan = planDaiCreation(
        lnElement,
        templatePath,
      ) as DaiCreationInsertStructurePlan;

      expect(plan.kind).to.equal('insert-structure');
      expect(plan.parent.tagName).to.equal('SDI');
      expect(plan.parent.getAttribute('name')).to.equal('setMag');

      expectStructure(plan.node, [{ tag: 'DAI', attrs: { name: 'i' } }]);
    });

    it('Case 5: DAI exists, no Val → append-val', () => {
      const { templateElement, lnElement, ancestors } = setupTestHarness({
        docContents: testDocs.withIED_instanciated,
        templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
        lnSelector: 'LDevice[inst="LD3"] LN[lnClass="TCTR"][inst="5"]',
        templatePathSelectors: HZRTG_STRUCTURED_ANCESTORS,
      });

      const templatePath = getTemplatePath(templateElement, ancestors);
      const plan = planDaiCreation(lnElement, templatePath);

      expect(plan.kind).to.equal('append-val');
      expect(plan.dai.tagName).to.equal('DAI');
      expect(plan.dai.getAttribute('name')).to.equal('i');
    });

    it('Case 6: DAI and Val exist → append-val (no mutation planning)', () => {
      const { templateElement, lnElement, ancestors } = setupTestHarness({
        docContents: testDocs.withIED_instanciated,
        templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
        lnSelector: 'LDevice[inst="LD3"] LN[lnClass="TCTR"][inst="6"]',
        templatePathSelectors: HZRTG_STRUCTURED_ANCESTORS,
      });

      const templatePath = getTemplatePath(templateElement, ancestors);
      const plan = planDaiCreation(lnElement, templatePath);

      expect(plan.kind).to.equal('append-val');
      expect(plan.dai.getAttribute('name')).to.equal('i');
    });

    it('Case 7: DOI exists, wrong DAI → insert DAI', () => {
      const { templateElement, lnElement, ancestors } = setupTestHarness({
        docContents: testDocs.withIED_instanciated,
        templateSelector: 'DOType[id="ARtg_Test"] > DA[name="setMag"]',
        lnSelector: 'LDevice[inst="LD3"] LN[lnClass="TCTR"][inst="7"]',
        templatePathSelectors: ['LNodeType[id="TCTR_Test"] > DO[name="ARtg"]'],
      });

      const templatePath = getTemplatePath(templateElement, ancestors);
      const plan = planDaiCreation(
        lnElement,
        templatePath,
      ) as DaiCreationInsertStructurePlan;

      expect(plan.kind).to.equal('insert-structure');
      expect(plan.parent.tagName).to.equal('DOI');
      expect(plan.parent.getAttribute('name')).to.equal('ARtg');

      expectStructure(plan.node, [{ tag: 'DAI', attrs: { name: 'setMag' } }]);
    });
  });
});

describe('resolveDaFromBDA tests', () => {
  it('resolves DA from BDA via DAType reference', () => {
    const { templateElement } = setupTestHarness({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
      lnSelector: 'LDevice[inst="LD3"] LN[inst="1"]',
    });

    const da = resolveDaFromBDA(templateElement);

    // Assert via primitives only
    expect(da?.tagName).to.equal('DA');
    expect(da?.getAttribute('name')).to.equal('setMag');
  });

  it('returns null when BDA has no resolvable DAType parent', () => {
    const doc = document.implementation.createDocument(null, 'SCL');
    const orphanBda = doc.createElement('BDA');
    orphanBda.setAttribute('name', 'i');

    const da = resolveDaFromBDA(orphanBda);

    expect(da === null).to.equal(true);
  });
});

describe('getNumOfSGs tests', () => {
  it('returns numOfSGs when SettingControl exists', () => {
    const { ancestors } = setupTestHarness({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
      lnSelector: 'LDevice[inst="LD1"] LN[inst="1"]',
    });

    const numOfSGs = getNumOfSGs(ancestors);

    expect(numOfSGs).to.equal(5);
  });

  it('returns null when SettingControl is missing', () => {
    const { ancestors } = setupTestHarness({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
      lnSelector: 'LDevice[inst="LD3"] LN[inst="1"]',
    });

    const numOfSGs = getNumOfSGs(ancestors);

    expect(numOfSGs === null).to.equal(true);
  });

  it('returns null when numOfSGs is not numeric', () => {
    const doc = document.implementation.createDocument(null, 'SCL');
    const ldevice = doc.createElement('LDevice');
    const ln0 = doc.createElement('LN0');
    const settingControl = doc.createElement('SettingControl');

    settingControl.setAttribute('numOfSGs', 'not-a-number');
    ln0.appendChild(settingControl);
    ldevice.appendChild(ln0);

    const numOfSGs = getNumOfSGs([ldevice]);

    expect(numOfSGs === null).to.equal(true);
  });
});

describe('daSupportsMultipleValues tests', () => {
  it('returns true for DA with fc="SE"', () => {
    const { templateElement } = setupTestHarness({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DOType[id="ARtg_Test"] > DA[name="setMag"]',
      lnSelector: 'LDevice[inst="LD3"] LN[inst="1"]',
    });

    const supports = daSupportsMultipleValues(templateElement);

    expect(supports).to.equal(true);
  });

  it('returns true for DA with fc="SG"', () => {
    const { templateElement } = setupTestHarness({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DOType[id="ARtg_Test"] > DA[name="setVal"]',
      lnSelector: 'LDevice[inst="LD3"] LN[inst="1"]',
    });

    const supports = daSupportsMultipleValues(templateElement);

    expect(supports).to.equal(true);
  });

  it('returns false for DA with other fc', () => {
    const { templateElement } = setupTestHarness({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DOType[id="Beh_Test"] > DA[name="stVal"]',
      lnSelector: 'LDevice[inst="LD3"] LN[inst="1"]',
    });

    const supports = daSupportsMultipleValues(templateElement);

    expect(supports).to.equal(false);
  });

  it('returns true for BDA when resolved DA supports multiple values', () => {
    const { templateElement } = setupTestHarness({
      docContents: testDocs.withIED_instanciated,
      templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
      lnSelector: 'LDevice[inst="LD3"] LN[inst="1"]',
    });

    const supports = daSupportsMultipleValues(templateElement);

    expect(supports).to.equal(true);
  });

  it('returns false for BDA when DA cannot be resolved', () => {
    const doc = document.implementation.createDocument(null, 'SCL');
    const orphanBda = doc.createElement('BDA');
    orphanBda.setAttribute('name', 'i');

    const supports = daSupportsMultipleValues(orphanBda);

    expect(supports).to.equal(false);
  });
});
