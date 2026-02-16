import { LitElement, TemplateResult } from 'lit';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';
declare const VirtualIedCreateDialog_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
/** A dialog component for creating virtual IEDs */
export declare class VirtualIedCreateDialog extends VirtualIedCreateDialog_base {
    static scopedElements: {
        'oscd-dialog': typeof OscdDialog;
        'oscd-filled-textfield': typeof OscdFilledTextField;
        'oscd-outlined-button': typeof OscdOutlinedButton;
        'oscd-filled-button': typeof OscdFilledButton;
    };
    doc: XMLDocument;
    onConfirm: (iedName: string) => void;
    private newIedName;
    dialog: OscdDialog;
    show(): void;
    private close;
    private handleCreate;
    private isIedNameValid;
    private getIedNameError;
    private isIedNameUnique;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}
export {};
