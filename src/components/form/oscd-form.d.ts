import { LitElement } from 'lit';
export type FormValue = string | number | boolean | null | {
    [key: string]: FormValue;
};
export interface OscdFormContext<FormValue> {
    getValue(path: string): FormValue | null;
    setValue(path: string, value: FormValue): void;
    getError(path: string): string | null;
}
export declare class OscdForm<T extends FormValue> extends LitElement {
    data: T;
    getValue(path: string): FormValue | null;
    setValue(_path: string, _value: FormValue): void;
    getError(_path: string): string | null;
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
