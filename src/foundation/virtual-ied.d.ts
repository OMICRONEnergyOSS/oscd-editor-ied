import { Insert } from '@openscd/oscd-api';
/**
 * Search for the LN0 or LN element in the list of ancestors passed.
 * @param ancestors - The list of elements to search in for an LN or LN0 element.
 * @returns The LN0/LN Element found or null if not found.
 */
export declare function findLogicalNodeElement(ancestors: Element[]): Element | null;
/**
 * Create a basic IED structure with the specified name.
 * @param doc - The XML document to create the IED in.
 * @param iedName - The name for the new IED.
 * @param lnTypeId - The LNodeType ID to use for the LN0.
 * @param manufacturer - Optional manufacturer name, defaults to 'OpenSCD'.
 * @returns The created IED element.
 */
export declare function createIEDStructure(doc: XMLDocument, iedName: string, lnTypeId: string, manufacturer?: string): Element;
export declare function createVirtualIED(iedName: string, doc: XMLDocument): Insert[];
