export interface Nsdoc {
    nsdoc72?: XMLDocument;
    nsdoc73?: XMLDocument;
    nsdoc74?: XMLDocument;
    nsdoc81?: XMLDocument;
    getDataDescription: (element: Element, ancestors?: Element[]) => {
        label: string;
    };
}
/**
 * Initialize the full Nsdoc object.
 * @returns A fully initialized Nsdoc object for wizards/editors to use.
 */
export declare function initializeNsdoc(): Nsdoc;
