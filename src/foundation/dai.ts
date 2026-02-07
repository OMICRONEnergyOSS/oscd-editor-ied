import { createElement } from '@openscd/scl-lib/dist/foundation/utils.js';

const SCL_NAMESPACE = 'http://www.iec.ch/61850/2003/SCL';

export type DaiCreationInsertStructurePlan = {
  kind: 'insert-structure';
  parent: Element;
  node: Element;
  dai: Element;
};

export type DaiCreationAppendValPlan = {
  kind: 'append-val';
  dai: Element;
};
export type DaiCreationPlan =
  | DaiCreationInsertStructurePlan
  | DaiCreationAppendValPlan;

export function getTemplatePath(
  templateElement: Element,
  ancestors: Element[],
): Element[] {
  const doElement = ancestors.find(element => element.tagName === 'DO');
  if (!doElement) {
    return [templateElement];
  }

  const dataStructure = ancestors.slice(ancestors.indexOf(doElement));
  dataStructure.push(templateElement);
  return dataStructure;
}
//TODO:
// This function is using root.querySelector('DOType > DA[type="..."]'). If multiple DOType contain a DA
// referencing the same DAType id, this could resolve the “wrong” DA and thus the wrong fc for daSupportsMultipleValues(). If that
// scenario is possible in SCL, consider scoping resolution via the actual template path context instead of a global query.
export function resolveDaFromBDA(BDAElement: Element): Element | null {
  const daTypeId = BDAElement.parentElement?.getAttribute('id');
  const root = BDAElement.getRootNode() as Document | Element;
  return root.querySelector(`DOType > DA[type="${daTypeId}"]`);
}

export function getNumOfSGs(ancestors: Element[]): number | null {
  const ldevice = ancestors.find(el => el.tagName === 'LDevice');
  const settingControl = ldevice?.querySelector('LN0 > SettingControl');
  const numOfSGs = settingControl?.getAttribute('numOfSGs');

  const num = Number(numOfSGs);
  return Number.isFinite(num) ? num : null;
}

export function daSupportsMultipleValues(templateElement: Element): boolean {
  const da =
    templateElement.tagName === 'BDA'
      ? resolveDaFromBDA(templateElement)
      : templateElement;

  if (!da) {
    return false;
  }

  const fc = da.getAttribute('fc');
  return fc === 'SG' || fc === 'SE';
}

/**
 * Determine which part of the template structure still needs to be initialized.
 * @param parentElement - The instance element to search from for DOI/SDI
 * @param templateStructure - The templates structure with DO/DA/BDA Elements.
 * @returns The last initialized element or LN(0) if nothing is initialized, and the list of remaining template elements.
 */
export function determineUninitializedStructure(
  parentElement: Element,
  templateStructure: Element[],
): [Element, Element[]] {
  // TODO - handle empty templateStructure (fail early)
  // function relies on templateElement! and assumes templateStructure is non-empty. If an upstream caller ever passes [],
  // we’ll get a runtime error; a defensive early-throw would make failures clearer.
  const [templateElement, ...templateRest] = templateStructure;

  let instanceElement: Element | null;
  if (templateRest.length > 0) {
    if (templateElement!.tagName === 'DO') {
      instanceElement = parentElement.querySelector(
        `DOI[name="${templateElement!.getAttribute('name')}"]`,
      );
    } else {
      instanceElement = parentElement.querySelector(
        `SDI[name="${templateElement!.getAttribute('name')}"]`,
      );
    }

    if (instanceElement) {
      return determineUninitializedStructure(instanceElement, templateRest);
    }

    return [parentElement, [templateElement, ...templateRest]];
  }

  instanceElement = parentElement.querySelector(
    `DAI[name="${templateElement!.getAttribute('name')}"]`,
  );
  if (instanceElement) {
    return [instanceElement, []];
  }

  return [parentElement, [templateElement!]];
}

/**
 * Create a new instance structure defined by the array of template elements passed.
 * @param uninitializedTemplateStructure - Template elements to initialize.
 * @returns The Element created from the last Template Element in the Array.
 */
export function initializeElements(
  uninitializedTemplateStructure: Element[],
): Element {
  // TODO - this function mutates its input array via .shift(). That’s OK given current usage (the arrays passed in are freshly constructed),
  // but it’s a “footgun” API; Switch to an index-based || functional implementation to keep it pure like the other primitives.
  const element = uninitializedTemplateStructure.shift();
  if (uninitializedTemplateStructure.length > 0) {
    let newElement: Element;
    if (element!.tagName === 'DO') {
      newElement = element!.ownerDocument.createElementNS(SCL_NAMESPACE, 'DOI');
    } else {
      newElement = element!.ownerDocument.createElementNS(SCL_NAMESPACE, 'SDI');
    }
    newElement.setAttribute('name', element?.getAttribute('name') ?? '');

    const childElement = initializeElements(uninitializedTemplateStructure);
    newElement.append(childElement);

    return newElement;
  }

  const daiElement = createElement(element!.ownerDocument, 'DAI', {
    name: element?.getAttribute('name') ?? '',
  });
  return daiElement;
}

export function planDaiCreation(
  lnElement: Element,
  templatePath: Element[],
): DaiCreationPlan {
  // 1. Walk the instance using the trusted primitive
  const [lastInitialized, uninitializedTemplatePath] =
    determineUninitializedStructure(lnElement, templatePath);

  // 2. If something is missing → insert-structure
  if (uninitializedTemplatePath.length > 0) {
    const subtree = initializeElements(uninitializedTemplatePath);

    // subtree is DAI | DOI | SDI
    const dai =
      subtree.tagName === 'DAI' ? subtree : subtree.querySelector('DAI');
    if (!dai) {
      throw new Error('Invariant violation: initialized subtree has no DAI');
    }

    return {
      kind: 'insert-structure',
      parent: lastInitialized,
      node: subtree,
      dai,
    };
  }

  // 3. Otherwise → append-val
  const dai =
    lastInitialized.tagName === 'DAI'
      ? lastInitialized
      : lastInitialized.querySelector('DAI');

  if (!dai) {
    throw new Error('Invariant violation: structure exists but no DAI found');
  }

  return {
    kind: 'append-val',
    dai,
  };
}
