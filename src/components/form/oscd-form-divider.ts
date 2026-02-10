import { LitElement, html, css, TemplateResult } from 'lit';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { OscdDivider } from '@omicronenergy/oscd-ui/divider/OscdDivider.js';
import { property } from 'lit/decorators.js';

export class OscdFormDivider extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-divider': OscdDivider,
  };

  @property()
  label?: string;

  render(): TemplateResult {
    return html`
      ${this.label ? html`<h4 class="header">${this.label}</h4>` : null}
      <oscd-divider></oscd-divider>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    .header {
      margin: 0 0 4px 0;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .separator {
      height: 0;
      margin: 10px 0;
      border-bottom: 1px solid var(--oscd-divider-color, rgba(0, 0, 0, 0.12));
    }
  `;
}
