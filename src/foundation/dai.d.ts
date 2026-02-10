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
export type DaiCreationPlan = DaiCreationInsertStructurePlan | DaiCreationAppendValPlan;
export declare function getTemplatePath(templateElement: Element, ancestors: Element[]): Element[];
export declare function resolveDaFromBDA(BDAElement: Element): Element | null;
export declare function getNumOfSGs(ancestors: Element[]): number | null;
export declare function daSupportsMultipleValues(templateElement: Element): boolean;
/**
 * Determine which part of the template structure still needs to be initialized.
 * @param parentElement - The instance element to search from for DOI/SDI
 * @param templateStructure - The templates structure with DO/DA/BDA Elements.
 * @returns The last initialized element or LN(0) if nothing is initialized, and the list of remaining template elements.
 */
export declare function determineUninitializedStructure(parentElement: Element, templateStructure: Element[]): [Element, Element[]];
/**
 * Create a new instance structure defined by the array of template elements passed.
 * @param uninitializedTemplateStructure - Template elements to initialize.
 * @returns The Element created from the last Template Element in the Array.
 */
export declare function initializeElements(uninitializedTemplateStructure: Element[]): Element;
export declare function planDaiCreation(lnElement: Element, templatePath: Element[]): DaiCreationPlan;
