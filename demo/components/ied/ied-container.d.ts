import { TemplateResult } from 'lit';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';
import { BaseContainer } from '../base-container.js';
import { AccessPointContainer } from '../access-point/access-point-container.js';
import { AccessPointCreateDialog } from './access-point-create-dialog.js';
declare const IedContainer_base: typeof BaseContainer & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
/** [[`IED`]] plugin subeditor for editing `IED` element. */
export declare class IedContainer extends IedContainer_base {
    static scopedElements: {
        'oscd-icon': typeof OscdIcon;
        'oscd-icon-button': typeof OscdIconButton;
        'oscd-action-pane': typeof OscdActionPane;
        'access-point-container': typeof AccessPointContainer;
        'access-point-create-dialog': typeof AccessPointCreateDialog;
    };
    selectedLNClasses: string[];
    accessPointDialog: AccessPointCreateDialog;
    private handleEditIed;
    private createAccessPoint;
    private handleEditServices;
    private removeIED;
    private header;
    private renderServicesIcon;
    render(): TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export {};
