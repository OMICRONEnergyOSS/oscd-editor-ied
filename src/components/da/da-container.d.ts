import { TemplateResult } from 'lit';
import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdSclIcon } from '@omicronenergy/oscd-ui/scl-icon/OscdSclIcon.js';
import { BaseContainer } from '../base-container.js';
import { DaiValueCreateDialog } from './dai-value-create-dialog.js';
import { DaiValueEditDialog } from './dai-value-edit-dialog.js';
import { DaInfoDialog } from './da-info-dialog.js';
declare const DAContainer_base: typeof BaseContainer & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
/** [[`IED`]] plugin subeditor for editing `(B)DA` element. */
export declare class DAContainer extends DAContainer_base {
    static scopedElements: {
        'oscd-action-pane': typeof OscdActionPane;
        'oscd-icon-button': typeof OscdIconButton;
        'oscd-scl-icon': typeof OscdSclIcon;
        'oscd-icon': typeof OscdIcon;
        'da-container': typeof DAContainer;
        'dai-value-create-dialog': typeof DaiValueCreateDialog;
        'dai-value-edit-dialog': typeof DaiValueEditDialog;
        'da-info-dialog': typeof DaInfoDialog;
    };
    /**
     * The optional DAI of this (B)DA.
     */
    instanceElement: Element | null;
    expanded: boolean;
    daiValueCreateDialog: DaiValueCreateDialog;
    daiValueEditDialog: DaiValueEditDialog;
    daInfoDialog: DaInfoDialog;
    private openCreateDialog;
    private openEditDialog;
    private openInfoDialog;
    private toggleExpanded;
    private header;
    /**
     * Get the nested (B)DA element(s) if available.
     * @returns The nested (B)DA element(s) of this (B)DA container.
     */
    private getBDAElements;
    private renderValueSection;
    private getMultipleSettingGroupCount;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}
export {};
