export type InstanceCreationInsertStructurePlan = {
    kind: 'insert-structure';
    parent: Element;
    node: Element;
    instanceElement: Element;
};
export type InstanceCreationNoopPlan = {
    kind: 'noop';
    instanceElement: Element;
};
export type InstanceCreationPlan = InstanceCreationInsertStructurePlan | InstanceCreationNoopPlan;
/**
 * Function to get the path of template elements from the LN0 to the templateElement, given the list of ancestors
 * of the templateElement. This is used to determine which elements need to be initialized when creating a new
 * instance from a template.
 * @param templateElement - The template element to get the path for.
 * @param ancestors - The list of ancestor elements of the template element.
 * @returns An array of elements representing the path from LN0 to the template element.
 */
export declare function getTemplatePath(templateElement: Element, ancestors: Element[]): Element[];
/**
 * Determine which part of the template structure still needs to be initialized.
 * @param parentElement - The instance element to search from for DOI/SDI/DAI
 * @param templateStructure - The templates structure with DO/SDO/DA/BDA Elements.
 * @returns The last initialized element or LN(0) if nothing is initialized, and the list of remaining template elements.
 */
export declare function determineUninitializedStructure(parentElement: Element, templateStructure: Element[]): [Element, Element[]];
/**
 * Create a new instance structure defined by the array of template elements passed.
 * @param uninitializedTemplateStructure - Template elements to initialize.
 * @returns The Element created from the last Template Element in the Array.
 */
export declare function initializeElements(uninitializedTemplateStructure: Element[]): Element;
/**
 * Simple helper to map a template element to the tag name of the instance element that should be created from it.
 * This is used to to find the corresponding instance element within the initialized subtree.
 * @param template - The template element to map.
 * @returns The tag name of the instance element that should be created from the template element.
 */
export declare function mapTemplateToInstanceTag(template: Element): 'DOI' | 'SDI' | 'DAI';
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
export declare function planInstanceInitialization(lnElement: Element, templatePath: Element[]): InstanceCreationPlan;
