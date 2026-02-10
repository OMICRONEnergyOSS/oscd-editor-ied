import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export type FormValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: FormValue };

export interface OscdFormContext<FormValue> {
  getValue(path: string): FormValue | null;
  setValue(path: string, value: FormValue): void;
  getError(path: string): string | null;
}

export class OscdForm<T extends FormValue> extends LitElement {
  @property({ attribute: false })
  data!: T;

  getValue(path: string): FormValue | null {
    return path.split('.').reduce<FormValue | null>((acc, key) => {
      if (acc && typeof acc === 'object' && key in acc) {
        return (acc as Record<string, FormValue>)[key];
      }
      return null;
    }, this.data);
  }

  // eslint-disable-next-line class-methods-use-this
  setValue(_path: string, _value: FormValue): void {
    // No-op for now (readonly)
  }

  // eslint-disable-next-line class-methods-use-this
  getError(_path: string): string | null {
    // No validation yet
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  render() {
    return html`<slot></slot>`;
  }

  static styles = css``;
}
