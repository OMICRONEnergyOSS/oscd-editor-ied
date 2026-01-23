/** [[`IED`]] plugin subeditor for editing `AccessPoint` element. */

// import { wizards } from '@omicronenergy/oscd-scl-dialogs/wizards.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { TemplateResult, html, css } from 'lit';
import { property, query } from 'lit/decorators.js';
import { BaseContainer } from '../base-container.js';
import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { ServerContainer } from '../server/server-container.js';
import { OscdSclIcon } from '@omicronenergy/oscd-ui/scl-icon/OscdSclIcon.js';
import { LDeviceContainer } from '../ldevice/ldevice-container.js';
import { msg } from '@lit/localize';

import { newEditEventV2 } from '@openscd/oscd-api/utils.js';
import { newConfirmDeleteEvent } from '../../foundation/events.js';
import {
  AccessPointEditData,
  AccessPointEditDialog,
} from './access-point-edit-dialog.js';

export class AccessPointContainer extends ScopedElementsMixin(BaseContainer) {
  static scopedElements = {
    'oscd-icon': OscdIcon,
    'oscd-scl-icon': OscdSclIcon,
    'oscd-icon-button': OscdIconButton,
    'oscd-action-pane': OscdActionPane,
    'server-container': ServerContainer,
    'ln-container': LDeviceContainer,
    'access-point-edit-dialog': AccessPointEditDialog,
  };

  @property()
  selectedLNClasses: string[] = [];

  @query('access-point-edit-dialog')
  accessPointDialog!: AccessPointEditDialog;

  private openSettingsWizard(services: Element): void {
    // const wizard = editServicesWizard(services);
    // if (wizard) {
    //   this.dispatchEvent(newWizardEvent(wizard));
    // }
    console.log('Please implement me', this, services);
  }

  private removeAccessPoint(): void {
    const name = this.header();
    this.dispatchEvent(
      newConfirmDeleteEvent({
        heading: msg(`Delete`),
        message: msg(
          `Are you sure you want to delete AccessPoint "${name}" and all its content?`,
        ),
        onConfirm: () => {
          this.dispatchEvent(newEditEventV2({ node: this.element }));
        },
      }),
    );
  }

  updateAccessPoint(data: AccessPointEditData) {
    this.dispatchEvent(
      newEditEventV2({
        element: this.element,
        attributes: {
          name: data.name,
          desc: data.desc,
        },
      }),
    );
  }

  private header() {
    const name = this.element.getAttribute('name') ?? '';
    const desc = this.element.getAttribute('desc');

    return `${name}${desc ? ` \u2014 ${desc}` : ''}`;
  }

  private getLnElements(): Element[] {
    return Array.from(this.element.querySelectorAll(':scope > LN')).filter(
      element => {
        const lnClass = element.getAttribute('lnClass') ?? '';
        return this.selectedLNClasses.includes(lnClass);
      },
    );
  }

  private renderServicesIcon(): TemplateResult {
    const services: Element | null = this.element.querySelector('Services');

    if (!services) {
      return html``;
    }

    return html` <oscd-icon-button
      slot="action"
      title="${msg('Show Services the IED/AccessPoint provides')}"
      @click=${() => this.openSettingsWizard(services)}
    >
      <oscd-icon>settings</oscd-icon>
    </oscd-icon-button>`;
  }

  override render() {
    const lnElements = this.getLnElements();

    return html`<oscd-action-pane .label="${this.header()}">
        <oscd-scl-icon slot="icon">accessPointIcon</oscd-scl-icon>
        <oscd-icon-button
          slot="action"
          title="${msg('remove')}"
          data-testid="delete-access-point-button"
          @click=${() => this.removeAccessPoint()}
        >
          <oscd-icon>delete</oscd-icon>
        </oscd-icon-button>
        <oscd-icon-button
          slot="action"
          title="${msg('edit')}"
          data-testid="edit-access-point-button"
          @click=${() => this.accessPointDialog.show()}
        >
          <oscd-icon>edit</oscd-icon>
        </oscd-icon-button>
        ${this.renderServicesIcon()}
        ${Array.from(this.element.querySelectorAll(':scope > Server')).map(
          server =>
            html`<server-container
              .docVersion=${this.docVersion}
              .doc=${this.doc}
              .element=${server}
              .nsdoc=${this.nsdoc}
              .selectedLNClasses=${this.selectedLNClasses}
              .ancestors=${[...this.ancestors, this.element]}
            ></server-container>`,
        )}
        ${Array.from(this.element.querySelectorAll(':scope > ServerAt')).map(
          server =>
            html`<server-container
              .docVersion=${this.docVersion}
              .doc=${this.doc}
              .element=${server}
              .nsdoc=${this.nsdoc}
              .selectedLNClasses=${this.selectedLNClasses}
              .ancestors=${[...this.ancestors, this.element]}
            ></server-container>`,
        )}
        <div id="lnContainer">
          ${lnElements.map(
            ln =>
              html`<ln-container
                .docVersion=${this.docVersion}
                .doc=${this.doc}
                .element=${ln}
                .nsdoc=${this.nsdoc}
                .ancestors=${[...this.ancestors, this.element]}
              ></ln-container>`,
          )}
        </div>
      </oscd-action-pane>
      <access-point-edit-dialog
        .doc=${this.doc}
        .element=${this.element}
        .onConfirm=${(data: AccessPointEditData) =>
          this.updateAccessPoint(data)}
      ></access-point-edit-dialog>`;
  }

  static styles = css`
    #lnContainer {
      display: grid;
      grid-gap: 12px;
      box-sizing: border-box;
      grid-template-columns: repeat(auto-fit, minmax(316px, auto));
    }

    @media (max-width: 387px) {
      #lnContainer {
        grid-template-columns: repeat(auto-fit, minmax(196px, auto));
      }
    }
  `;
}
