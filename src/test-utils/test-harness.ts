/* eslint-disable import-x/no-extraneous-dependencies */
import { EditV2, CommitOptions, Commit, Plugin } from '@openscd/oscd-api';
import { XMLEditor } from '@openscd/oscd-editor';
import { LitElement } from 'lit';

import sinon from 'sinon';
import { ConfirmDeleteEvent, EVENTS } from '../foundation/events.js';

export class ComponentTestHarness {
  element: LitElement;
  editor: XMLEditor;
  commitSpy: sinon.SinonSpy<
    [change: EditV2, (CommitOptions | undefined)?],
    Commit<EditV2>
  >;

  protected handleEdit(event: Event): void {
    this.editor.commit((event as CustomEvent).detail.edit);
  }

  // eslint-disable-next-line class-methods-use-this
  protected handleDelete(confirmDeleteEvent: ConfirmDeleteEvent): void {
    confirmDeleteEvent.detail.onConfirm();
  }

  constructor(element: LitElement) {
    this.element = element;
    this.editor = new XMLEditor();
    this.commitSpy = sinon.spy(this.editor, 'commit');
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.element.addEventListener('oscd-edit-v2', this.handleEdit);
    this.element.addEventListener(EVENTS.CONFIRM_DELETE, this.handleDelete);
  }

  async dispose(): Promise<void> {
    this.commitSpy.restore();
    this.element.removeEventListener('oscd-edit-v2', this.handleEdit);
    this.element.removeEventListener(EVENTS.CONFIRM_DELETE, this.handleDelete);
    this.element.remove();
  }
}

export class PluginTestHarness extends ComponentTestHarness {
  plugin: Plugin & LitElement;

  protected handleEdit(event: Event): void {
    super.handleEdit(event);
    (this.plugin.docVersion as number)++;
  }

  async setDoc(docName: string, doc: XMLDocument): Promise<void> {
    this.plugin.docs = { [docName]: doc };
    this.plugin.docName = docName;
    this.plugin.doc = doc;
    await this.plugin.updateComplete;
  }

  constructor(plugin: Plugin & LitElement) {
    super(plugin);
    this.plugin = plugin;
  }
}
