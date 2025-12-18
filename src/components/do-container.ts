import { html, nothing, TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';

/** [[`IED`]] plugin subeditor for editing `DO` element. */

import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdSclIcon } from '@omicronenergy/oscd-ui/scl-icon/OscdSclIcon.js';
import { findDOTypeElement, getInstanceDAElement } from '../foundation.js';
import { BaseContainer } from './base-container.js';
import { msg } from '@lit/localize';
import { DAContainer } from './da-container.js';
import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';

export class DOContainer extends ScopedElementsMixin(BaseContainer) {
  static scopedElements = {
    'oscd-outlined-button': OscdOutlinedButton,
    'oscd-icon-button': OscdIconButton,
    'oscd-scl-icon': OscdSclIcon,
    'oscd-icon': OscdIcon,
    'oscd-action-pane': OscdActionPane,
    'do-container': DOContainer,
    'da-container': DAContainer,
  };

  /**
   * The optional DOI of this DO.
   */
  @property({ attribute: false })
  instanceElement!: Element;

  @query('#toggleButton') toggleButton: OscdIconButton | undefined;

  private header() {
    const name = this.element.getAttribute('name') ?? '';
    const desc = this.element.getAttribute('desc');

    if (this.instanceElement != null) {
      return html`<b>${name}${desc ? html` &mdash; ${desc}` : nothing}</b>`;
    } else {
      return html`${name}${desc ? html` &mdash; ${desc}` : nothing}`;
    }
  }

  /**
   * Get the nested SDO element(s).
   * @returns The nested SDO element(s) of this DO container.
   */
  private getSDOElements(): Element[] {
    const doType = findDOTypeElement(this.element);
    if (doType != null) {
      return Array.from(doType.querySelectorAll(':scope > SDO'));
    }
    return [];
  }

  /**
   * Get the nested (B)DA element(s).
   * @returns The nested (B)DA element(s) of this DO container.
   */
  private getDAElements(): Element[] {
    const type = this.element.getAttribute('type') ?? undefined;
    const doType = this.element
      .closest('SCL')!
      .querySelector(`:root > DataTypeTemplates > DOType[id="${type}"]`);
    if (doType != null) {
      return Array.from(doType!.querySelectorAll(':scope > DA'));
    }
    return [];
  }

  /**
   * Get the instance element (SDI) of a (S)DO element (if available)
   * @param dO - The (S)DO object to search with.
   * @returns The optional SDI element.
   */
  private getInstanceDOElement(dO: Element): Element | null {
    const sdoName = dO.getAttribute('name');
    if (this.instanceElement) {
      return this.instanceElement.querySelector(
        `:scope > SDI[name="${sdoName}"]`,
      );
    }
    return null;
  }

  render(): TemplateResult {
    const daElements = this.getDAElements();
    const doElements = this.getSDOElements();

    return html`<oscd-action-pane
      .label="${this.header()}"
      icon="${this.instanceElement != null ? 'done' : ''}"
    >
      <abbr slot="action">
        <oscd-icon-button
          title=${this.nsdoc.getDataDescription(this.element).label}
          @click=${() => {
            // this.dispatchEvent(
            //   newWizardEvent(
            //     createDoInfoWizard(
            //       this.element,
            //       this.instanceElement,
            //       this.ancestors,
            //       this.nsdoc,
            //     ),
            //   ),
            // );
            console.log('Please implement me', this.element);
          }}
        >
          <oscd-icon>info</oscd-icon>
        </oscd-icon-button>
      </abbr>
      ${daElements.length > 0 || doElements.length > 0
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
      ${this.toggleButton?.selected
        ? daElements.map(
            daElement =>
              html`<da-container
                .editCount=${this.editCount}
                .doc=${this.doc}
                .element=${daElement}
                .instanceElement=${getInstanceDAElement(
                  this.instanceElement,
                  daElement,
                )}
                .nsdoc=${this.nsdoc}
                .ancestors=${[...this.ancestors, this.element]}
              ></da-container>`,
          )
        : nothing}
      ${this.toggleButton?.selected
        ? doElements.map(
            doElement =>
              html`<do-container
                .editCount=${this.editCount}
                .doc=${this.doc}
                .element=${doElement}
                .instanceElement=${this.getInstanceDOElement(doElement)}
                .nsdoc=${this.nsdoc}
                .ancestors=${[...this.ancestors, this.element]}
              ></do-container>`,
          )
        : nothing}
    </oscd-action-pane> `;
  }
}
