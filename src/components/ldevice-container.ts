import { TemplateResult, html, nothing, PropertyValues, css } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { msg } from '@lit/localize';

import { BaseContainer } from './base-container.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdSclIcon } from '@omicronenergy/oscd-ui/scl-icon/OscdSclIcon.js';
import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';
import { LNContainer } from './ln-container.js';

/** [[`IED`]] plugin subeditor for editing `LDevice` element. */
export class LDeviceContainer extends ScopedElementsMixin(BaseContainer) {
  static scopedElements = {
    'oscd-action-pane': OscdActionPane,
    'oscd-icon-button': OscdIconButton,
    'oscd-scl-icon': OscdSclIcon,
    'oscd-icon': OscdIcon,
    'ln-container': LNContainer,
  };

  @property()
  selectedLNClasses: string[] = [];

  @query('#toggleButton')
  toggleButton!: OscdIconButton | undefined;

  // @query('add-ln-dialog')
  // addLnDialog!: AddLnDialog;

  private openEditWizard(): void {
    // const wizard = wizards['LDevice'].edit(this.element);
    // if (wizard) {
    //   this.dispatchEvent(newWizardEvent(wizard));
    // }
    console.log('Please implement me', this);
  }

  private header() {
    const nameOrInst =
      this.element.getAttribute('nane') ?? this.element.getAttribute('inst');
    const desc = this.element.getAttribute('desc');
    const ldName = this.element.getAttribute('ldName');

    return `${nameOrInst}${desc ? ` \u2014 ${desc}` : ''}${
      ldName ? ` \u2014 ${ldName}` : ''
    }`;
  }

  protected firstUpdated(): void {
    this.requestUpdate();
  }

  protected updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);

    // When the LN Classes filter is updated, we also want to trigger rendering for the LN Elements.
    if (_changedProperties.has('selectedLNClasses')) {
      this.requestUpdate('lnElements');
    }
  }

  @state()
  private get lnElements(): Element[] {
    return Array.from(this.element.querySelectorAll(':scope > LN,LN0')).filter(
      element => {
        const lnClass = element.getAttribute('lnClass') ?? '';
        return this.selectedLNClasses.includes(lnClass);
      },
    );
  }

  private handleAddLN(data: unknown): void {
    // const getInst = lnInstGenerator(this.element, 'LN');
    // const inserts = [];

    // for (let i = 0; i < data.amount; i++) {
    //   const inst = getInst(data.lnClass);
    //   if (!inst) {
    //     break;
    //   }
    //   const lnAttrs = {
    //     lnClass: data.lnClass,
    //     lnType: data.lnType,
    //     inst: inst,
    //     ...(data.prefix ? { prefix: data.prefix } : {}),
    //   };
    //   const ln = createElement(this.doc, 'LN', lnAttrs);
    //   inserts.push({ parent: this.element, node: ln, reference: null });
    // }

    // this.dispatchEvent(newEditEventV2(inserts));
    console.log('Please implement me', data, this);
  }

  private removeLDevice(): void {
    // this.dispatchEvent(
    //   newActionEvent({
    //     old: { parent: this.element.parentElement!, element: this.element },
    //   }),
    // );
    console.log('Please implement me', this.element);
  }

  render(): TemplateResult {
    const lnElements = this.lnElements;

    return html`<oscd-action-pane label="${this.header()}">
      <oscd-scl-icon slot="icon">logicalDeviceIcon</oscd-scl-icon>
      <oscd-icon-button
        slot="action"
        title="${msg('remove')}"
        @click=${() => this.removeLDevice()}
      >
        <oscd-icon>delete</oscd-icon>
      </oscd-icon-button>
      <abbr slot="action" title="${msg('edit')}">
        <oscd-icon-button @click=${() => this.openEditWizard()}>
          <oscd-icon>edit</oscd-icon>
        </oscd-icon-button>
      </abbr>
      <abbr slot="action" title=${msg('iededitor.addLnDialog.title')}>
        <oscd-icon-button
          @click=${() => {
            console.log('Please implement me', this);
            // this.addLnDialog.show();
          }}
        >
          <oscd-icon>playlist_add</oscd-icon>
        </oscd-icon-button>
      </abbr>
      ${lnElements.length > 0
        ? html`<abbr slot="action" title="${msg('Toggle child elements')}">
            <oscd-icon-button
              toggle
              id="toggleButton"
              @click=${() => this.requestUpdate()}
            >
              <oscd-icon>keyboard_arrow_down</oscd-icon>
              <oscd-icon slot="selected">keyboard_arrow_up</oscd-icon>
            </oscd-icon-button>
          </abbr>`
        : nothing}
      <div id="lnContainer">
        ${this.toggleButton?.selected
          ? lnElements.map(
              ln =>
                html`<ln-container
                  .editCount=${this.editCount}
                  .doc=${this.doc}
                  .element=${ln}
                  .nsdoc=${this.nsdoc}
                  .ancestors=${[...this.ancestors, this.element]}
                ></ln-container> `,
            )
          : nothing}
      </div>
      <add-ln-dialog
        .doc=${this.doc}
        .onConfirm=${(data: unknown) => this.handleAddLN(data)}
      ></add-ln-dialog>
    </oscd-action-pane>`;
  }

  static styles = css`
    #lnContainer {
      display: grid;
      grid-gap: 12px;
      box-sizing: border-box;
      grid-template-columns: repeat(auto-fit, minmax(316px, auto));
    }

    abbr {
      text-decoration: none;
    }

    @media (max-width: 387px) {
      #lnContainer {
        grid-template-columns: repeat(auto-fit, minmax(196px, auto));
      }
    }
  `;
}
