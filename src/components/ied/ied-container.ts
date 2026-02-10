import { css, html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { msg } from '@lit/localize';

import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';

import { BaseContainer } from '../base-container.js';
import { AccessPointContainer } from '../access-point/access-point-container.js';
import {
  AccessPointCreateData,
  AccessPointCreateDialog,
} from './access-point-create-dialog.js';
import {
  newConfirmDeleteEvent,
  newEditElementEvent,
} from '../../foundation/events.js';
import { newEditEventV2 } from '@openscd/oscd-api/utils.js';
import {
  createAccessPoint,
  createServer,
  createServerAt,
} from '../../foundation.js';
import { Insert } from '@openscd/oscd-api';
import { removeIED } from '@openscd/scl-lib';
import { IedServicesAction } from './services/ied-services-action.js';

/** [[`IED`]] plugin subeditor for editing `IED` element. */
export class IedContainer extends ScopedElementsMixin(BaseContainer) {
  static scopedElements = {
    'oscd-icon': OscdIcon,
    'oscd-icon-button': OscdIconButton,
    'oscd-action-pane': OscdActionPane,
    'access-point-container': AccessPointContainer,
    'access-point-create-dialog': AccessPointCreateDialog,
    'ied-services-action': IedServicesAction,
  };

  @property({ type: Array })
  selectedLNClasses: string[] = [];

  @query('access-point-create-dialog')
  accessPointDialog!: AccessPointCreateDialog;

  private handleEditIed(): void {
    this.dispatchEvent(newEditElementEvent({ element: this.element }));
  }

  private createAccessPoint(data: AccessPointCreateData): void {
    const inserts: Insert[] = [];
    const accessPoint = createAccessPoint(this.doc, data.name, data.desc);

    inserts.push({
      parent: this.element,
      node: accessPoint,
      reference: null,
    });

    if (data.createServerAt && data.serverAtApName) {
      const serverAt = createServerAt(
        this.doc,
        data.serverAtApName,
        data.serverAtDesc,
      );
      inserts.push({
        parent: accessPoint,
        node: serverAt,
        reference: null,
      });
    } else {
      const server = createServer(this.doc);
      inserts.push({
        parent: accessPoint,
        node: server,
        reference: null,
      });
    }

    this.dispatchEvent(newEditEventV2(inserts));
  }

  private removeIED(): void {
    const heading = this.header();
    this.dispatchEvent(
      newConfirmDeleteEvent({
        heading: msg(`Delete`),
        message: msg(
          `Are you sure you want to delete IED "${heading}" and all its content?`,
        ),
        onConfirm: () => {
          this.dispatchEvent(newEditEventV2(removeIED({ node: this.element })));
        },
      }),
    );
  }

  private header() {
    const name = this.element.getAttribute('name') ?? '';
    const desc = this.element.getAttribute('desc');

    return `${name}${desc ? ` \u2014 ${desc}` : ''}`;
  }

  render() {
    return html` <oscd-action-pane .label="${this.header()}">
      <oscd-icon slot="icon">developer_board</oscd-icon>
      <abbr slot="action" title="${msg('remove')}">
        <oscd-icon-button
          data-testid="delete-ied-button"
          @click=${() => this.removeIED()}
        >
          <oscd-icon>delete</oscd-icon></oscd-icon-button
        >
      </abbr>
      <abbr slot="action" title="${msg('edit')}">
        <oscd-icon-button
          data-testid="edit-ied-button"
          @click=${(event: Event) => {
            event.stopPropagation();
            this.handleEditIed();
          }}
        >
          <oscd-icon>edit</oscd-icon></oscd-icon-button
        >
      </abbr>
      <abbr
        slot="action"
        title="${msg('Show Services the IED/AccessPoint provides')}"
      >
        <ied-services-action .ied=${this.element}></ied-services-action>
      </abbr>
      <abbr slot="action" title="${msg('Add AccessPoint')}">
        <oscd-icon-button
          data-testid="add-access-point-button"
          @click=${() => this.accessPointDialog.show()}
        >
          <oscd-icon>playlist_add</oscd-icon></oscd-icon-button
        >
      </abbr>
      ${Array.from(this.element.querySelectorAll(':scope > AccessPoint')).map(
        ap =>
          html`<access-point-container
            .docVersion=${this.docVersion}
            .doc=${this.doc}
            .element=${ap}
            .nsdoc=${this.nsdoc}
            .selectedLNClasses=${this.selectedLNClasses}
            .ancestors=${[this.element]}
          ></access-point-container>`,
      )}
      <access-point-create-dialog
        .doc=${this.doc}
        .ied=${this.element}
        .onConfirm=${(data: AccessPointCreateData) =>
          this.createAccessPoint(data)}
      ></access-point-create-dialog>
    </oscd-action-pane>`;
  }

  static styles = css`
    abbr {
      text-decoration: none;
      border-bottom: none;
    }
  `;
}
