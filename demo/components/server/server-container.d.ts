import { TemplateResult } from 'lit';
import { BaseContainer } from '../base-container.js';
import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdSclIcon } from '@omicronenergy/oscd-ui/scl-icon/OscdSclIcon.js';
import { LDeviceContainer } from '../ldevice/ldevice-container.js';
import OscdSclDialogs from '@omicronenergy/oscd-scl-dialogs/OscdSclDialogs.js';
declare const ServerContainer_base: typeof BaseContainer & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
/** [[`IED`]] plugin subeditor for editing `Server` element. */
export declare class ServerContainer extends ServerContainer_base {
    static scopedElements: {
        'oscd-icon': typeof OscdIcon;
        'oscd-scl-icon': typeof OscdSclIcon;
        'oscd-icon-button': typeof OscdIconButton;
        'oscd-action-pane': typeof OscdActionPane;
        'ldevice-container': typeof LDeviceContainer;
        'oscd-scl-dialogs': typeof OscdSclDialogs;
    };
    selectedLNClasses: string[];
    private oscdSclDialogs;
    private handleCreateLDevice;
    private header;
    private getLDeviceElements;
    render(): TemplateResult<1>;
}
export {};
