import { LitElement, html, css } from 'lit';

export class OscdFormGroup extends LitElement {
  // eslint-disable-next-line class-methods-use-this
  render() {
    return html`<slot></slot>`;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `;
}
