import { LitElement, PropertyValues, TemplateResult } from 'lit';
import { OscdListItem } from '@omicronenergy/oscd-ui/list/OscdListItem.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdFilterButton } from '@omicronenergy/oscd-ui/filter-button/OscdFilterButton.js';
import { OscdSclIcon } from '@omicronenergy/oscd-ui/scl-icon/OscdSclIcon.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { Nsdoc } from './foundation/nsdoc.js';
import { OpenscdApi } from './foundation/types.js';
import { IedContainer } from './components/ied/ied-container.js';
import { ElementPath } from './components/element-path.js';
import { ConfirmDeleteEvent, EditElementEvent } from './foundation/events.js';
import { ConfirmDeleteDialog } from './components/confirm-delete-dialog.js';
import { VirtualIedCreateDialog } from './components/virtual-ied-create-dialog.js';
import OscdSclDialogs from '@omicronenergy/oscd-scl-dialogs/OscdSclDialogs.js';
declare const OscdEditorIED_base: typeof LitElement & import("@open-wc/scoped-elements/lit-element.js").ScopedElementsHostConstructor;
/** An editor [[`plugin`]] for editing the `IED` section. */
export declare class OscdEditorIED extends OscdEditorIED_base {
    static scopedElements: {
        'oscd-outlined-button': typeof OscdOutlinedButton;
        'oscd-filter-button': typeof OscdFilterButton;
        'oscd-list-item': typeof OscdListItem;
        'oscd-scl-icon': typeof OscdSclIcon;
        'oscd-icon': typeof OscdIcon;
        'element-path': typeof ElementPath;
        'ied-container': typeof IedContainer;
        'oscd-scl-dialogs': typeof OscdSclDialogs;
        'virtual-ied-create-dialog': typeof VirtualIedCreateDialog;
        'confirm-delete-dialog': typeof ConfirmDeleteDialog;
    };
    /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
    doc: XMLDocument;
    docs: Record<string, XMLDocument>;
    docName: string;
    docVersion: number;
    /** All the nsdoc files that are being uploaded via the settings. */
    nsdoc: Nsdoc;
    oscdApi?: OpenscdApi | null;
    selectedIEDs: Element[];
    selectedLNClasses: string[];
    iedMap: {
        [key: string]: Element;
    };
    selectedElementPath: string[];
    private get iedList();
    private get lnClassList();
    private get selectedIed();
    sclDialog: OscdSclDialogs;
    createIedDialog: VirtualIedCreateDialog;
    confimDeleteDialog: ConfirmDeleteDialog;
    lNClassListOpenedOnce: boolean;
    private handleElementCreate;
    private handleIedCreated;
    handleEditElement(event: EditElementEvent): Promise<void>;
    handleConfirmDelete(event: ConfirmDeleteEvent): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected willUpdate(_changedProperties: PropertyValues): void;
    private loadPluginState;
    private storePluginState;
    private calcSelectedLNClasses;
    private onSelectionChange;
    private renderHeader;
    private renderSelectedIED;
    render(): TemplateResult;
    static styles: import("lit").CSSResult;
}
export {};
