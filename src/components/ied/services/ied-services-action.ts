import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement, TemplateResult, html, css } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { renderLogSettingsServices } from './service-log-settings.js';
import { OscdFormGroup } from '../../form/oscd-form-group.js';
import { OscdFormDivider } from '../../form/oscd-form-divider.js';
import { OscdForm } from '../../form/oscd-form.js';
import {
  extractServicesData,
  IEDServices,
} from '../../../foundation/services.js';
import { OscdFormField } from '../../form/oscd-form-field.js';
import { renderReportConfigurationsServices } from './service-report-configurations.js';
import { msg } from '@lit/localize';
import { renderGseControlServices } from './service-GSE-Control.js';
import { renderNetworkingServices } from './service-networking.js';
import { renderSampledValuesServices } from './service-sampled-values.js';
import { renderClientServerServices } from './service-client-server.js';

export type ServicePage = {
  title: string;
  renderer: () => TemplateResult;
};

export class IedServicesAction extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-icon': OscdIcon,
    'oscd-icon-button': OscdIconButton,
    'oscd-dialog': OscdDialog,
    'oscd-filled-button': OscdFilledButton,
    'oscd-outlined-button': OscdOutlinedButton,
    'oscd-form': OscdForm,
    'oscd-form-field': OscdFormField,
    'oscd-form-divider': OscdFormDivider,
    'oscd-form-group': OscdFormGroup,
  };

  @property({ type: Element })
  set ied(value: Element) {
    this._ied = value;
    this.services = extractServicesData(this._ied);
  }
  get ied(): Element {
    return this._ied;
  }
  private _ied!: Element;

  @state()
  private services: IEDServices | null = null;

  @state()
  activeIndex = 0;

  @property({ type: String }) headline = msg('Services');

  @query('oscd-dialog') private dialog!: OscdDialog;

  private pages: ServicePage[] = [
    {
      title: msg('Log Settings'),
      renderer: renderLogSettingsServices,
    },
    {
      title: msg('Report Configurations'),
      renderer: renderReportConfigurationsServices,
    },
    {
      title: msg('GSE Control'),
      renderer: renderGseControlServices,
    },
    {
      title: msg('Networking'),
      renderer: renderNetworkingServices,
    },
    {
      title: msg('Sampled Values'),
      renderer: renderSampledValuesServices,
    },
    {
      title: msg('Edit Client Server Services'),
      renderer: renderClientServerServices,
    },
  ];

  show(): void {
    this.activeIndex = 0;
    if (!this.pages || this.pages.length === 0) {
      return;
    }
    this.dialog.show();
  }

  private close(): void {
    this.dialog.close();
  }

  private goNext(): void {
    if (this.activeIndex < this.pages.length - 1) {
      this.activeIndex++;
    }
  }

  private goBack(): void {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  private selectIndex(e: Event, index: number): void {
    e.preventDefault();
    this.activeIndex = index;
  }

  render() {
    const active = this.pages[this.activeIndex];
    return html`
      <oscd-icon-button ?disabled=${!this.services} @click=${() => this.show()}
        ><oscd-icon>settings</oscd-icon></oscd-icon-button
      >
      <oscd-dialog @closed=${this.close}>
        <div slot="headline">${this.headline}</div>
        <div slot="content" class="dialog-content">
          <aside class="nav">
            <ul>
              ${this.pages.map(
                (p, i) => html`
                  <li class=${i === this.activeIndex ? 'active' : ''}>
                    <button @click=${(e: Event) => this.selectIndex(e, i)}>
                      ${p.title}
                    </button>
                  </li>
                `,
              )}
            </ul>
          </aside>
          <section class="page">
            <oscd-form .data=${this.services}>
              ${active
                ? active.renderer()
                : html`<div>No pages available</div>`}
            </oscd-form>
          </section>
        </div>
        <div slot="actions">
          <oscd-outlined-button slot="secondaryAction" @click=${this.close}
            >Cancel</oscd-outlined-button
          >
          <oscd-outlined-button
            slot="secondaryAction"
            @click=${this.goBack}
            ?disabled=${this.activeIndex === 0}
            >Back</oscd-outlined-button
          >
          <oscd-filled-button
            slot="primaryAction"
            @click=${this.goNext}
            ?disabled=${this.activeIndex === this.pages.length - 1}
            >Next</oscd-filled-button
          >
        </div>
      </oscd-dialog>
    `;
  }

  static styles = css`
    oscd-dialog {
      max-width: min(800px, 100% - 48px);
    }

    oscd-dialog [slot='content'] {
      display: flex;
      gap: 12px;
      box-sizing: border-box;
      width: 640px;
      max-width: 100vw;
    }

    oscd-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .nav {
      width: 180px;
      border-right: 1px solid var(--oscd-base1);
      padding-right: 8px;
    }
    .nav ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .nav li button {
      width: 100%;
      text-align: left;
      background: transparent;
      border: none;
      padding: 8px;
      cursor: pointer;
    }
    .nav li.active button {
      font-weight: 600;
    }
    .page {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-left: 8px;
    }
  `;
}
