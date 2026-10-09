import { LitElement } from 'lit';
import { Nsdoc } from '../foundation/nsdoc.js';
declare const BaseContainer_base: typeof LitElement & import("@open-wc/dedupe-mixin").Constructor<import("@open-wc/scoped-elements/types.js").ScopedElementsHost> & import("@open-wc/scoped-elements/types.js").ScopedElementsHostConstructor;
/** Base class for all containers inside the IED Editor. */
export declare class BaseContainer extends BaseContainer_base {
    doc: XMLDocument;
    docVersion: number;
    element: Element;
    nsdoc: Nsdoc;
    ancestors: Element[];
    constructor();
}
export {};
