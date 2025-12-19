import { Insert } from '@openscd/oscd-api';
import { insertSelectedLNodeType } from '@openscd/scl-lib';
import { createElement } from '@openscd/scl-lib/dist/foundation/utils.js';

/**
 * Search for an element with a passed tag-name in the list of ancestors passed.
 * @param ancestors - The list of elements to search in for an LN or LN0 element.
 * @param tagName - The Tag-name of the element to search for.
 * @returns The found element with the tag-name or null if not found.
 */
export function findElement(
  ancestors: Element[],
  tagName: string,
): Element | null {
  return ancestors.find(element => element.tagName === tagName) ?? null;
}

/**
 * Find an existing LLN0 LNodeType in the document.
 * @param doc - The XML document to search in.
 * @returns The LLN0 LNodeType element or null if not found.
 */
export function findLLN0LNodeType(doc: XMLDocument): Element | null {
  return doc.querySelector('DataTypeTemplates > LNodeType[lnClass="LLN0"]');
}

/**
 * Create a minimal LLN0 LNodeType with essential data objects.
 * @param doc - The XML document to create the LNodeType in.
 * @param id - Optional ID for the LNodeType, defaults to 'LLN0_OpenSCD'.
 * @returns Array of InsertV2 operations to create the LNodeType and dependencies.
 */
export function createLLN0LNodeType(doc: XMLDocument, id: string): Insert[] {
  const selection = {
    Beh: {
      stVal: {
        on: {},
        blocked: {},
        test: {},
        'test/blocked': {},
        off: {},
      },
      q: {},
      t: {},
    },
  };

  const logicalnode = {
    class: 'LLN0',
    id,
  };

  return insertSelectedLNodeType(doc, selection, logicalnode);
}

/**
 * Create an AccessPoint element for an IED.
 * @param doc - The XML document to create the AccessPoint in.
 * @param name - The name for the new AccessPoint.
 * @returns The created AccessPoint element.
 */
export function createAccessPoint(doc: XMLDocument, name: string): Element {
  return createElement(doc, 'AccessPoint', { name });
}

/**
 * Create a ServerAt element pointing to an existing AccessPoint.
 * @param doc - The XML document to create the ServerAt in.
 * @param apName - The name of the AccessPoint that contains the Server to reference.
 * @param desc - Optional description for the ServerAt element.
 * @returns The created ServerAt element.
 */
export function createServerAt(
  doc: XMLDocument,
  apName: string,
  desc?: string,
): Element {
  const attributes: Record<string, string> = { apName };

  if (desc) {
    attributes.desc = desc;
  }

  return createElement(doc, 'ServerAt', attributes);
}

/**
 * Get all existing AccessPoint names from the current IED.
 * @param ied - The IED element to search in.
 * @returns Array of AccessPoint names.
 */
export function getExistingAccessPointNames(ied: Element): string[] {
  return Array.from(ied.querySelectorAll(':scope > AccessPoint'))
    .map(ap => ap.getAttribute('name'))
    .filter((name): name is string => name !== null);
}

/**
 * Get AccessPoint names that contain a Server element (can be referenced by ServerAt).
 * @param ied - The IED element to search in.
 * @returns Array of AccessPoint names that have Server elements.
 */
export function getAccessPointsWithServer(ied: Element): string[] {
  return Array.from(ied.querySelectorAll(':scope > AccessPoint'))
    .filter(ap => ap.querySelector(':scope > Server'))
    .map(ap => ap.getAttribute('name'))
    .filter((name): name is string => name !== null);
}

/**
 * With the passed DO Element retrieve the type attribute and search for the DOType in the DataType Templates section.
 * @param element - The DO Element.
 * @returns The DOType element found in the DataType Templates section or null if it not exists.
 */
export function findDOTypeElement(element: Element | null): Element | null {
  if (element && element.hasAttribute('type')) {
    const type = element.getAttribute('type');
    return element
      .closest('SCL')!
      .querySelector(`:root > DataTypeTemplates > DOType[id="${type}"]`);
  }
  return null;
}

/**
 * Get the instance element (SDI / DAI) of a DA element (if available)
 * @param parentInstance - The parent instance if available to search in for other instance elements.
 * @param da             - The (B)DA object to search with.
 * @returns The optional SDI / DAI element.
 */
export function getInstanceDAElement(
  parentInstance: Element | null,
  da: Element,
): Element | null {
  if (parentInstance) {
    const daName = da.getAttribute('name');
    const bType = da.getAttribute('bType');
    if (bType == 'Struct') {
      return parentInstance.querySelector(`:scope > SDI[name="${daName}"]`);
    }
    return parentInstance.querySelector(`:scope > DAI[name="${daName}"]`);
  }
  return null;
}

export function getTitleForElementPath(element: Element): string {
  switch (element.tagName) {
    case 'LN':
    case 'LN0': {
      return element.getAttribute('lnClass')!;
    }
    case 'LDevice': {
      return (element.getAttribute('name') ?? element.getAttribute('inst'))!;
    }
    case 'Server': {
      return 'Server';
    }
    default: {
      return element.getAttribute('name')!;
    }
  }
}

/** @returns  Array of 'Val' elements for a given parent data attribute */
export function getValueElements(parent: Element): Element[] {
  return Array.from(parent.querySelectorAll('Val'));
}

/**
 * Get all LDevice inst values from a Server element.
 * @param server - The Server element to search in.
 * @returns Array of LDevice inst values.
 */
export function getLDeviceInsts(server: Element): string[] {
  return Array.from(server.querySelectorAll(':scope > LDevice')).map(
    ld => ld.getAttribute('inst') || '',
  );
}

/**
 * Get LNodeType elements from DataTypeTemplates in the document.
 * @param doc - The XML document to search in.
 * @returns Array of LNodeType elements.
 */
export function getLNodeTypes(doc: XMLDocument): Element[] {
  return Array.from(doc.querySelectorAll('DataTypeTemplates > LNodeType'));
}
