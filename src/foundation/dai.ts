import {
  InstanceCreationPlan,
  planInstanceInitialization,
} from './ln-initialization.js';

/**
 * Small helper function to resolve the DA element corresponding to a BDA element, by looking up the DAType
 * referenced by the BDA's parent DO and finding the DA with the matching type attribute. This is needed
 * because in SCL, BDA elements don't have an fc attribute themselves, but their corresponding DA does,
 * and we need to check that to determine if the BDA supports multiple values.
 * @param BDAElement - The BDA element to resolve the corresponding DA for.
 * @returns The corresponding DA element, or null if not found.
 */
export function resolveDaFromBDA(BDAElement: Element): Element | null {
  // TODO: This function is using root.querySelector('DOType > DA[type="..."]'). If multiple DOType contain a DA
  // referencing the same DAType id, this could resolve the “wrong” DA and thus the wrong fc for daSupportsMultipleValues(). If that
  // scenario is possible in SCL, consider scoping resolution via the actual template path context instead of a global query.
  const daTypeId = BDAElement.parentElement?.getAttribute('id');
  const root = BDAElement.getRootNode() as Document | Element;
  return root.querySelector(`DOType > DA[type="${daTypeId}"]`);
}

/**
 * Get the number of SGs from the ancestors of a given element. This is used to determine how many Val elements to create when initializing a DAI that supports multiple values.
 * @param ancestors - The list of ancestor elements of the element.
 * @returns The number of SGs, or null if not found.
 */
export function getNumOfSGs(ancestors: Element[]): number | null {
  const ldevice = ancestors.find(el => el.tagName === 'LDevice');
  const settingControl = ldevice?.querySelector('LN0 > SettingControl');
  const numOfSGs = settingControl?.getAttribute('numOfSGs');

  const num = Number(numOfSGs);
  return Number.isFinite(num) ? num : null;
}

/**
 * Determines if a given template element supports multiple values. This is true if the element is a BDA whose corresponding DA has an fc of SG or SE.
 * @param templateElement - The template element to check.
 * @returns True if the template element supports multiple values, false otherwise.
 */
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
 * Works out the initialization steps needed to create a DAI instance from a template, given the current state of the
 * instance structure. It does not perform any mutations itself, but returns a plan describing the necessary steps
 * to get from the current state to a valid DAI instance.
 * @param lnElement - The LN element to be initialized.
 * @param templatePath - Template elements to initialize within the lnElement above.
 * @returns The plan describing the necessary steps to get from the current state to a valid DAI instance. This will
 * either be an appendVal plan (if the structure is already initialized and we just need to add a Val), or an
 * insertStructure plan (if part or all of the structure needs to be initialized first).
 */
export function planDaiCreation(
  lnElement: Element,
  templatePath: Element[],
): InstanceCreationPlan {
  const plan = planInstanceInitialization(lnElement, templatePath);

  if (plan.kind === 'insert-structure') {
    return {
      kind: 'insert-structure',
      parent: plan.parent,
      node: plan.node,
      instanceElement: plan.instanceElement,
    };
  }

  return {
    kind: 'noop',
    instanceElement: plan.instanceElement,
  };
}
