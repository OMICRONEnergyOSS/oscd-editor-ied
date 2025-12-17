import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { BaseContainer } from './base-container.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdSclIcon } from '@omicronenergy/oscd-ui/scl-icon/OscdSclIcon.js';
import { html, nothing, TemplateResult } from 'lit';
import { query } from 'lit/decorators.js';
import { msg } from '@lit/localize';
import { DOContainer } from './do-container.js';
import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';

/** [[`IED`]] plugin subeditor for editing `LN` and `LN0` element. */
export class LNContainer extends ScopedElementsMixin(BaseContainer) {
  static scopedElements = {
    'oscd-outlined-button': OscdOutlinedButton,
    'oscd-icon-button': OscdIconButton,
    'oscd-scl-icon': OscdSclIcon,
    'oscd-action-pane': OscdActionPane,
    'oscd-icon': OscdIcon,
    'do-container': DOContainer,
  };

  @query('#toggleButton')
  toggleButton!: OscdIconButton | undefined;

  private header(): string {
    const prefix = this.element.getAttribute('prefix');
    const inst = this.element.getAttribute('inst');
    const desc = this.element.getAttribute('desc');

    const data = this.nsdoc.getDataDescription(this.element);

    return `${prefix != null ? `${prefix} \u2014 ` : ''}
    ${data.label} ${inst ? ` \u2014 ${inst}` : ''}
    ${desc ? ` \u2014 ${desc}` : ''}`;
  }

  /**
   * Get the DO child elements of this LN(0) section.
   * @returns The DO child elements, or an empty array if none are found.
   */
  private getDOElements(): Element[] {
    const lnType = this.element.getAttribute('lnType') ?? undefined;
    const lNodeType = this.element
      .closest('SCL')!
      .querySelector(`:root > DataTypeTemplates > LNodeType[id="${lnType}"]`);
    if (lNodeType != null) {
      return Array.from(lNodeType.querySelectorAll(':scope > DO'));
    }
    return [];
  }

  /**
   * Get the instance element (DOI) of a DO element (if available)
   * @param dO - The DO object to use.
   * @returns The optional DOI object.
   */
  private getInstanceElement(dO: Element): Element | null {
    const doName = dO.getAttribute('name');
    return this.element.querySelector(`:scope > DOI[name="${doName}"]`);
  }

  private openEditWizard(): void {
    // const wizardType = this.element.tagName === 'LN' ? 'LN' : 'LN0';
    // const wizard = wizards[wizardType].edit(this.element);
    // if (wizard) {
    //   this.dispatchEvent(newWizardEvent(wizard));
    // }
    console.log('Please implement me', this);
  }

  private removeElement(): void {
    // if (this.element.tagName === 'LN') {
    //   this.dispatchEvent(
    //     newActionEvent({
    //       old: { parent: this.element.parentElement!, element: this.element },
    //     }),
    //   );
    // }
    console.log('Please implement me', this.element);
  }

  render(): TemplateResult {
    const doElements = this.getDOElements();

    return html`<oscd-action-pane label="${this.header()}">
      ${doElements.length > 0
        ? html`${this.element.tagName === 'LN'
              ? html`<oscd-icon-button
                  slot="action"
                  title="${msg('remove')}"
                  @click=${() => this.removeElement()}
                >
                  <oscd-icon>delete</oscd-icon>
                </oscd-icon-button>`
              : nothing}<abbr slot="action">
              <oscd-icon-button
                slot="action"
                mini
                icon="edit"
                @click=${() => this.openEditWizard()}
              >
                <oscd-icon>edit</oscd-icon></oscd-icon-button
              >
            </abbr>
            <abbr slot="action" title="${msg('Toggle child elements')}">
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
      ${this.toggleButton?.selected
        ? doElements.map(
            dO =>
              html`<do-container
                .editCount=${this.editCount}
                .doc=${this.doc}
                .element=${dO}
                .instanceElement=${this.getInstanceElement(dO)}
                .nsdoc=${this.nsdoc}
                .ancestors=${[...this.ancestors, this.element]}
              ></do-container> `,
          )
        : nothing}
    </oscd-action-pane>`;
  }
}
