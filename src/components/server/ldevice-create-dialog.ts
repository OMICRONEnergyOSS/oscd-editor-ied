import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdFilledSelect } from '@omicronenergy/oscd-ui/select/OscdFilledSelect.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement, TemplateResult, html, css } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { getLDeviceInsts } from '../../foundation.js';
import { msg } from '@lit/localize';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';

export interface LDeviceCreateData {
  inst: string;
}

/** A dialog component for adding new LDevices */
export class LDeviceCreateDialog extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-dialog': OscdDialog,
    'oscd-filled-text-field': OscdFilledTextField,
    'oscd-filled-button': OscdFilledButton,
    'oscd-outlined-button': OscdOutlinedButton,
    'oscd-filled-select': OscdFilledSelect,
  };

  @property()
  doc!: XMLDocument;

  @property()
  server!: Element;

  @property({ type: Function })
  onConfirm!: (data: LDeviceCreateData) => void;

  @state()
  private inst = '';

  @query('oscd-dialog') dialog!: OscdDialog;

  @query('oscd-filled-text-field') instField!: OscdFilledTextField;

  private get lDeviceInst(): string[] {
    return getLDeviceInsts(this.server);
  }

  public show(): void {
    this.reset();
    this.dialog.show();
  }

  private reset(): void {
    this.inst = '';
  }

  private close(): void {
    this.dialog.close();
  }

  private getInstError(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
      return msg('LDevice inst is required');
    }
    if (!/^[A-Za-z0-9][0-9A-Za-z_]*$/.test(trimmed)) {
      return msg('Invalid inst');
    }
    if (trimmed.length > 64) {
      return msg('LDevice inst is too long');
    }
    if (this.lDeviceInst.includes(trimmed)) {
      return msg('LDevice inst already exists');
    }
    return '';
  }

  private handleCreate(): void {
    const data: LDeviceCreateData = {
      inst: this.inst,
    };
    this.onConfirm(data);
    this.close();
  }

  render(): TemplateResult {
    const error = this.getInstError(this.inst);
    return html`
      <oscd-dialog @closed=${this.close}>
        <div slot="headline">${msg('Add LDevice')}</div>
        <div slot="content">
          <oscd-filled-text-field
            label=${msg('LDevice inst')}
            .value=${this.inst}
            ?error=${this.inst !== '' && !!error}
            .errorText=${error}
            .validityTransform=${(value: string) => {
              const err = this.getInstError(value);
              return {
                valid: err === '',
                customError: err !== '',
              };
            }}
            pattern="[A-Za-z0-9][0-9A-Za-z_]*"
            maxLength="64"
            required
            autoValidate
            dialogInitialFocus
            @input=${(e: Event) => {
              this.inst = (e.target as HTMLInputElement).value;
            }}
          ></oscd-filled-text-field>
        </div>
        <div slot="actions">
          <oscd-outlined-button slot="secondaryAction" @click=${this.close}>
            ${msg('Cancel')}
          </oscd-outlined-button>
          <oscd-filled-button
            slot="primaryAction"
            @click=${this.handleCreate}
            data-testid="add-access-point-button"
            ?disabled=${!this.inst || !this.instField.validity.valid}
          >
            ${msg('Add')}
          </oscd-filled-button>
        </div>
      </oscd-dialog>
    `;
  }

  static styles = css`
    [slot='content'] {
      width: 320px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    label {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `;
}
