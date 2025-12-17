import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement, TemplateResult, html, css } from 'lit';
import { state } from 'lit/decorators.js';

export class ElementPath extends ScopedElementsMixin(LitElement) {
  @state()
  paths: string[] = [];

  render(): TemplateResult {
    console.log(JSON.stringify(this.paths));
    return html` <h3>${this.paths.join(' / ')}</h3> `;
  }

  static styles = css`
    :host {
      display: block;
      min-width: 0;
    }

    h3 {
      color: var(--mdc-theme-on-surface);
      font-family: 'Roboto', sans-serif;
      font-weight: 300;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin: 0px;
      line-height: 48px;
      transition: background-color 150ms linear;
      width: 100%; /* Ensure it respects parent width */
    }
  `;
}
