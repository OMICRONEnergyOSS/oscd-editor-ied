import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement, TemplateResult, html, css, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';

export type InfoField = {
  label: string;
  value: string;
  multiline?: boolean;
  rows?: number;
};

export type InfoGroup = InfoField[];

function renderField(field: InfoField): TemplateResult {
  const rows = field.rows ?? 3;
  return html`
    <oscd-filled-text-field
      label=${field.label}
      .value=${field.value}
      ?disabled=${true}
      type=${field.multiline ? 'textarea' : 'text'}
      rows=${field.multiline ? rows : nothing}
    ></oscd-filled-text-field>
  `;
}

/** Read-only info dialog composed of grouped label/value fields. */
export class InfoDialog extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-dialog': OscdDialog,
    'oscd-filled-button': OscdFilledButton,
    'oscd-filled-text-field': OscdFilledTextField,
  };

  @property({ attribute: false }) infoGroups: InfoGroup[] = [];

  @property({ type: String }) headline = 'Show Info';

  @query('oscd-dialog') private dialog!: OscdDialog;

  public show(): void {
    this.dialog.show();
  }

  private close(): void {
    this.dialog.close();
  }

  render(): TemplateResult {
    return html`
      <oscd-dialog @closed=${this.close}>
        <div slot="headline">${this.headline}</div>
        <div slot="content" class="dialog-content">
          ${this.infoGroups.map(
            (group, index) => html`
              ${group.map(field => renderField(field))}
              ${index < this.infoGroups.length - 1
                ? html`<div class="divider"></div>`
                : nothing}
            `,
          )}
        </div>
        <div slot="actions">
          <oscd-filled-button slot="primaryAction" @click=${this.close}
            >Close</oscd-filled-button
          >
        </div>
      </oscd-dialog>
    `;
  }

  static styles = css`
    :host {
      --md-filled-text-field-disabled-input-text-opacity: 0.8;
      --md-filled-text-field-disabled-label-text-opacity: 0.8;
      --md-filled-text-field-disabled-container-color: transparent;

      --md-filled-text-field-disabled-active-indicator-color: transparent;
      --md-filled-text-field-active-indicator-height: 0px;
    }

    [slot='content'] {
      width: 360px;
      max-width: 100vw;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .divider {
      height: 1px;
      background: var(--oscd-base1);
      margin: 4px 0;
    }
  `;
}
