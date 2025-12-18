import {
  CreateWizard,
  EditWizard,
} from '@omicronenergy/oscd-edit-dialog/OscdEditDialog.js';

export enum EVENTS {
  FULL_ELEMENT_PATH = 'full-element-path',
  ADD_ELEMENT = 'oscd-editor-ied-add-element',
  EDIT_ELEMENT = 'oscd-editor-ied-edit-element',
}

export interface FullElementPathDetail {
  elementNames: string[];
}
export type FullElementPathEvent = CustomEvent<FullElementPathDetail>;
export function newFullElementPathEvent(
  elementNames: string[],
  eventInitDict?: CustomEventInit<FullElementPathDetail>,
): FullElementPathEvent {
  return new CustomEvent<FullElementPathDetail>('full-element-path', {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: { elementNames, ...eventInitDict?.detail },
  });
}

export type CreateElementEvent = CustomEvent<CreateWizard>;
export function newAddElementEvent(
  detail: CreateWizard,
  eventInitDict?: CustomEventInit<CreateWizard>,
): CreateElementEvent {
  return new CustomEvent<CreateWizard>(EVENTS.ADD_ELEMENT, {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: { ...detail, ...eventInitDict?.detail },
  });
}

export type EditElementEvent = CustomEvent<EditWizard>;
export function newEditElementEvent(
  detail: EditWizard,
  eventInitDict?: CustomEventInit<EditWizard>,
): EditElementEvent {
  return new CustomEvent<EditWizard>(EVENTS.EDIT_ELEMENT, {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: { ...detail, ...eventInitDict?.detail },
  });
}

declare global {
  interface ElementEventMap {
    [EVENTS.FULL_ELEMENT_PATH]: FullElementPathEvent;
    [EVENTS.ADD_ELEMENT]: CreateElementEvent;
    [EVENTS.EDIT_ELEMENT]: EditElementEvent;
  }
}
