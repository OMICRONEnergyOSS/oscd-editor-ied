import { LitElement, TemplateResult } from 'lit';
import { OscdDivider } from '@omicronenergy/oscd-ui/divider/OscdDivider.js';
declare const OscdFormDivider_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
export declare class OscdFormDivider extends OscdFormDivider_base {
    static scopedElements: {
        'oscd-divider': typeof OscdDivider;
    };
    label?: string;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}
export {};
