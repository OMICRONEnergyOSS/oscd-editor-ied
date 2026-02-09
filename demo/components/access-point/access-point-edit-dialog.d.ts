import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { LitElement, TemplateResult } from 'lit';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';
import { OscdSclTextField } from '@omicronenergy/oscd-ui/scl-textfield/OscdSclTextField.js';
/**
 * Validates an AccessPoint name against business rules
 * @param value - The name to validate
 * @param ied - The IED element to check for uniqueness
 * @returns Error message or empty string if valid
 */
export declare function validateApName(value: string, ied: Element, currentName?: string): string;
/**
 * Renders a validated AccessPoint name field
 */
export declare function renderApNameField({ value, ied, onInput, currentName, }: {
    value: string;
    ied: Element;
    onInput: (value: string) => void;
    currentName?: string;
}): TemplateResult;
/**
 * Renders a description field
 */
export declare function renderDescField({ value, onInput, label, }: {
    value: string | null;
    onInput: (value: string) => void;
    label?: string;
}): TemplateResult;
export interface AccessPointEditData {
    name: string;
    desc: string | null;
}
declare const AccessPointEditDialog_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
/** A dialog component for adding new AccessPoints */
export declare class AccessPointEditDialog extends AccessPointEditDialog_base {
    static scopedElements: {
        'oscd-dialog': typeof OscdDialog;
        'oscd-filled-text-field': typeof OscdFilledTextField;
        'oscd-filled-button': typeof OscdFilledButton;
        'oscd-outlined-button': typeof OscdOutlinedButton;
        'oscd-scl-text-field': typeof OscdSclTextField;
    };
    doc: XMLDocument;
    element: Element;
    onConfirm: (data: AccessPointEditData) => void;
    private apName;
    private desc;
    dialog: OscdDialog;
    apNameField: OscdFilledTextField;
    show(): void;
    private close;
    private handleUpdate;
    private reset;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}
export {};
