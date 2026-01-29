import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement, TemplateResult, html, css, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { msg } from '@lit/localize';

import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { OscdFilledSelect } from '@omicronenergy/oscd-ui/select/OscdFilledSelect.js';
import { OscdSelectOption } from '@omicronenergy/oscd-ui/select/OscdSelectOption.js';

const stringTypeLengths: Record<string, number> = {
  VisString32: 32,
  VisString64: 64,
  VisString65: 65,
  VisString129: 129,
  VisString255: 255,
  ObjRef: 129,
  Currency: 3,
  Octet64: 128,
  Octet6: 12,
  Octet16: 32,
  Unicode255: 255,
};

const integerTypes = new Set([
  'INT8',
  'INT16',
  'INT24',
  'INT32',
  'INT64',
  'INT128',
  'INT8U',
  'INT16U',
  'INT24U',
  'INT32U',
]);

const floatTypes = new Set(['FLOAT32', 'FLOAT64']);

function getDateValue(value: string): string | null {
  const parts = value.split('T');
  const dateValue = parts[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return null;
  }
  if (dateValue === '0000-00-00') {
    return null;
  }
  return dateValue;
}

function getTimeValue(value: string): string | null {
  const parts = value.split('T');
  if (parts.length !== 2) {
    return null;
  }
  let timeValue = parts[1];
  if (timeValue.length > 8) {
    timeValue = timeValue.substring(0, 8);
  }
  if (!/^\d{2}:\d{2}:\d{2}$/.test(timeValue)) {
    return null;
  }
  if (timeValue === '00:00:00') {
    return null;
  }
  return timeValue;
}

export class DaiValueDialog extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-dialog': OscdDialog,
    'oscd-outlined-button': OscdOutlinedButton,
    'oscd-filled-button': OscdFilledButton,
    'oscd-filled-text-field': OscdFilledTextField,
    'oscd-filled-select': OscdFilledSelect,
    'oscd-select-option': OscdSelectOption,
  };

  @property({ type: String }) dialogTitle = '';
  @property({ type: String }) bType = '';
  @property({ type: Array }) enumValues: string[] = [];
  @property({ type: Array }) values: string[] = [];
  @property({ type: String }) templateValue: string | null = null;
  @property({ type: Number }) multipleSettings: number | null = null;
  // eslint-disable-next-line class-methods-use-this
  @property({ attribute: false })
  onConfirm: (values: string[]) => void = () => undefined;

  @state() private formValues: string[] = [];
  @state() private dateValues: string[] = [];
  @state() private timeValues: string[] = [];

  @query('oscd-dialog') private dialog!: OscdDialog;

  public show(): void {
    this.formValues = [...this.values];
    this.dateValues = this.values.map(value => getDateValue(value) ?? '');
    this.timeValues = this.values.map(value => getTimeValue(value) ?? '');
    this.dialog.show();
  }

  private close(): void {
    this.dialog.close();
    this.formValues = [];
    this.dateValues = [];
    this.timeValues = [];
  }

  private confirm(): void {
    const values =
      this.bType === 'Timestamp'
        ? this.dateValues.map((date, index) => {
            const time = this.timeValues[index] || '00:00:00';
            const normalizedDate = date || '0000-00-00';
            return `${normalizedDate}T${time}.000`;
          })
        : this.formValues.map(value => value ?? '');
    this.onConfirm(values);
    this.close();
  }

  private setValue(index: number, value: string): void {
    const updated = [...this.formValues];
    updated[index] = value;
    this.formValues = updated;
  }

  private setDateValue(index: number, value: string): void {
    const updated = [...this.dateValues];
    updated[index] = value;
    this.dateValues = updated;
  }

  private setTimeValue(index: number, value: string): void {
    const updated = [...this.timeValues];
    updated[index] = value;
    this.timeValues = updated;
  }

  private renderValueField(index: number): TemplateResult {
    const { bType, enumValues } = this;
    const label = this.multipleSettings
      ? `Val for sGroup ${index + 1}`
      : msg('Val');

    if (bType === 'BOOLEAN') {
      return html`
        <oscd-filled-select
          label=${label}
          .value=${this.formValues[index] ?? ''}
          @change=${(e: Event) =>
            this.setValue(index, (e.target as HTMLSelectElement).value)}
        >
          <oscd-select-option value="true">true</oscd-select-option>
          <oscd-select-option value="false">false</oscd-select-option>
        </oscd-filled-select>
      `;
    }

    if (bType === 'Enum') {
      return html`
        <oscd-filled-select
          label=${label}
          .value=${this.formValues[index] ?? ''}
          @change=${(e: Event) =>
            this.setValue(index, (e.target as HTMLSelectElement).value)}
        >
          ${enumValues.map(
            enumValue =>
              html`<oscd-select-option value=${enumValue}
                >${enumValue}</oscd-select-option
              >`,
          )}
        </oscd-filled-select>
      `;
    }

    if (bType === 'Timestamp') {
      return html`
        <oscd-filled-text-field
          label=${this.multipleSettings
            ? `Val (Date) for sGroup ${index + 1}`
            : msg('Val (Date)')}
          type="date"
          .value=${this.dateValues[index] ?? ''}
          @input=${(e: Event) =>
            this.setDateValue(index, (e.target as HTMLInputElement).value)}
        ></oscd-filled-text-field>
        <oscd-filled-text-field
          label=${this.multipleSettings
            ? `Val (Time) for sGroup ${index + 1}`
            : msg('Val (Time)')}
          type="time"
          step="1"
          .value=${this.timeValues[index] ?? ''}
          @input=${(e: Event) =>
            this.setTimeValue(index, (e.target as HTMLInputElement).value)}
        ></oscd-filled-text-field>
      `;
    }

    const isNumeric = integerTypes.has(bType) || floatTypes.has(bType);
    const maxLength = stringTypeLengths[bType];
    const type = isNumeric ? 'number' : 'text';
    const step = floatTypes.has(bType) ? '0.1' : '1';

    return html`
      <oscd-filled-text-field
        label=${label}
        type=${type}
        step=${isNumeric ? step : nothing}
        .value=${this.formValues[index] ?? ''}
        maxlength=${maxLength ?? nothing}
        @input=${(e: Event) =>
          this.setValue(index, (e.target as HTMLInputElement).value)}
      ></oscd-filled-text-field>
    `;
  }

  private renderFields(): TemplateResult[] {
    const count = this.multipleSettings ?? 1;
    return Array.from(
      { length: count },
      (_, index) =>
        html`<div class="field-group">${this.renderValueField(index)}</div>`,
    );
  }

  render(): TemplateResult {
    return html`
      <oscd-dialog @closed=${this.close}>
        <div slot="headline">${this.dialogTitle}</div>
        <div slot="content" class="dialog-content">
          ${this.renderFields()}
          ${this.templateValue
            ? html`<oscd-filled-text-field
                label=${msg('DA template value')}
                .value=${this.templateValue}
                disabled
              ></oscd-filled-text-field>`
            : nothing}
        </div>
        <div slot="actions">
          <oscd-outlined-button slot="secondaryAction" @click=${this.close}>
            ${msg('Cancel')}
          </oscd-outlined-button>
          <oscd-filled-button slot="primaryAction" @click=${this.confirm}>
            ${msg('Save')}
          </oscd-filled-button>
        </div>
      </oscd-dialog>
    `;
  }

  static styles = css`
    [slot='content'] {
      width: 320px;
      max-width: 100vw;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `;
}
