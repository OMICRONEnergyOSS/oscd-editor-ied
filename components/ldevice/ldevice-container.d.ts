import { TemplateResult } from 'lit';
import { BaseContainer } from '../base-container.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdSclIcon } from '@omicronenergy/oscd-ui/scl-icon/OscdSclIcon.js';
import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';
import { LNContainer } from '../lnode/ln-container.js';
import OscdSclDialogs from '@omicronenergy/oscd-scl-dialogs/OscdSclDialogs.js';
declare const LDeviceContainer_base: typeof BaseContainer & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
export declare class LDeviceContainer extends LDeviceContainer_base {
    static scopedElements: {
        'oscd-action-pane': typeof OscdActionPane;
        'oscd-icon-button': typeof OscdIconButton;
        'oscd-scl-icon': typeof OscdSclIcon;
        'oscd-icon': typeof OscdIcon;
        'ln-container': typeof LNContainer;
        'oscd-scl-dialogs': typeof OscdSclDialogs;
    };
    selectedLNClasses: string[];
    expanded: boolean;
    private oscdSclDialogs;
    private handleAddLN;
    private handleEditLDevice;
    private removeLDevice;
    private toggleExpanded;
    private header;
    private getLnElements;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}
export {};
