import { LitElement, TemplateResult } from 'lit';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdFormGroup } from '../form/oscd-form-group.js';
import { OscdFormDivider } from '../form/oscd-form-divider.js';
import { OscdForm } from '../form/oscd-form.js';
import { OscdFormField } from '../form/oscd-form-field.js';
export type ServicePage = {
    title: string;
    renderer: () => TemplateResult;
};
declare const ServicesAction_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
export declare class ServicesAction extends ServicesAction_base {
    static scopedElements: {
        'oscd-icon': typeof OscdIcon;
        'oscd-icon-button': typeof OscdIconButton;
        'oscd-dialog': typeof OscdDialog;
        'oscd-filled-button': typeof OscdFilledButton;
        'oscd-outlined-button': typeof OscdOutlinedButton;
        'oscd-form': typeof OscdForm;
        'oscd-form-field': typeof OscdFormField;
        'oscd-form-divider': typeof OscdFormDivider;
        'oscd-form-group': typeof OscdFormGroup;
    };
    private _element;
    set element(value: Element);
    get element(): Element;
    private services;
    activeIndex: number;
    headline: string;
    private dialog;
    private pages;
    show(): void;
    private close;
    private selectIndex;
    render(): TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export {};
