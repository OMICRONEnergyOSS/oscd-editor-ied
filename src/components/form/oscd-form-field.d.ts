import { LitElement, TemplateResult } from 'lit';
import { OscdSclSelect } from '@omicronenergy/oscd-ui/scl-select/OscdSclSelect.js';
import { OscdSclCheckbox } from '@omicronenergy/oscd-ui/scl-checkbox/OscdSclCheckbox.js';
import { OscdSclTextField } from '@omicronenergy/oscd-ui/scl-textfield/OscdSclTextField.js';
declare const OscdFormField_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
export declare class OscdFormField extends OscdFormField_base {
    static scopedElements: {
        'oscd-scl-select': typeof OscdSclSelect;
        'oscd-scl-text-field': typeof OscdSclTextField;
        'oscd-scl-checkbox': typeof OscdSclCheckbox;
    };
    name: string;
    label: string;
    helper: string;
    readonly: boolean;
    required: boolean;
    type: 'text' | 'checkbox' | 'select';
    enumValues?: string[];
    private get form();
    private get value();
    private get error();
    private handleTextChange;
    private handleCheckboxChange;
    private handleSelectChange;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}
export {};
