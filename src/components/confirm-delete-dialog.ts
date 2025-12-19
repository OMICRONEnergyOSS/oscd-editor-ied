import { LitElement, TemplateResult, html, css } from 'lit';
import { query, state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { msg } from '@lit/localize';

import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { ConfirmDeleteDetail } from '../foundation/events.js';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';

/** A dialog component for creating virtual IEDs */
export class ConfirmDeleteDialog extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-dialog': OscdDialog,
    'oscd-outlined-button': OscdOutlinedButton,
    'oscd-filled-button': OscdFilledButton,
  };

  @state()
  private heading?: string = '';

  @state()
  private message?: string = '';

  @state()
  private onConfirm?: () => void;

  public confirmDelete(details: ConfirmDeleteDetail) {
    this.heading = details.heading;
    this.message = details.message;
    this.onConfirm = details.onConfirm;
    this.dialog.show();
  }

  @query('oscd-dialog') dialog!: OscdDialog;

  private close(): void {
    this.dialog.close();
    this.title = '';
    this.message = '';
    this.onConfirm = undefined;
  }

  private handleConfirm(): void {
    if (this.onConfirm) {
      this.onConfirm();
    }
    this.close();
  }

  render(): TemplateResult {
    return html`
      <oscd-dialog @closed=${this.close}>
        <div slot="headline">${this.heading}</div>
        <div slot="content" class="dialog-content">
          <p>${this.message}</p>
        </div>
        <div slot="actions">
          <oscd-outlined-button slot="secondaryAction" @click=${this.close}>
            ${msg('Cancel')}
          </oscd-outlined-button>
          <oscd-filled-button slot="primaryAction" @click=${this.handleConfirm}>
            ${msg('Delete')}
          </oscd-filled-button>
        </div>
      </oscd-dialog>
    `;
  }

  static styles = css`
    oscd-filled-button {
      --md-sys-color-primary: var(--oscd-error);
      --oscd-filled-button-color: var(--oscd-base03);
    }
    .dialog-content {
      margin-top: 16px;
    }
  `;
}
