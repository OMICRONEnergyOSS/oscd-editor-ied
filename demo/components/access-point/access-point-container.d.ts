/** [[`IED`]] plugin subeditor for editing `AccessPoint` element. */
import { TemplateResult } from 'lit';
import { BaseContainer } from '../base-container.js';
import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { ServerContainer } from '../server/server-container.js';
import { OscdSclIcon } from '@omicronenergy/oscd-ui/scl-icon/OscdSclIcon.js';
import { LNContainer } from '../lnode/ln-container.js';
import { AccessPointEditData, AccessPointEditDialog } from './access-point-edit-dialog.js';
declare const AccessPointContainer_base: typeof BaseContainer & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
export declare class AccessPointContainer extends AccessPointContainer_base {
    static scopedElements: {
        'oscd-icon': typeof OscdIcon;
        'oscd-scl-icon': typeof OscdSclIcon;
        'oscd-icon-button': typeof OscdIconButton;
        'oscd-action-pane': typeof OscdActionPane;
        'server-container': typeof ServerContainer;
        'ln-container': typeof LNContainer;
        'access-point-edit-dialog': typeof AccessPointEditDialog;
    };
    selectedLNClasses: string[];
    accessPointDialog: AccessPointEditDialog;
    private openSettingsWizard;
    private removeAccessPoint;
    updateAccessPoint(data: AccessPointEditData): void;
    private header;
    private getLnElements;
    private renderServicesIcon;
    render(): TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export {};
