import { createElement } from '@omicronenergy/oscd-edit-dialog';
import { Insert } from '@openscd/oscd-api';
import {
  createLLN0LNodeType,
  findElement,
  findLLN0LNodeType,
} from '../foundation.js';

/**
 * Search for the LN0 or LN element in the list of ancestors passed.
 * @param ancestors - The list of elements to search in for an LN or LN0 element.
 * @returns The LN0/LN Element found or null if not found.
 */
export function findLogicalNodeElement(ancestors: Element[]): Element | null {
  let element = findElement(ancestors, 'LN0');
  if (!element) {
    element = findElement(ancestors, 'LN');
  }
  return element;
}

/**
 * Create a basic IED structure with the specified name.
 * @param doc - The XML document to create the IED in.
 * @param iedName - The name for the new IED.
 * @param lnTypeId - The LNodeType ID to use for the LN0.
 * @param manufacturer - Optional manufacturer name, defaults to 'OpenSCD'.
 * @returns The created IED element.
 */
export function createIEDStructure(
  doc: XMLDocument,
  iedName: string,
  lnTypeId: string,
  manufacturer: string = 'OpenSCD',
): Element {
  const ied = createElement(doc, 'IED', {
    name: iedName,
    manufacturer,
  });

  const accessPoint = createElement(doc, 'AccessPoint', { name: 'AP1' });
  ied.appendChild(accessPoint);

  const server = createElement(doc, 'Server', {});
  accessPoint.appendChild(server);

  const authentication = createElement(doc, 'Authentication', {});
  server.appendChild(authentication);

  const lDevice = createElement(doc, 'LDevice', { inst: 'LD1' });
  server.appendChild(lDevice);

  const ln0 = createElement(doc, 'LN0', {
    lnClass: 'LLN0',
    inst: '',
    lnType: lnTypeId,
  });
  lDevice.appendChild(ln0);

  return ied;
}

export function createVirtualIED(iedName: string, doc: XMLDocument): Insert[] {
  const inserts: Insert[] = [];

  const existingLLN0 = findLLN0LNodeType(doc);
  const lnTypeId = existingLLN0?.getAttribute('id') || 'PlaceholderLLN0';

  const ied = createIEDStructure(doc, iedName, lnTypeId);

  const dataTypeTemplates = doc.querySelector('DataTypeTemplates');
  inserts.push({
    parent: doc.querySelector('SCL')!,
    node: ied,
    reference: dataTypeTemplates,
  });

  if (!existingLLN0) {
    const lnodeTypeInserts = createLLN0LNodeType(doc, lnTypeId);
    inserts.push(...lnodeTypeInserts);
  }

  return inserts;
}
