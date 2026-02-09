import { LitElement, TemplateResult } from 'lit';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { ConfirmDeleteDetail } from '../foundation/events.js';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
declare const ConfirmDeleteDialog_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
/** A dialog component for creating virtual IEDs */
export declare class ConfirmDeleteDialog extends ConfirmDeleteDialog_base {
    static scopedElements: {
        'oscd-dialog': typeof OscdDialog;
        'oscd-outlined-button': typeof OscdOutlinedButton;
        'oscd-filled-button': typeof OscdFilledButton;
    };
    private heading?;
    private message?;
    private onConfirm?;
    dialog: OscdDialog;
    confirmDelete(details: ConfirmDeleteDetail): void;
    private close;
    private handleConfirm;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}
export {};
