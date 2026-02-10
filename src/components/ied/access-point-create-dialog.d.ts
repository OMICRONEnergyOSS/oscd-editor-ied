import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdFilledSelect } from '@omicronenergy/oscd-ui/select/OscdFilledSelect.js';
import { OscdSwitch } from '@omicronenergy/oscd-ui/switch/OscdSwitch.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { LitElement, TemplateResult } from 'lit';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';
import { OscdSelectOption } from '@omicronenergy/oscd-ui/select/OscdSelectOption.js';
import { OscdSclTextField } from '@omicronenergy/oscd-ui/scl-textfield/OscdSclTextField.js';
export interface AccessPointCreateData {
    name: string;
    desc: string | null;
    createServerAt: boolean;
    serverAtApName?: string;
    serverAtDesc?: string;
}
declare const AccessPointCreateDialog_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
/** A dialog component for adding new AccessPoints */
export declare class AccessPointCreateDialog extends AccessPointCreateDialog_base {
    static scopedElements: {
        'oscd-dialog': typeof OscdDialog;
        'oscd-filled-text-field': typeof OscdFilledTextField;
        'oscd-filled-button': typeof OscdFilledButton;
        'oscd-outlined-button': typeof OscdOutlinedButton;
        'oscd-switch': typeof OscdSwitch;
        'oscd-filled-select': typeof OscdFilledSelect;
        'oscd-select-option': typeof OscdSelectOption;
        'oscd-scl-text-field': typeof OscdSclTextField;
    };
    doc: XMLDocument;
    ied: Element;
    onConfirm: (data: AccessPointCreateData) => void;
    private apName;
    private desc;
    private createServerAt;
    private serverAtApName;
    private serverAtDesc;
    dialog: OscdDialog;
    apNameField: OscdFilledTextField;
    show(): void;
    private close;
    private handleCreate;
    private reset;
    private renderServerAtSection;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}
export {};
