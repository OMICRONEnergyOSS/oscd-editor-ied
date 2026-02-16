import { LitElement, TemplateResult } from 'lit';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';
export type InfoField = {
    label: string;
    value: string;
    multiline?: boolean;
    rows?: number;
};
export type InfoGroup = InfoField[];
declare const InfoDialog_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
/** Read-only info dialog composed of grouped label/value fields. */
export declare class InfoDialog extends InfoDialog_base {
    static scopedElements: {
        'oscd-dialog': typeof OscdDialog;
        'oscd-filled-button': typeof OscdFilledButton;
        'oscd-filled-text-field': typeof OscdFilledTextField;
    };
    infoGroups: InfoGroup[];
    headline: string;
    private dialog;
    show(): void;
    private close;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}
export {};
