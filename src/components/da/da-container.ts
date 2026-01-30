import { TemplateResult, nothing, html, css } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';

import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdSclIcon } from '@omicronenergy/oscd-ui/scl-icon/OscdSclIcon.js';
import {
  getValueElements,
  getInstanceDAElement,
  MDASH,
} from '../../foundation.js';
import { BaseContainer } from '../base-container.js';
import { msg } from '@lit/localize';
import { DaiValueDialog } from './dai-value-dialog.js';
import { DaInfoDialog } from './da-info-dialog.js';

function getValueDisplayString(val: Element): string {
  const sGroup = val.getAttribute('sGroup');
  const prefix = sGroup ? `SG${sGroup}: ` : '';
  const value = val.textContent?.trim();

  return `${prefix}${value}`;
}

const supportedDaiTypes = new Set([
  'BOOLEAN',
  'Enum',
  'FLOAT32',
  'FLOAT64',
  'INT8',
  'INT16',
  'INT24',
  'INT32',
  'INT64',
  'INT128',
  'INT8U',
  'INT16U',
  'INT24U',
  'INT32U',
  'Timestamp',
  'VisString32',
  'VisString64',
  'VisString65',
  'VisString129',
  'VisString255',
  'ObjRef',
  'Currency',
  'Octet64',
  'Octet6',
  'Octet16',
]);

/** [[`IED`]] plugin subeditor for editing `(B)DA` element. */
export class DAContainer extends ScopedElementsMixin(BaseContainer) {
  static scopedElements = {
    'oscd-action-pane': OscdActionPane,
    'oscd-icon-button': OscdIconButton,
    'oscd-scl-icon': OscdSclIcon,
    'oscd-icon': OscdIcon,
    'da-container': DAContainer,
    'dai-value-dialog': DaiValueDialog,
    'da-info-dialog': DaInfoDialog,
  };

  /**
   * The optional DAI of this (B)DA.
   */
  @property({ attribute: false })
  instanceElement: Element | null = null;

  @property({ type: Boolean })
  expanded = false;

  @query('dai-value-dialog')
  daiValueDialog!: DaiValueDialog;

  @query('da-info-dialog')
  daInfoDialog!: DaInfoDialog;

  private openCreateDialog(): void {
    const bType = this.element.getAttribute('bType');
    if (!bType || !supportedDaiTypes.has(bType)) {
      return;
    }

    this.daiValueDialog.templateElement = this.element;
    this.daiValueDialog.instanceElement = this.instanceElement;
    this.daiValueDialog.ancestors = this.ancestors;
    this.daiValueDialog.show();
  }

  private openEditDialog(): void {
    const bType = this.element.getAttribute('bType');
    if (!bType || !supportedDaiTypes.has(bType)) {
      return;
    }
    if (!this.instanceElement) {
      return;
    }

    this.daiValueDialog.templateElement = this.element;
    this.daiValueDialog.instanceElement = this.instanceElement;
    this.daiValueDialog.ancestors = this.ancestors;
    this.daiValueDialog.show();
  }

  private openInfoDialog(): void {
    this.daInfoDialog.show();
  }

  private toggleExpanded(): void {
    this.expanded = !this.expanded;
  }

  private header(): TemplateResult {
    const name = this.element.getAttribute('name') ?? '';
    const bType = this.element.getAttribute('bType') ?? nothing;
    const fc = this.element.getAttribute('fc');

    if (this.instanceElement) {
      return html`<b>${name}</b> ${MDASH} ${bType}${fc ? html` [${fc}]` : ``}`;
    } else {
      return html`${name} ${MDASH} ${bType}${fc ? html` [${fc}]` : ``}`;
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
                  ?disabled=${!bType || !supportedDaiTypes.has(bType)}
                  @click=${this.openEditDialog}
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
                ?disabled=${!bType || !supportedDaiTypes.has(bType)}
                @click=${this.openCreateDialog}
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
            @click=${() => this.openInfoDialog()}
          >
            <oscd-icon>info</oscd-icon>
          </oscd-icon-button>
        </abbr>
        ${bType === 'Struct'
          ? html` <abbr slot="action" title="${msg('Toggle child elements')}">
              <oscd-icon-button
                id="toggleButton"
                toggle
                .selected=${this.expanded}
                @click=${this.toggleExpanded}
              >
                <oscd-icon>keyboard_arrow_down</oscd-icon>
                <oscd-icon slot="selected">keyboard_arrow_up</oscd-icon>
              </oscd-icon-button>
            </abbr>`
          : html`${this.renderVal()}`}
        ${this.expanded && bType === 'Struct'
          ? this.getBDAElements().map(
              bdaElement =>
                html`<da-container
                  .docVersion=${this.docVersion}
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
      <dai-value-dialog></dai-value-dialog>
      <da-info-dialog
        .ancestors=${this.ancestors}
        .nsdoc=${this.nsdoc}
        .templateElement=${this.element}
        .instanceElement=${this.instanceElement}
      ></da-info-dialog>
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
