import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement, TemplateResult, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';

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

export type DaiValueFieldChange = {
  value: string;
  sGroup?: number | null;
};

export class DaiValueField extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-filled-text-field': OscdFilledTextField,
    'oscd-filled-select': OscdFilledSelect,
    'oscd-select-option': OscdSelectOption,
  };

  @property({ type: String })
  bType = '';

  @property({ type: String })
  value = '';

  @property({ type: String })
  label = '';

  @property({ type: Array })
  enumValues: string[] = [];

  @property({ type: Number })
  sGroup: number | null = null;

  @property({ type: Boolean })
  disabled = false;

  private emitChange(value: string): void {
    this.dispatchEvent(
      new CustomEvent<DaiValueFieldChange>('change', {
        detail: { value, sGroup: this.sGroup },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private renderBoolean(): TemplateResult {
    return html`
      <oscd-filled-select
        label=${this.label}
        .value=${this.value ?? ''}
        ?disabled=${this.disabled}
        @change=${(e: Event) =>
          this.emitChange((e.target as HTMLSelectElement).value)}
      >
        <oscd-select-option value="true">true</oscd-select-option>
        <oscd-select-option value="false">false</oscd-select-option>
      </oscd-filled-select>
    `;
  }

  private renderEnum(): TemplateResult {
    return html`
      <oscd-filled-select
        label=${this.label}
        .value=${this.value ?? ''}
        ?disabled=${this.disabled}
        @change=${(e: Event) =>
          this.emitChange((e.target as HTMLSelectElement).value)}
      >
        ${this.enumValues.map(
          enumValue =>
            html`<oscd-select-option value=${enumValue}
              >${enumValue}</oscd-select-option
            >`,
        )}
      </oscd-filled-select>
    `;
  }

  private renderText(): TemplateResult {
    const isNumeric =
      integerTypes.has(this.bType) || floatTypes.has(this.bType);
    const maxLength = stringTypeLengths[this.bType];
    const type = isNumeric ? 'number' : 'text';
    const step = floatTypes.has(this.bType) ? '0.1' : '1';

    return html`
      <oscd-filled-text-field
        label=${this.label}
        type=${type}
        step=${isNumeric ? step : nothing}
        .value=${this.value ?? ''}
        maxlength=${maxLength ?? nothing}
        ?disabled=${this.disabled}
        @input=${(e: Event) =>
          this.emitChange((e.target as HTMLInputElement).value)}
      ></oscd-filled-text-field>
    `;
  }

  render(): TemplateResult {
    if (this.bType === 'BOOLEAN') {
      return this.renderBoolean();
    }
    if (this.bType === 'Enum') {
      return this.renderEnum();
    }
    return this.renderText();
  }

  static styles = css`
    :host {
      display: block;
    }
  `;
}
