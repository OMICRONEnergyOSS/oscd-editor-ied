import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { BaseContainer } from '../base-container.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdSclIcon } from '@omicronenergy/oscd-ui/scl-icon/OscdSclIcon.js';
import { html, nothing, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { msg } from '@lit/localize';
import { DOContainer } from '../do/do-container.js';
import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';
import {
  newConfirmDeleteEvent,
  newEditElementEvent,
} from '../../foundation/events.js';
import { newEditEventV2 } from '@openscd/oscd-api/utils.js';

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

  @property({ type: Boolean })
  expanded = false;

  private openEditWizard(): void {
    this.dispatchEvent(newEditElementEvent({ element: this.element }));
  }

  private removeLN(): void {
    const name = this.header();
    this.dispatchEvent(
      newConfirmDeleteEvent({
        heading: msg(`Delete`),
        message: msg(
          `Are you sure you want to delete LogicalNode "${name}" and all its content?`,
        ),
        onConfirm: () => {
          this.dispatchEvent(newEditEventV2({ node: this.element }));
        },
      }),
    );
  }

  private toggleExpanded(): void {
    this.expanded = !this.expanded;
  }

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

  render(): TemplateResult {
    const doElements = this.getDOElements();

    return html`<oscd-action-pane label="${this.header()}">
      ${doElements.length > 0
        ? html`${this.element.tagName === 'LN'
              ? html`<oscd-icon-button
                  slot="action"
                  title="${msg('remove')}"
                  @click=${() => this.removeLN()}
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
                .selected=${this.expanded}
                @click=${this.toggleExpanded}
              >
                <oscd-icon>keyboard_arrow_down</oscd-icon>
                <oscd-icon slot="selected">keyboard_arrow_up</oscd-icon>
              </oscd-icon-button>
            </abbr>`
        : nothing}
      ${this.expanded
        ? doElements.map(
            dO =>
              html`<do-container
                .docVersion=${this.docVersion}
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
