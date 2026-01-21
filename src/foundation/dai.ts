const SCL_NAMESPACE = 'http://www.iec.ch/61850/2003/SCL';

/**
 * Determine which part of the template structure still needs to be initialized.
 * @param parentElement - The element to search from for DOI/SDI
 * @param templateStructure - The templates structure with DO/DA/BDA Elements.
 * @returns The last initialized element or LN(0) if nothing is initialized, and the list of remaining template elements.
 */
export function determineUninitializedStructure(
  parentElement: Element,
  templateStructure: Element[],
): [Element, Element[]] {
  const templateElement = templateStructure.shift();
  if (templateStructure.length > 0) {
    let instanceElement: Element | null;
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
      return determineUninitializedStructure(
        instanceElement,
        templateStructure,
      );
    }

    templateStructure.unshift(templateElement!);
    return [parentElement, templateStructure];
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

  const newValElement = element!.ownerDocument.createElementNS(
    SCL_NAMESPACE,
    'Val',
  );
  const valElement = element!.querySelector('Val');
  if (valElement) {
    newValElement.textContent = valElement.textContent;
  }

  const daiElement = element!.ownerDocument.createElementNS(
    SCL_NAMESPACE,
    'DAI',
  );
  daiElement.setAttribute('name', element?.getAttribute('name') ?? '');
  daiElement.append(newValElement);
  return daiElement;
}
