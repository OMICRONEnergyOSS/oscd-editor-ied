import { LitElement, TemplateResult } from 'lit';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { OscdFilledSelect } from '@omicronenergy/oscd-ui/select/OscdFilledSelect.js';
import { OscdSelectOption } from '@omicronenergy/oscd-ui/select/OscdSelectOption.js';
export type DaiValueFieldChange = {
    value: string;
    sGroup?: number | null;
};
declare const DaiValueField_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
export declare class DaiValueField extends DaiValueField_base {
    static scopedElements: {
        'oscd-filled-text-field': typeof OscdFilledTextField;
        'oscd-filled-select': typeof OscdFilledSelect;
        'oscd-select-option': typeof OscdSelectOption;
    };
    bType: string;
    value: string;
    label: string;
    enumValues: string[];
    sGroup: number | null;
    disabled: boolean;
    private emitChange;
    private renderBoolean;
    private renderEnum;
    private renderText;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}
export {};
