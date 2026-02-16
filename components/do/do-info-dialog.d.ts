import { LitElement, TemplateResult } from 'lit';
import { Nsdoc } from '../../foundation/nsdoc.js';
import { InfoDialog, InfoGroup } from '../info-dialog.js';
export type InfoContext = {
    ancestors: Element[];
    nsdoc: Nsdoc;
    templateElement: Element | null;
    instanceElement?: Element | null;
    detailed?: boolean;
};
export declare function buildDoInfoGroups({ ancestors, nsdoc, templateElement, instanceElement, detailed, }: InfoContext): InfoGroup[];
declare const DoInfoDialog_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
/** Read-only info dialog for a DO/DOI */
export declare class DoInfoDialog extends DoInfoDialog_base {
    static scopedElements: {
        'info-dialog': typeof InfoDialog;
    };
    ancestors: Element[];
    nsdoc: Nsdoc;
    templateElement: Element;
    instanceElement: Element | null;
    private infoGroups;
    private infoDialog;
    show(): void;
    render(): TemplateResult;
}
export {};
