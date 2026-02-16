import { LitElement, TemplateResult } from 'lit';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
export type DaiTimestampFieldChange = {
    value: string;
    dateValue: string;
    timeValue: string;
    sGroup?: number | null;
};
declare const DaiTimestampField_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
export declare class DaiTimestampField extends DaiTimestampField_base {
    static scopedElements: {
        'oscd-filled-text-field': typeof OscdFilledTextField;
    };
    value: string;
    labelDate: string;
    labelTime: string;
    sGroup: number | null;
    disabled: boolean;
    private dateValue;
    private timeValue;
    protected willUpdate(changed: Map<string, unknown>): void;
    private handleChange;
    private onDateInput;
    private onTimeInput;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}
export {};
