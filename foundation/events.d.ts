import { CreateWizard, EditWizard } from '@omicronenergy/oscd-scl-dialogs/OscdSclDialogs.js';
export declare enum EVENTS {
    FULL_ELEMENT_PATH = "full-element-path",
    ADD_ELEMENT = "oscd-editor-ied-add-element",
    EDIT_ELEMENT = "oscd-editor-ied-edit-element",
    IED_CREATED = "oscd-editor-ied-created",
    CONFIRM_DELETE = "confirm-delete"
}
export interface FullElementPathDetail {
    elementNames: string[];
}
export type FullElementPathEvent = CustomEvent<FullElementPathDetail>;
export declare function newFullElementPathEvent(elementNames: string[], eventInitDict?: CustomEventInit<FullElementPathDetail>): FullElementPathEvent;
export type CreateElementEvent = CustomEvent<CreateWizard>;
export declare function newAddElementEvent(detail: CreateWizard, eventInitDict?: CustomEventInit<CreateWizard>): CreateElementEvent;
export type EditElementEvent = CustomEvent<EditWizard>;
export declare function newEditElementEvent(detail: EditWizard, eventInitDict?: CustomEventInit<EditWizard>): EditElementEvent;
export type IedCreatedDetail = {
    iedName: string;
};
export type IedCreatedEvent = CustomEvent<IedCreatedDetail>;
export declare function newIedCreatedEvent(detail: IedCreatedDetail): IedCreatedEvent;
export type ConfirmDeleteDetail = {
    heading: string;
    message: string;
    onConfirm: () => void;
};
export type ConfirmDeleteEvent = CustomEvent<ConfirmDeleteDetail>;
export declare function newConfirmDeleteEvent(detail: ConfirmDeleteDetail): ConfirmDeleteEvent;
declare global {
    interface ElementEventMap {
        [EVENTS.FULL_ELEMENT_PATH]: FullElementPathEvent;
        [EVENTS.ADD_ELEMENT]: CreateElementEvent;
        [EVENTS.EDIT_ELEMENT]: EditElementEvent;
        [EVENTS.IED_CREATED]: IedCreatedEvent;
        [EVENTS.CONFIRM_DELETE]: ConfirmDeleteEvent;
    }
}
