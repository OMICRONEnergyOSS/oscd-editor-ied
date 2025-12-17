/** [[`IED`]] plugin subeditor for editing `AccessPoint` element. */

// import { wizards } from '@omicronenergy/oscd-edit-dialog/wizards.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { PropertyValues, TemplateResult, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import { BaseContainer } from './base-container.js';
import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { ServerContainer } from './server-container.js';
import { OscdSclIcon } from '@omicronenergy/oscd-ui/scl-icon/OscdSclIcon.js';
import { LDeviceContainer } from './ldevice-container.js';
import { msg } from '@lit/localize';

export class AccessPointContainer extends ScopedElementsMixin(BaseContainer) {
  static scopedElements = {
    'oscd-icon': OscdIcon,
    'oscd-scl-icon': OscdSclIcon,
    'oscd-icon-button': OscdIconButton,
    'oscd-action-pane': OscdActionPane,
    'server-container': ServerContainer,
    'ln-container': LDeviceContainer,
  };

  @property()
  selectedLNClasses: string[] = [];

  @state()
  private get lnElements(): Element[] {
    return Array.from(this.element.querySelectorAll(':scope > LN')).filter(
      element => {
        const lnClass = element.getAttribute('lnClass') ?? '';
        return this.selectedLNClasses.includes(lnClass);
      },
    );
  }

  protected updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);

    // When the LN Classes filter is updated, we also want to trigger rendering for the LN Elements.
    if (_changedProperties.has('selectedLNClasses')) {
      this.requestUpdate('lnElements');
    }
  }

  private renderServicesIcon(): TemplateResult {
    const services: Element | null = this.element.querySelector('Services');

    if (!services) {
      return html``;
    }

    return html` <oscd-icon-button
      slot="action"
      title="${msg('Show Services the IED/AccessPoint provides')}"
      @click=${() => this.openSettingsWizard(services)}
    >
      <oscd-icon>settings</oscd-icon>
    </oscd-icon-button>`;
  }

  private openEditWizard(): void {
    // const wizard = wizards['AccessPoint'].edit(this.element);
    // if (wizard) {
    //   this.dispatchEvent(newWizardEvent(wizard));
    // }
    console.log('Please implement me', this);
  }

  private openSettingsWizard(services: Element): void {
    // const wizard = editServicesWizard(services);
    // if (wizard) {
    //   this.dispatchEvent(newWizardEvent(wizard));
    // }
    console.log('Please implement me', this, services);
  }

  private header() {
    const name = this.element.getAttribute('name') ?? '';
    const desc = this.element.getAttribute('desc');

    return `${name}${desc ? ` \u2014 ${desc}` : ''}`;
  }

  private removeAccessPoint(): void {
    // const wizard = removeAccessPointWizard(this.element);
    // if (wizard) {
    //   this.dispatchEvent(newWizardEvent(() => wizard));
    // } else {
    //   // If no Wizard is needed, just remove the element.
    //   this.dispatchEvent(
    //     newActionEvent({
    //       old: { parent: this.element.parentElement!, element: this.element },
    //     }),
    //   );
    // }
    console.log('Please implement me', this.element);
  }

  override render() {
    const lnElements = this.lnElements;

    return html`<oscd-action-pane .label="${this.header()}">
      <oscd-scl-icon slot="icon">accessPointIcon</oscd-scl-icon>
      <oscd-icon-button
        slot="action"
        title="${msg('remove')}"
        @click=${() => this.removeAccessPoint()}
      >
        <oscd-icon>delete</oscd-icon>
      </oscd-icon-button>
      <oscd-icon-button
        slot="action"
        title="${msg('edit')}"
        @click=${() => this.openEditWizard()}
      >
        <oscd-icon>edit</oscd-icon>
      </oscd-icon-button>
      ${this.renderServicesIcon()}
      ${Array.from(this.element.querySelectorAll(':scope > Server')).map(
        server =>
          html`<server-container
            .editCount=${this.editCount}
            .doc=${this.doc}
            .element=${server}
            .nsdoc=${this.nsdoc}
            .selectedLNClasses=${this.selectedLNClasses}
            .ancestors=${[...this.ancestors, this.element]}
          ></server-container>`,
      )}
      <div id="lnContainer">
        ${lnElements.map(
          ln =>
            html`<ln-container
              .editCount=${this.editCount}
              .doc=${this.doc}
              .element=${ln}
              .nsdoc=${this.nsdoc}
              .ancestors=${[...this.ancestors, this.element]}
            ></ln-container>`,
        )}
      </div>
    </oscd-action-pane>`;
  }

  static styles = css`
    #lnContainer {
      display: grid;
      grid-gap: 12px;
      box-sizing: border-box;
      grid-template-columns: repeat(auto-fit, minmax(316px, auto));
    }

    @media (max-width: 387px) {
      #lnContainer {
        grid-template-columns: repeat(auto-fit, minmax(196px, auto));
      }
    }
  `;
}
