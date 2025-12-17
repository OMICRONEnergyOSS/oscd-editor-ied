import { TemplateResult, nothing, html, css } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';

import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdSclIcon } from '@omicronenergy/oscd-ui/scl-icon/OscdSclIcon.js';
import { getValueElements, getInstanceDAElement } from '../foundation.js';
import { BaseContainer } from './base-container.js';
import { msg } from '@lit/localize';
import { predefinedBasicTypeEnum } from '@omicronenergy/oscd-edit-dialog/patterns.js';

function getValueDisplayString(val: Element): string {
  const sGroup = val.getAttribute('sGroup');
  const prefix = sGroup ? `SG${sGroup}: ` : '';
  const value = val.textContent?.trim();

  return `${prefix}${value}`;
}

/** [[`IED`]] plugin subeditor for editing `(B)DA` element. */
export class DAContainer extends ScopedElementsMixin(BaseContainer) {
  static scopedElements = {
    'oscd-action-pane': OscdActionPane,
    'oscd-icon-button': OscdIconButton,
    'oscd-scl-icon': OscdSclIcon,
    'oscd-icon': OscdIcon,
    'da-container': DAContainer,
  };

  /**
   * The optional DAI of this (B)DA.
   */
  @property({ attribute: false })
  instanceElement!: Element;

  @query('#toggleButton')
  toggleButton: OscdIconButton | undefined;

  private header(): TemplateResult {
    const name = this.element.getAttribute('name') ?? '';
    const bType = this.element.getAttribute('bType') ?? nothing;
    const fc = this.element.getAttribute('fc');

    if (this.instanceElement) {
      return html`<b>${name}</b> &mdash; ${bType}${fc ? html` [${fc}]` : ``}`;
    } else {
      return html`${name} &mdash; ${bType}${fc ? html` [${fc}]` : ``}`;
    }
  }

  /**
   * Get the nested (B)DA element(s) if available.
   * @returns The nested (B)DA element(s) of this (B)DA container.
   */
  private getBDAElements(): Element[] {
    const type = this.element!.getAttribute('type') ?? undefined;
    const doType = this.element!.closest('SCL')!.querySelector(
      `:root > DataTypeTemplates > DAType[id="${type}"]`,
    );
    if (doType != null) {
      return Array.from(doType!.querySelectorAll(':scope > BDA'));
    }
    return [];
  }

  /**
   * Use the list of ancestor to retrieve the list from DO to the current (B)DA Element.
   * This structure is used to create the initialized structure from (DOI/SDI/DAI).
   *
   * @returns The list from the DO Element to the current (B)DA Element.
   */
  private getTemplateStructure(): Element[] {
    // Search for the DO Element, this will be the starting point.
    const doElement = this.ancestors.filter(
      element => element.tagName == 'DO',
    )[0];
    // From the DO Element and below we need all the elements (BDA, SDO, DA)
    const dataStructure = this.ancestors.slice(
      this.ancestors.indexOf(doElement),
    );
    // Add the current DA Element also to the list.
    dataStructure.push(this.element);
    return dataStructure;
  }

  private openCreateWizard(): void {
    // // Search the LN(0) Element to start creating the initialized structure.
    // const lnElement = this.ancestors.filter(element =>
    //   ['LN0', 'LN'].includes(element.tagName),
    // )[0];
    // const templateStructure = this.getTemplateStructure();
    // // First determine where to start creating new elements (DOI/SDI/DAI)
    // const [parentElement, uninitializedTemplateStructure] =
    //   determineUninitializedStructure(lnElement, templateStructure);
    // // Next create all missing elements (DOI/SDI/DAI)
    // const newElement = initializeElements(uninitializedTemplateStructure);

    // if (newElement) {
    //   const wizard = createDAIWizard(parentElement, newElement, this.element);
    //   if (wizard) {
    //     this.dispatchEvent(newWizardEvent(wizard));
    //   }
    // }
    console.log('Please implement me', this);
  }

