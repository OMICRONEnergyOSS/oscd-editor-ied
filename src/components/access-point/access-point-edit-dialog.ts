import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement, TemplateResult, html, css } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { msg } from '@lit/localize';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';
import { getExistingAccessPointNames } from '../../foundation.js';
import { OscdSclTextField } from '@omicronenergy/oscd-ui/scl-textfield/OscdSclTextField.js';

/**
 * Validates an AccessPoint name against business rules
 * @param value - The name to validate
 * @param ied - The IED element to check for uniqueness
 * @returns Error message or empty string if valid
 */
export function validateApName(
  value: string,
  ied: Element,
  currentName?: string,
): string {
  const trimmed = value.trim();
  if (!trimmed || (currentName && trimmed === currentName)) {
    return '';
  }
  if (!/^[A-Za-z0-9][0-9A-Za-z_]*$/.test(trimmed)) {
    return msg('AccessPoint name cannot contain spaces');
  }
  if (trimmed.length > 32) {
    return msg('AccessPoint name is too long');
  }

  const existingNames = getExistingAccessPointNames(ied);
  if (existingNames.includes(trimmed)) {
    return msg('AccessPoint name already exists');
  }

  return '';
}

/**
 * Renders a validated AccessPoint name field
 */
export function renderApNameField({
  value,
  ied,
  onInput,
  currentName,
}: {
  value: string;
  ied: Element;
  onInput: (value: string) => void;
  currentName?: string;
}): TemplateResult {
  const apNameError = validateApName(value, ied, currentName);

  return html`
    <oscd-filled-text-field
      id="apName"
      label=${msg('AccessPoint name')}
      .value=${value}
      ?error=${!!apNameError}
      .errorText=${apNameError}
      .validityTransform=${(val: string) => {
        const error = validateApName(val, ied, currentName);
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
      style="width: 100%; margin-bottom: 16px;"
      @input=${(e: Event) => {
        onInput((e.target as HTMLInputElement).value);
      }}
    ></oscd-filled-text-field>
  `;
}

/**
 * Renders a description field
 */
export function renderDescField({
  value,
  onInput,
  label = msg('Desc'),
}: {
  value: string | null;
  onInput: (value: string) => void;
  label?: string;
}): TemplateResult {
  return html`
    <oscd-scl-text-field
      label=${label}
      .value=${value}
      nullable
      style="width: 100%; margin-bottom: 16px;"
      @input=${(e: Event) => {
        onInput((e.target as HTMLInputElement).value);
      }}
    ></oscd-scl-text-field>
  `;
}

export interface AccessPointEditData {
  name: string;
  desc: string | null;
}

/** A dialog component for adding new AccessPoints */
export class AccessPointEditDialog extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-dialog': OscdDialog,
    'oscd-filled-text-field': OscdFilledTextField,
    'oscd-filled-button': OscdFilledButton,
    'oscd-outlined-button': OscdOutlinedButton,
    'oscd-scl-text-field': OscdSclTextField,
  };

  @property()
  doc!: XMLDocument;

  @property()
  element!: Element;

  @property({ type: Function })
  onConfirm!: (data: AccessPointEditData) => void;

  @state()
  private apName = '';

  @state()
  private desc: string | null = null;

  @query('oscd-dialog') dialog!: OscdDialog;

  @query('#apName') apNameField!: OscdFilledTextField;

  public show(): void {
    this.apName = this.element.getAttribute('name') ?? '';
    this.desc = this.element.getAttribute('desc') ?? null;
    this.dialog.show();
  }

  private close(): void {
    this.dialog.close();
    this.reset();
  }

  private handleUpdate(): void {
    if (this.apNameField.checkValidity()) {
      const data: AccessPointEditData = {
        name: this.apName,
        desc: this.desc,
      };
      this.onConfirm(data);
      this.close();
    }
  }

  private reset(): void {
    this.apName = '';
    this.desc = null;
  }

  render(): TemplateResult {
    return html`
      <oscd-dialog @closed=${this.close}>
        <div slot="headline">${msg('Edit AccessPoint')}</div>
        <div slot="content">
          ${renderApNameField({
            value: this.apName,
            ied: this.element.closest('IED')!,
            onInput: value => {
              this.apName = value;
            },
            currentName: this.element.getAttribute('name') ?? '',
          })}
          ${renderDescField({
            value: this.desc,
            onInput: value => {
              this.desc = value;
            },
          })}
        </div>
        <div slot="actions">
          <oscd-outlined-button slot="secondaryAction" @click=${this.close}>
            ${msg('Cancel')}
          </oscd-outlined-button>
          <oscd-filled-button
            slot="primaryAction"
            @click=${this.handleUpdate}
            data-testid="save-access-point-button"
            ?disabled=${!this.apName || !this.apNameField.validity.valid}
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
      height: 200px;
      max-width: 100vw;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `;
}
