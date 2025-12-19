import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdFilledSelect } from '@omicronenergy/oscd-ui/select/OscdFilledSelect.js';
import { OscdSwitch } from '@omicronenergy/oscd-ui/switch/OscdSwitch.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement, TemplateResult, html, css } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import {
  getExistingAccessPointNames,
  getAccessPointsWithServer,
} from '../foundation.js';
import { msg } from '@lit/localize';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';
import { OscdSelectOption } from '@omicronenergy/oscd-ui/select/OscdSelectOption.js';

export interface AccessPointCreationData {
  name: string;
  createServerAt: boolean;
  serverAtApName?: string;
  serverAtDesc?: string;
}

/** A dialog component for adding new AccessPoints */
export class AddAccessPointDialog extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-dialog': OscdDialog,
    'oscd-filled-textfield': OscdFilledTextField,
    'oscd-filled-button': OscdFilledButton,
    'oscd-outlined-button': OscdOutlinedButton,
    'oscd-switch': OscdSwitch,
    'oscd-filled-select': OscdFilledSelect,
    'oscd-select-option': OscdSelectOption,
  };

  @property()
  doc!: XMLDocument;

  @property()
  ied!: Element;

  @property({ type: Function })
  onConfirm!: (data: AccessPointCreationData) => void;

  @query('oscd-dialog') dialog!: OscdDialog;

  @query('#apName') apNameField!: OscdFilledTextField;

  @state()
  private apName = '';

  @state()
  private createServerAt = false;

  @state()
  private serverAtApName = '';

  @state()
  private serverAtDesc = '';

  get open() {
    return this.dialog?.open ?? false;
  }

  private isApNameUnique(name: string): boolean {
    const existingNames = getExistingAccessPointNames(this.ied);
    return !existingNames.includes(name);
  }

  private get accessPointsWithServer(): string[] {
    return getAccessPointsWithServer(this.ied);
  }

  public show(): void {
    this.reset();
    this.dialog.show();
  }

  private reset(): void {
    this.apName = '';
    this.createServerAt = false;
    this.serverAtApName = '';
    this.serverAtDesc = '';
  }

  private close(): void {
    this.dialog.close();
    this.reset();
  }

  private handleCreate(): void {
    if (this.apNameField.checkValidity()) {
      const data: AccessPointCreationData = {
        name: this.apName,
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

  private getApNameError(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }
    if (!/^[A-Za-z0-9][0-9A-Za-z_]*$/.test(trimmed)) {
      return msg('AccessPoint name cannot contain spaces');
    }
    if (trimmed.length > 32) {
      return msg('AccessPoint name is too long');
    }
    if (!this.isApNameUnique(trimmed)) {
      return msg('AccessPoint name already exists');
    }
    return '';
  }

  private renderServerAtSection(): TemplateResult {
    return html`
      <label>
        <oscd-switch
          ?selected=${this.createServerAt}
          @change=${(e: Event) => {
            this.createServerAt = (e.target as OscdSwitch).selected;
            this.serverAtApName = this.createServerAt
              ? this.accessPointsWithServer[0]
              : '';
          }}
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
              ${this.accessPointsWithServer.map(
                (ap: string) =>
                  html`<oscd-select-option value=${ap}
                    >${ap}</oscd-select-option
                  >`,
              )}
            </oscd-filled-select>
            <oscd-filled-textfield
              label=${msg('ServerAt description')}
              .value=${this.serverAtDesc}
              @input=${(e: Event) => {
                this.serverAtDesc = (e.target as HTMLInputElement).value;
              }}
              style="width: 100%; margin-bottom: 16px;"
            ></oscd-filled-textfield>
          `
        : ''}
    `;
  }

  render(): TemplateResult {
    const apNameError = this.getApNameError(this.apName);
    return html`
      <oscd-dialog @closed=${this.close}>
        <div slot="headline">${msg('Add AccessPoint')}</div>
        <div slot="content">
          <oscd-filled-textfield
            id="apName"
            label=${msg('AccessPoint name')}
            .value=${this.apName}
            ?error=${!!apNameError}
            .errorText=${apNameError}
            .validityTransform=${(value: string) => {
              const error = this.getApNameError(value);
              return {
                valid: error === '',
                customError: error !== '',
              };
            }}
            pattern="[A-Za-z0-9][0-9A-Za-z_]*"
            maxLength="32"
            required
            autoValidate
            helper=${msg('AccessPoint name')}
            dialogInitialFocus
            style="width: 100%; margin-bottom: 16px;"
            @input=${(e: Event) => {
              this.apName = (e.target as HTMLInputElement).value;
            }}
          ></oscd-filled-textfield>
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
      margin-top: 16px;
      width: 320px;
      height: 280px;
      max-width: 100vw;
      box-sizing: border-box;
    }

    oscd-filled-select,
    oscd-filled-textfield {
      /* width: 100%;
      min-width: 0;
      max-width: 100%;
      box-sizing: border-box; */
    }

    label {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `;
}
