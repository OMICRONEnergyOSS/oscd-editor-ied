import { createElement } from '@openscd/scl-lib/dist/foundation/utils.js';

export type InstanceCreationInsertStructurePlan = {
  kind: 'insert-structure';
  parent: Element;
  node: Element;
  instanceElement: Element; // DOI | SDI | DAI
};

export type InstanceCreationNoopPlan = {
  kind: 'noop';
  instanceElement: Element;
};

export type InstanceCreationPlan =
  | InstanceCreationInsertStructurePlan
  | InstanceCreationNoopPlan;

/**
 * Function to get the path of template elements from the LN0 to the templateElement, given the list of ancestors
 * of the templateElement. This is used to determine which elements need to be initialized when creating a new
 * instance from a template.
 * @param templateElement - The template element to get the path for.
 * @param ancestors - The list of ancestor elements of the template element.
 * @returns An array of elements representing the path from LN0 to the template element.
 */
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

/**
 * Determine which part of the template structure still needs to be initialized.
 * @param parentElement - The instance element to search from for DOI/SDI/DAI
 * @param templateStructure - The templates structure with DO/SDO/DA/BDA Elements.
 * @returns The last initialized element or LN(0) if nothing is initialized, and the list of remaining template elements.
 */
export function determineUninitializedStructure(
  parentElement: Element,
  templateStructure: Element[],
): [Element, Element[]] {
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
  const [tipElement, ...restOfUninitializedTemplateStructure] =
    uninitializedTemplateStructure;
  if (restOfUninitializedTemplateStructure.length > 0) {
    let newElement: Element;
    const name = tipElement?.getAttribute('name') ?? '';
    if (tipElement!.tagName === 'DO') {
      newElement = createElement(tipElement!.ownerDocument, 'DOI', {
        name,
      });
    } else {
      newElement = createElement(tipElement!.ownerDocument, 'SDI', {
        name,
      });
    }

    const childElement = initializeElements(
      restOfUninitializedTemplateStructure,
    );
    newElement.append(childElement);

    return newElement;
  }

  const daiElement = createElement(tipElement!.ownerDocument, 'DAI', {
    name: tipElement?.getAttribute('name') ?? '',
  });
  return daiElement;
}

/**
 * Simple helper to map a template element to the tag name of the instance element that should be created from it.
 * This is used to to find the corresponding instance element within the initialized subtree.
 * @param template - The template element to map.
 * @returns The tag name of the instance element that should be created from the template element.
 */
export function mapTemplateToInstanceTag(
  template: Element,
): 'DOI' | 'SDI' | 'DAI' {
  const tag = template.tagName;

  if (tag === 'DO') {
    return 'DOI';
  }
  if (tag === 'SDO') {
    return 'SDI';
  }

  if (tag === 'DA' || tag === 'BDA') {
    const bType = template.getAttribute('bType');
    return bType === 'Struct' ? 'SDI' : 'DAI';
  }

  throw new Error(`Unsupported template element: ${tag}`);
}

/**
 * Works out the initialization steps needed to create an instance from a template, given the current state of the
 * instance structure. It does not perform any mutations itself, but returns a plan describing the necessary steps
 * to get from the current state to a valid instance.
 * @param lnElement - The LN element to be initialized.
 * @param templatePath - Template elements to initialize within the lnElement above.
 * @returns The plan describing the necessary steps to get from the current state to a valid instance. This will
 * either be a noop plan (if the structure is already initialized), or an insertStructure plan (if part or all
 * of the structure needs to be initialized first).
 */
export function planInstanceInitialization(
  lnElement: Element,
  templatePath: Element[],
): InstanceCreationPlan {
  const [lastInitialized, uninitializedTemplatePath] =
    determineUninitializedStructure(lnElement, templatePath);

  if (uninitializedTemplatePath.length > 0) {
    const subtree = initializeElements(uninitializedTemplatePath);

    const templateElement = templatePath[templatePath.length - 1];
    const targetInstanceTagName = mapTemplateToInstanceTag(templateElement);
    const targetInstanceNameAttr = templateElement.getAttribute('name') ?? '';
    const instanceElement =
      subtree.tagName === targetInstanceTagName &&
      subtree.getAttribute('name') === targetInstanceNameAttr
        ? subtree
        : subtree.querySelector(
            `${targetInstanceTagName}[name="${targetInstanceNameAttr}"]`,
          );
    if (!instanceElement) {
      throw new Error(
        'Instance initialization planning error: initialized subtree has no instance tip',
      );
    }

    return {
      kind: 'insert-structure',
      parent: lastInitialized,
      node: subtree,
      instanceElement,
    };
  }

  return {
    kind: 'noop',
    instanceElement: lastInitialized,
  };
}
