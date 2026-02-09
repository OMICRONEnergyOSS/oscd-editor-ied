import { TemplateResult } from 'lit';
/** [[`IED`]] plugin subeditor for editing `DO` element. */
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdSclIcon } from '@omicronenergy/oscd-ui/scl-icon/OscdSclIcon.js';
import { BaseContainer } from '../base-container.js';
import { DAContainer } from '../da/da-container.js';
import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';
import { DoInfoDialog } from './do-info-dialog.js';
declare const DOContainer_base: typeof BaseContainer & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
export declare class DOContainer extends DOContainer_base {
    static scopedElements: {
        'oscd-outlined-button': typeof OscdOutlinedButton;
        'oscd-icon-button': typeof OscdIconButton;
        'oscd-scl-icon': typeof OscdSclIcon;
        'oscd-icon': typeof OscdIcon;
        'oscd-action-pane': typeof OscdActionPane;
        'do-container': typeof DOContainer;
        'da-container': typeof DAContainer;
        'do-info-dialog': typeof DoInfoDialog;
    };
    /**
     * The optional DOI of this DO.
     */
    instanceElement: Element;
    expanded: boolean;
    doInfoDialog: DoInfoDialog;
    private openInfoDialog;
    private toggleExpanded;
    private header;
    /**
     * Get the nested SDO element(s).
     * @returns The nested SDO element(s) of this DO container.
     */
    private getSDOElements;
    /**
     * Get the nested (B)DA element(s).
     * @returns The nested (B)DA element(s) of this DO container.
     */
    private getDAElements;
    /**
     * Get the instance element (SDI) of a (S)DO element (if available)
     * @param dO - The (S)DO object to search with.
     * @returns The optional SDI element.
     */
    private getInstanceDOElement;
    render(): TemplateResult;
}
export {};