  private openEditWizard(val: Element): void {
    // const wizard = wizards['DAI'].edit(this.element, val);
    // if (wizard) {
    //   this.dispatchEvent(newWizardEvent(wizard));
    // }
    console.log('Please implement me', this, val);
  }

  private renderVal(): TemplateResult[] {
    const bType = this.element!.getAttribute('bType');
    const element = this.instanceElement ?? this.element;
    const hasInstantiatedVal = !!this.instanceElement?.querySelector('Val');

    return hasInstantiatedVal
      ? getValueElements(element).map(
          val =>
            html`<div style="display: flex; flex-direction: row;">
              <div style="display: flex; align-items: center; flex: auto;">
                <h4>${getValueDisplayString(val)}</h4>
              </div>
              <div style="display: flex; align-items: center;">
                <oscd-icon-button
                  ?disabled=${!bType ||
                  !predefinedBasicTypeEnum[
                    bType as keyof typeof predefinedBasicTypeEnum
                  ]}
                  @click=${() => this.openEditWizard(val)}
                >
                  <oscd-icon>edit</oscd-icon>
                </oscd-icon-button>
              </div>
            </div>`,
        )
      : [
          html`<div style="display: flex; flex-direction: row;">
            <div style="display: flex; align-items: center; flex: auto;">
              <h4>&nbsp;</h4>
            </div>
            <div style="display: flex; align-items: center;">
              <oscd-icon-button
                ?disabled=${!bType ||
                !predefinedBasicTypeEnum[
                  bType as keyof typeof predefinedBasicTypeEnum
                ]}
                @click=${() => this.openCreateWizard()}
              >
                <oscd-icon>add</oscd-icon>
              </oscd-icon-button>
            </div>
          </div>`,
        ];
  }

  render(): TemplateResult {
    const bType = this.element!.getAttribute('bType');

    return html`
      <oscd-action-pane
        .label="${this.header()}"
        icon="${this.instanceElement != null ? 'done' : ''}"
      >
        <abbr slot="action">
          <oscd-icon-button
            title=${this.nsdoc.getDataDescription(this.element, this.ancestors)
              .label}
            @click=${() =>
              // this.dispatchEvent(
              //   newWizardEvent(
              //     createDaInfoWizard(
              //       this.element,
              //       this.instanceElement,
              //       this.ancestors,
              //       this.nsdoc,
              //     ),
              //   ),
              // )
              console.log('Please implement me', this.element)}
          >
            <oscd-icon>info</oscd-icon>
          </oscd-icon-button>
        </abbr>
        ${bType === 'Struct'
          ? html` <abbr slot="action" title="${msg('Toggle child elements')}">
              <oscd-icon-button
                id="toggleButton"
                toggle
                @click=${() => this.requestUpdate()}
              >
                <oscd-icon>keyboard_arrow_down</oscd-icon>
                <oscd-icon slot="selected">keyboard_arrow_up</oscd-icon>
              </oscd-icon-button>
            </abbr>`
          : html`${this.renderVal()}`}
        ${this.toggleButton?.selected && bType === 'Struct'
          ? this.getBDAElements().map(
              bdaElement =>
                html`<da-container
                  .editCount=${this.editCount}
                  .doc=${this.doc}
                  .element=${bdaElement}
                  .instanceElement=${getInstanceDAElement(
                    this.instanceElement,
                    bdaElement,
                  )}
                  .nsdoc=${this.nsdoc}
                  .ancestors=${[...this.ancestors, this.element]}
                >
                </da-container>`,
            )
          : nothing}
      </oscd-action-pane>
    `;
  }

  static styles = css`
    h4 {
      color: var(--mdc-theme-on-surface);
      font-family: 'Roboto', sans-serif;
      font-weight: 300;
      margin: 0px;
      padding-left: 0.3em;
      word-break: break-word;
      white-space: pre-wrap;
    }

    oscd-icon-button {
      color: var(--mdc-theme-on-surface);
    }
  `;
}
