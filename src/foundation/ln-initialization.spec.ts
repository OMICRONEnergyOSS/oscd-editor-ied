import { expect } from '@open-wc/testing';
import { getFirstAndAssertBySelector } from '../test-utils/queries.js';
import { parseDoc, testDocs } from '../test-utils/test-files.js';
import {
  determineUninitializedStructure,
  getTemplatePath,
  initializeElements,
  InstanceCreationInsertStructurePlan,
  mapTemplateToInstanceTag,
  planInstanceInitialization,
} from './ln-initialization.js';

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
  it('creates full DOI → SDI → DAI structure', () => {
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

describe('mapTemplateToInstanceTag', () => {
  const doc = parseDoc(testDocs.withIED_instanciated);

  it('maps DO to DOI', () => {
    const element = doc.querySelector(
      'LNodeType[id="LLN0_Test"] > DO[name="Beh"]',
    )!;
    expect(mapTemplateToInstanceTag(element)).to.equal('DOI');
  });

  it('maps SDO to SDI', () => {
    const element = doc.querySelector(
      'DOType[id="NestedBeh_Test"] > SDO[name="subBeh"]',
    )!;
    expect(mapTemplateToInstanceTag(element)).to.equal('SDI');
  });

  it('maps DA with bType!=Struct to DAI', () => {
    const element = doc.querySelector(
      'DOType[id="ARtg_Test"] > DA[name="setMag"]',
    )!;
    expect(mapTemplateToInstanceTag(element)).to.equal('DAI');
  });

  it('maps DA with bType=Struct to SDI', () => {
    const element = doc.querySelector(
      'DOType[id="HzRtg_Test"] > DA[name="setMag"]',
    )!;
    expect(mapTemplateToInstanceTag(element)).to.equal('SDI');
  });

  it('maps BDA with bType!=Struct to DAI', () => {
    const element = doc.querySelector(
      'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
    )!;
    expect(mapTemplateToInstanceTag(element)).to.equal('DAI');
  });

  it('maps BDA with bType=Struct to SDI', () => {
    const element = doc.querySelector(
      'DAType[id="AnalogueValueCtl"] > BDA[name="range"]',
    )!;
    expect(mapTemplateToInstanceTag(element)).to.equal('SDI');
  });

  it('throws on unsupported template element', () => {
    const element = doc.querySelector('LNodeType[id="LLN0_Test"]')!;
    expect(() => mapTemplateToInstanceTag(element)).to.throw(
      'Unsupported template element: LNodeType',
    );
  });
});

describe('planInstanceInitialization', () => {
  describe('with DA (HzRtg.setMag.i)', () => {
    it('Case 1: LN has nothing → insert DOI/SDI/DAI', () => {
      const { templateElement, lnElement, ancestors } = setupTestHarness({
        docContents: testDocs.withIED_instanciated,
        templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
        lnSelector: 'LDevice[inst="LD3"] LN[lnClass="TCTR"][inst="1"]',
        templatePathSelectors: [
          'LNodeType[id="TCTR_Test"] > DO[name="HzRtg"]',
          'DOType[id="HzRtg_Test"] > DA[name="setMag"]',
        ],
      });

      const templatePath = getTemplatePath(templateElement, ancestors);
      const plan = planInstanceInitialization(
        lnElement,
        templatePath,
      ) as InstanceCreationInsertStructurePlan;

      expect(plan.kind).to.equal('insert-structure');

      expect(plan.parent).to.equal(lnElement);

      expectStructure(plan.node, [
        { tag: 'DOI', attrs: { name: 'HzRtg' } },
        { tag: 'SDI', attrs: { name: 'setMag' } },
        { tag: 'DAI', attrs: { name: 'i' } },
      ]);

      expect(plan.instanceElement.getAttribute('name')).to.equal('i');
    });

    it('Case 2: DOI exists, empty → insert SDI/DAI', () => {
      const { templateElement, lnElement, ancestors } = setupTestHarness({
        docContents: testDocs.withIED_instanciated,
        templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
        lnSelector: 'LDevice[inst="LD3"] LN[lnClass="TCTR"][inst="2"]',
        templatePathSelectors: HZRTG_STRUCTURED_ANCESTORS,
      });

      const templatePath = getTemplatePath(templateElement, ancestors);
      const plan = planInstanceInitialization(
        lnElement,
        templatePath,
      ) as InstanceCreationInsertStructurePlan;

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
      const plan = planInstanceInitialization(
        lnElement,
        templatePath,
      ) as InstanceCreationInsertStructurePlan;

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
      const plan = planInstanceInitialization(
        lnElement,
        templatePath,
      ) as InstanceCreationInsertStructurePlan;

      expect(plan.kind).to.equal('insert-structure');
      expect(plan.parent.tagName).to.equal('SDI');
      expect(plan.parent.getAttribute('name')).to.equal('setMag');

      expectStructure(plan.node, [{ tag: 'DAI', attrs: { name: 'i' } }]);
    });

    it('Case 5: DAI exists, no Val → noop', () => {
      const { templateElement, lnElement, ancestors } = setupTestHarness({
        docContents: testDocs.withIED_instanciated,
        templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
        lnSelector: 'LDevice[inst="LD3"] LN[lnClass="TCTR"][inst="5"]',
        templatePathSelectors: HZRTG_STRUCTURED_ANCESTORS,
      });

      const templatePath = getTemplatePath(templateElement, ancestors);
      const plan = planInstanceInitialization(lnElement, templatePath);

      expect(plan.kind).to.equal('noop');
      expect(plan.instanceElement.tagName).to.equal('DAI');
      expect(plan.instanceElement.getAttribute('name')).to.equal('i');
    });

    it('Case 6: DAI and Val exist → noop (no mutation planning)', () => {
      const { templateElement, lnElement, ancestors } = setupTestHarness({
        docContents: testDocs.withIED_instanciated,
        templateSelector: 'DAType[id="AnalogueValueCtl"] > BDA[name="i"]',
        lnSelector: 'LDevice[inst="LD3"] LN[lnClass="TCTR"][inst="6"]',
        templatePathSelectors: HZRTG_STRUCTURED_ANCESTORS,
      });

      const templatePath = getTemplatePath(templateElement, ancestors);
      const plan = planInstanceInitialization(lnElement, templatePath);

      expect(plan.kind).to.equal('noop');
      expect(plan.instanceElement.getAttribute('name')).to.equal('i');
    });

    it('Case 7: DOI exists, wrong DAI → insert DAI', () => {
      const { templateElement, lnElement, ancestors } = setupTestHarness({
        docContents: testDocs.withIED_instanciated,
        templateSelector: 'DOType[id="ARtg_Test"] > DA[name="setMag"]',
        lnSelector: 'LDevice[inst="LD3"] LN[lnClass="TCTR"][inst="7"]',
        templatePathSelectors: ['LNodeType[id="TCTR_Test"] > DO[name="ARtg"]'],
      });

      const templatePath = getTemplatePath(templateElement, ancestors);
      const plan = planInstanceInitialization(
        lnElement,
        templatePath,
      ) as InstanceCreationInsertStructurePlan;

      expect(plan.kind).to.equal('insert-structure');
      expect(plan.parent.tagName).to.equal('DOI');
      expect(plan.parent.getAttribute('name')).to.equal('ARtg');

      expectStructure(plan.node, [{ tag: 'DAI', attrs: { name: 'setMag' } }]);
    });
  });
});
