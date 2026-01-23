import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdFilledSelect } from '@omicronenergy/oscd-ui/select/OscdFilledSelect.js';
import { OscdSwitch } from '@omicronenergy/oscd-ui/switch/OscdSwitch.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement, TemplateResult, html, css } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { getAccessPointsWithServer } from '../../foundation.js';
import { msg } from '@lit/localize';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';
import { OscdSelectOption } from '@omicronenergy/oscd-ui/select/OscdSelectOption.js';
import {
  renderApNameField,
  renderDescField,
} from '../access-point/access-point-edit-dialog.js';
import { OscdSclTextField } from '@omicronenergy/oscd-ui/scl-textfield/OscdSclTextField.js';

export interface AccessPointCreateData {
  name: string;
  desc: string | null;
  createServerAt: boolean;
  serverAtApName?: string;
  serverAtDesc?: string;
}

/** A dialog component for adding new AccessPoints */
export class AccessPointCreateDialog extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-dialog': OscdDialog,
    'oscd-filled-text-field': OscdFilledTextField,
    'oscd-filled-button': OscdFilledButton,
    'oscd-outlined-button': OscdOutlinedButton,
    'oscd-switch': OscdSwitch,
    'oscd-filled-select': OscdFilledSelect,
    'oscd-select-option': OscdSelectOption,
    'oscd-scl-text-field': OscdSclTextField,
  };

  @property()
  doc!: XMLDocument;

  @property()
  ied!: Element;

  @property({ type: Function })
  onConfirm!: (data: AccessPointCreateData) => void;

  @state()
  private apName = '';

  @state()
  private desc: string | null = null;

  @state()
  private createServerAt = false;

  @state()
  private serverAtApName = '';

  @state()
  private serverAtDesc = '';

  @query('oscd-dialog') dialog!: OscdDialog;

  @query('#apName') apNameField!: OscdFilledTextField;

  public show(): void {
    this.reset();
    this.dialog.show();
  }

  private close(): void {
    this.dialog.close();
  }

  private handleCreate(): void {
    if (this.apNameField.checkValidity()) {
      const data: AccessPointCreateData = {
        name: this.apName,
        desc: this.desc,
        createServerAt: this.createServerAt,
        serverAtApName: this.createServerAt ? this.serverAtApName : undefined,
        serverAtDesc:
          this.createServerAt && this.serverAtDesc
            ? this.serverAtDesc
            : undefined,
      };
      this.onConfirm(data);
      this.close();
    }
  }

  private reset(): void {
    this.apName = '';
    this.desc = null;
    this.createServerAt = false;
    this.serverAtApName = '';
    this.serverAtDesc = '';
  }

  private renderServerAtSection(): TemplateResult {
    const accessPointsWithServer = getAccessPointsWithServer(this.ied);
    return html`
      <label>
        <oscd-switch
          ?selected=${this.createServerAt}
          @change=${(e: Event) => {
            this.createServerAt = (e.target as OscdSwitch).selected;
            this.serverAtApName = this.createServerAt
              ? accessPointsWithServer[0]
              : '';
          }}
          ?disabled=${accessPointsWithServer.length === 0}
        ></oscd-switch>
        ${msg('Add ServerAt')}
      </label>
      ${this.createServerAt
        ? html`
            <oscd-filled-select
              label=${msg('Select AccessPoint')}
              .value=${this.serverAtApName}
              @change=${(e: Event) => {
                e.stopPropagation();
                this.serverAtApName = (e.target as HTMLSelectElement).value;
              }}
              style="width: 100%; margin-bottom: 16px;"
            >
              <oscd-select-option aria-label="blank"></oscd-select-option>
              ${accessPointsWithServer.map(
                (ap: string) =>
                  html`<oscd-select-option value=${ap}
                    >${ap}</oscd-select-option
                  >`,
              )}
            </oscd-filled-select>
            <oscd-filled-text-field
              label=${msg('ServerAt description')}
              .value=${this.serverAtDesc}
              @input=${(e: Event) => {
                this.serverAtDesc = (e.target as HTMLInputElement).value;
              }}
              style="width: 100%; margin-bottom: 16px;"
            ></oscd-filled-text-field>
          `
        : ''}
    `;
  }

  render(): TemplateResult {
    return html`
      <oscd-dialog @closed=${this.close}>
        <div slot="headline">${msg('Add AccessPoint')}</div>
        <div slot="content">
          ${renderApNameField({
            value: this.apName,
            ied: this.ied,
            onInput: value => {
              this.apName = value;
            },
          })}
          ${renderDescField({
            value: this.desc,
            onInput: value => {
              this.desc = value;
            },
          })}
          ${this.renderServerAtSection()}
        </div>
        <div slot="actions">
          <oscd-outlined-button slot="secondaryAction" @click=${this.close}>
            ${msg('Cancel')}
          </oscd-outlined-button>
          <oscd-filled-button
            slot="primaryAction"
            @click=${this.handleCreate}
            data-testid="add-access-point-button"
            ?disabled=${!this.apName ||
            !this.apNameField.validity.valid ||
            (this.createServerAt && !this.serverAtApName)}
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
      height: 380px;
      max-width: 100vw;
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
