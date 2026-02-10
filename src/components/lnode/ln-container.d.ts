import { BaseContainer } from '../base-container.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdSclIcon } from '@omicronenergy/oscd-ui/scl-icon/OscdSclIcon.js';
import { TemplateResult } from 'lit';
import { DOContainer } from '../do/do-container.js';
import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';
declare const LNContainer_base: typeof BaseContainer & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
/** [[`IED`]] plugin subeditor for editing `LN` and `LN0` element. */
export declare class LNContainer extends LNContainer_base {
    static scopedElements: {
        'oscd-outlined-button': typeof OscdOutlinedButton;
        'oscd-icon-button': typeof OscdIconButton;
        'oscd-scl-icon': typeof OscdSclIcon;
        'oscd-action-pane': typeof OscdActionPane;
        'oscd-icon': typeof OscdIcon;
        'do-container': typeof DOContainer;
    };
    expanded: boolean;
    private openEditWizard;
    private removeLN;
    private toggleExpanded;
    private header;
    /**
     * Get the DO child elements of this LN(0) section.
     * @returns The DO child elements, or an empty array if none are found.
     */
    private getDOElements;
    /**
     * Get the instance element (DOI) of a DO element (if available)
     * @param dO - The DO object to use.
     * @returns The optional DOI object.
     */
    private getInstanceElement;
    render(): TemplateResult;
}
export {};
