import { LitElement, html, TemplateResult, css } from 'lit';
import { property } from 'lit/decorators.js';

import { FormValue, OscdForm } from './oscd-form.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { OscdSclSelect } from '@omicronenergy/oscd-ui/scl-select/OscdSclSelect.js';
import { OscdSclCheckbox } from '@omicronenergy/oscd-ui/scl-checkbox/OscdSclCheckbox.js';
import { OscdSclTextField } from '@omicronenergy/oscd-ui/scl-textfield/OscdSclTextField.js';

export class OscdFormField extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-scl-select': OscdSclSelect,
    'oscd-scl-text-field': OscdSclTextField,
    'oscd-scl-checkbox': OscdSclCheckbox,
  };

  @property()
  name!: string;

  @property()
  label = '';

  @property() helper = '';

  @property({ type: Boolean })
  readonly = false;

  @property({ type: Boolean })
  required = false;

  @property()
  type: 'text' | 'checkbox' | 'select' = 'text';

  @property({ attribute: false })
  enumValues?: string[];

  private get form(): OscdForm<FormValue> | null {
    return this.closest('oscd-form') as OscdForm<FormValue> | null;
  }

  private get value(): FormValue | null {
    return this.form?.getValue(this.name) ?? null;
  }

  private get error(): string | null {
    return this.form?.getError(this.name) ?? null;
  }

  private handleTextChange(event: Event): void {
    if (this.readonly) {
      return;
    }
    const target = event.target as HTMLInputElement;
    this.form?.setValue(this.name, target.value);
  }

  private handleCheckboxChange(event: CustomEvent): void {
    if (this.readonly) {
      return;
    }
    this.form?.setValue(this.name, event.detail?.value ?? null);
  }

  private handleSelectChange(event: CustomEvent): void {
    if (this.readonly) {
      return;
    }
    this.form?.setValue(this.name, event.detail?.value ?? null);
  }

  render(): TemplateResult {
    switch (this.type) {
      case 'checkbox': {
        return html`
          <abbr title=${this.helper}>
            <oscd-scl-checkbox
              .label=${this.label}
              nullable
              .value=${this.value}
              ?required=${this.required}
              ?disabled=${this.readonly}
              @change=${this.handleCheckboxChange}
            ></oscd-scl-checkbox>
          </abbr>
        `;
      }

      case 'select': {
        return html`
          <abbr title=${this.helper}>
            <oscd-scl-select
              .label=${this.label}
              nullable
              .value=${this.value}
              ?required=${this.required}
              ?disabled=${this.readonly}
              @change=${this.handleSelectChange}
              .selectOptions=${this.enumValues ?? []}
            >
            </oscd-scl-select>
          </abbr>
        `;
      }

      default: {
        return html`
          <abbr title=${this.helper}>
            <oscd-scl-text-field
              .label=${this.label}
              nullable
              .value=${this.value}
              ?required=${this.required}
              ?disabled=${this.readonly}
              .validationMessage=${this.error ?? ''}
              @input=${this.handleTextChange}
            ></oscd-scl-text-field>
          </abbr>
        `;
      }
    }
  }

  static styles = css`
    * {
      --md-filled-text-field-disabled-input-text-opacity: 0.8;
      --md-filled-text-field-disabled-label-text-opacity: 0.8;
      --md-filled-text-field-disabled-container-color: transparent;

      --md-filled-select-text-field-disabled-input-text-opacity: 0.8;
      --md-filled-select-text-field-disabled-label-text-opacity: 0.8;
      --md-filled-select-text-field-disabled-container-color: transparent;

      --md-filled-select-text-field-disabled-supporting-text-opacity: 0.8;

      --md-filled-text-field-disabled-active-indicator-color: transparent;
      --md-filled-text-field-active-indicator-height: 0px;
    }
  `;
}
