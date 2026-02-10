import { LitElement, TemplateResult } from 'lit';
import { Nsdoc } from '../../foundation/nsdoc.js';
import { InfoDialog, InfoGroup } from '../info-dialog.js';
import { InfoContext } from '../do/do-info-dialog.js';
export declare function buildDaInfoGroups({ ancestors, nsdoc, templateElement, instanceElement, }: InfoContext): InfoGroup[];
declare const DaInfoDialog_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
/** Read-only info dialog for a DA/DAI */
export declare class DaInfoDialog extends DaInfoDialog_base {
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
