import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement, TemplateResult, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';

import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';

export type DaiTimestampFieldChange = {
  value: string;
  dateValue: string;
  timeValue: string;
  sGroup?: number | null;
};

function getDateValue(value: string): string {
  const parts = value.split('T');
  const dateValue = parts[0] ?? '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return '';
  }
  if (dateValue === '0000-00-00') {
    return '';
  }
  return dateValue;
}

function getTimeValue(value: string): string {
  const parts = value.split('T');
  if (parts.length !== 2) {
    return '';
  }
  let timeValue = parts[1] ?? '';
  if (timeValue.length > 8) {
    timeValue = timeValue.substring(0, 8);
  }
  if (!/^\d{2}:\d{2}:\d{2}$/.test(timeValue)) {
    return '';
  }
  if (timeValue === '00:00:00') {
    return '';
  }
  return timeValue;
}

function buildTimestamp(dateValue: string, timeValue: string): string {
  const normalizedDate = dateValue || '0000-00-00';
  const normalizedTime = timeValue || '00:00:00';
  return `${normalizedDate}T${normalizedTime}.000`;
}

export class DaiTimestampField extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-filled-text-field': OscdFilledTextField,
  };

  @property({ type: String })
  value = '';

  @property({ type: String })
  labelDate = '';

  @property({ type: String })
  labelTime = '';

  @property({ type: Number })
  sGroup: number | null = null;

  @property({ type: Boolean })
  disabled = false;

  @state()
  private dateValue = '';

  @state()
  private timeValue = '';

  protected willUpdate(changed: Map<string, unknown>): void {
    if (changed.has('value')) {
      this.dateValue = getDateValue(this.value);
      this.timeValue = getTimeValue(this.value);
    }
  }

  private handleChange(): void {
    const value = buildTimestamp(this.dateValue, this.timeValue);
    this.dispatchEvent(
      new CustomEvent<DaiTimestampFieldChange>('change', {
        detail: {
          value,
          dateValue: this.dateValue,
          timeValue: this.timeValue,
          sGroup: this.sGroup,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onDateInput(event: Event): void {
    this.dateValue = (event.target as HTMLInputElement).value;
    this.handleChange();
  }

  private onTimeInput(event: Event): void {
    this.timeValue = (event.target as HTMLInputElement).value;
    this.handleChange();
  }

  render(): TemplateResult {
    return html`
      <oscd-filled-text-field
        label=${this.labelDate}
        type="date"
        .value=${this.dateValue}
        ?disabled=${this.disabled}
        @input=${this.onDateInput}
      ></oscd-filled-text-field>
      <oscd-filled-text-field
        label=${this.labelTime}
        type="time"
        step="1"
        .value=${this.timeValue}
        ?disabled=${this.disabled}
        @input=${this.onTimeInput}
      ></oscd-filled-text-field>
    `;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `;
}
