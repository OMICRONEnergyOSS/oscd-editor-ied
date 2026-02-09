import { EditV2, Insert } from '@openscd/oscd-api';
export declare const MDASH = "\u2014";
export declare const NDASH = "\u2013";
export declare const MISSING_VALUE = "\u2014";
/**
 * Search for an element with a passed tag-name in the list of ancestors passed.
 * @param ancestors - The list of elements to search in for an LN or LN0 element.
 * @param tagName - The Tag-name of the element to search for.
 * @returns The found element with the tag-name or null if not found.
 */
export declare function findElement(ancestors: Element[], tagName: string): Element | null;
export declare function findInsertedElement(edit: EditV2, tagName: string): Element | undefined;
/**
 * Find an existing LLN0 LNodeType in the document.
 * @param doc - The XML document to search in.
 * @returns The LLN0 LNodeType element or null if not found.
 */
export declare function findLLN0LNodeType(doc: XMLDocument): Element | null;
/**
 * Create a minimal LLN0 LNodeType with essential data objects.
 * @param doc - The XML document to create the LNodeType in.
 * @param id - Optional ID for the LNodeType, defaults to 'LLN0_OpenSCD'.
 * @returns Array of InsertV2 operations to create the LNodeType and dependencies.
 */
export declare function createLLN0LNodeType(doc: XMLDocument, id: string): Insert[];
/**
 * Create an AccessPoint element for an IED.
 * @param doc - The XML document to create the AccessPoint in.
 * @param name - The name for the new AccessPoint.
 * @returns The created AccessPoint element.
 */
export declare function createAccessPoint(doc: XMLDocument, name: string, desc: string | null): Element;
/**
 * Create a Server element.
 * @param doc - The XML document to create the ServerAt in.
 * @returns The created Server element.
 */
export declare function createServer(doc: XMLDocument): Element;
/**
 * Create a ServerAt element pointing to an existing AccessPoint.
 * @param doc - The XML document to create the ServerAt in.
 * @param apName - The name of the AccessPoint that contains the Server to reference.
 * @param desc - Optional description for the ServerAt element.
 * @returns The created ServerAt element.
 */
export declare function createServerAt(doc: XMLDocument, apName: string, desc?: string): Element;
/**
 * Get all existing AccessPoint names from the current IED.
 * @param ied - The IED element to search in.
 * @returns Array of AccessPoint names.
 */
export declare function getExistingAccessPointNames(ied: Element): string[];
/**
 * Get AccessPoint names that contain a Server element (can be referenced by ServerAt).
 * @param ied - The IED element to search in.
 * @returns Array of AccessPoint names that have Server elements.
 */
export declare function getAccessPointsWithServer(ied: Element): string[];
/**
 * With the passed DO Element retrieve the type attribute and search for the DOType in the DataType Templates section.
 * @param element - The DO Element.
 * @returns The DOType element found in the DataType Templates section or null if it not exists.
 */
export declare function findDOTypeElement(element: Element | null): Element | null;
/**
 * Get the instance element (SDI / DAI) of a DA element (if available)
 * @param parentInstance - The parent instance if available to search in for other instance elements.
 * @param da             - The (B)DA object to search with.
 * @returns The optional SDI / DAI element.
 */
export declare function getInstanceDAElement(parentInstance: Element | null, da: Element): Element | null;
export declare function getTitleForElementPath(element: Element): string;
/** @returns  Array of 'Val' elements for a given parent data attribute */
export declare function getValueElements(parent: Element): Element[];
/**
 * Get all LDevice inst values from a Server element.
 * @param server - The Server element to search in.
 * @returns Array of LDevice inst values.
 */
export declare function getLDeviceInsts(server: Element): string[];
/**
 * Get LNodeType elements from DataTypeTemplates in the document.
 * @param doc - The XML document to search in.
 * @returns Array of LNodeType elements.
 */
export declare function getLNodeTypes(doc: XMLDocument): Element[];
