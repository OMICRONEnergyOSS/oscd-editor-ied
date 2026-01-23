import { html, nothing, TemplateResult } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';

/** [[`IED`]] plugin subeditor for editing `DO` element. */

import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdSclIcon } from '@omicronenergy/oscd-ui/scl-icon/OscdSclIcon.js';
import { BaseContainer } from '../base-container.js';
import { msg } from '@lit/localize';
import { DAContainer } from '../da/da-container.js';
import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';
import { DoInfoDialog } from './do-info-dialog.js';
import {
  findDOTypeElement,
  getInstanceDAElement,
  MDASH,
} from '../../foundation.js';

export class DOContainer extends ScopedElementsMixin(BaseContainer) {
  static scopedElements = {
    'oscd-outlined-button': OscdOutlinedButton,
    'oscd-icon-button': OscdIconButton,
    'oscd-scl-icon': OscdSclIcon,
    'oscd-icon': OscdIcon,
    'oscd-action-pane': OscdActionPane,
    'do-container': DOContainer,
    'da-container': DAContainer,
    'do-info-dialog': DoInfoDialog,
  };

  /**
   * The optional DOI of this DO.
   */
  @property({ attribute: false })
  instanceElement!: Element;

  @query('#toggleButton') toggleButton: OscdIconButton | undefined;
  @query('do-info-dialog') doInfoDialog!: DoInfoDialog;

  private header() {
    const name = this.element.getAttribute('name') ?? '';
    const desc = this.element.getAttribute('desc');

    if (this.instanceElement != null) {
      return html`<b>${name}${desc ? html` ${MDASH} ${desc}` : nothing}</b>`;
    } else {
      return html`${name}${desc ? html` ${MDASH} ${desc}` : nothing}`;
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

  private openInfoDialog(): void {
    this.doInfoDialog.show();
  }

  render(): TemplateResult {
    const daElements = this.getDAElements();
    const doElements = this.getSDOElements();
    const nsdocDescription = this.nsdoc.getDataDescription(
      this.element,
      this.ancestors,
    ).label;

    return html`<oscd-action-pane
        .label="${this.header()}"
        icon="${this.instanceElement != null ? 'done' : ''}"
      >
        <abbr slot="action">
          <oscd-icon-button
            title=${nsdocDescription}
            aria-label=${nsdocDescription}
            @click=${() => this.openInfoDialog()}
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
                  .docVersion=${this.docVersion}
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
                  .docVersion=${this.docVersion}
                  .doc=${this.doc}
                  .element=${doElement}
                  .instanceElement=${this.getInstanceDOElement(doElement)}
                  .nsdoc=${this.nsdoc}
                  .ancestors=${[...this.ancestors, this.element]}
                ></do-container>`,
            )
          : nothing}
      </oscd-action-pane>
      <do-info-dialog
        .ancestors=${this.ancestors}
        .nsdoc=${this.nsdoc}
        .templateElement=${this.element}
        .instanceElement=${this.instanceElement}
      ></do-info-dialog>`;
  }
}
