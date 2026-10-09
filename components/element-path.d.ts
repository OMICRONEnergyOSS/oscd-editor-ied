import { LitElement, TemplateResult } from 'lit';
declare const ElementPath_base: typeof LitElement & import("@open-wc/dedupe-mixin").Constructor<import("@open-wc/scoped-elements/types.js").ScopedElementsHost> & import("@open-wc/scoped-elements/types.js").ScopedElementsHostConstructor;
export declare class ElementPath extends ElementPath_base {
    paths: string[];
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}
export {};
