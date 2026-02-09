import { EditV2, CommitOptions, Commit, Plugin } from '@openscd/oscd-api';
import { XMLEditor } from '@openscd/oscd-editor';
import { LitElement } from 'lit';
import sinon from 'sinon';
import { ConfirmDeleteEvent } from '../foundation/events.js';
import { Nsdoc } from '../foundation/nsdoc.js';
export declare const nsdocStub: Nsdoc;
export declare const enumValues: string[];
export declare function getAncestors(doc: XMLDocument, selectors: string[]): Element[];
export declare class ComponentTestHarness {
    element: LitElement;
    editor: XMLEditor;
    commitSpy: sinon.SinonSpy<[
        change: EditV2,
        (CommitOptions | undefined)?
    ], Commit<EditV2>>;
    protected handleEdit(event: Event): void;
    protected handleDelete(confirmDeleteEvent: ConfirmDeleteEvent): void;
    constructor(element: LitElement);
    dispose(): Promise<void>;
}
export declare class PluginTestHarness extends ComponentTestHarness {
    plugin: Plugin & LitElement;
    protected handleEdit(event: Event): void;
    setDoc(docName: string, doc: XMLDocument): Promise<void>;
    constructor(plugin: Plugin & LitElement);
}
