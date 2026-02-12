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
import { DaiValueCreateDialog } from './dai-value-create-dialog.js';
import { DaiValueEditDialog } from './dai-value-edit-dialog.js';
import { DaInfoDialog } from './da-info-dialog.js';

function getValueDisplayString(val: Element): string {
  const sGroup = val.getAttribute('sGroup');
  const prefix = sGroup ? `SG${sGroup}: ` : '';
  const value = val.textContent?.trim();

  return `${prefix}${value}`;
}

function getEnumValues(element: Element): string[] {
  const enumTypeId = element.getAttribute('type');
  if (!enumTypeId) {
    return [];
  }

  return Array.from(
    element.ownerDocument.querySelectorAll(
      `EnumType[id="${enumTypeId}"] > EnumVal`,
    ),
  )
    .filter(enumVal => enumVal.textContent && enumVal.textContent !== '')
    .sort(
      (left, right) =>
        parseInt(left.getAttribute('ord') ?? '0') -
        parseInt(right.getAttribute('ord') ?? '0'),
    )
    .map(enumVal => enumVal.textContent ?? '');
}

function renderValueRow(
  displayString: string,
  bType: string | null,
  icon: string,
  onClick: () => void,
): TemplateResult {
  return html`<div class="da-value-row">
    <div class="da-value-row-label">
      <h4>${displayString}</h4>
    </div>
    <div class="da-value-row-action">
      <oscd-icon-button
        ?disabled=${!bType || !supportedDaiTypes.has(bType)}
        @click=${onClick}
      >
        <oscd-icon>${icon}</oscd-icon>
      </oscd-icon-button>
    </div>
  </div>`;
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
    'dai-value-create-dialog': DaiValueCreateDialog,
    'dai-value-edit-dialog': DaiValueEditDialog,
    'da-info-dialog': DaInfoDialog,
  };

  /**
   * The optional DAI of this (B)DA.
   */
  @property({ attribute: false })
  instanceElement: Element | null = null;

  @property({ type: Boolean })
  expanded = false;

  @query('dai-value-create-dialog')
  daiValueCreateDialog!: DaiValueCreateDialog;

  @query('dai-value-edit-dialog')
  daiValueEditDialog!: DaiValueEditDialog;

  @query('da-info-dialog')
  daInfoDialog!: DaInfoDialog;

  private openCreateDialog(): void {
    const bType = this.element.getAttribute('bType');
    if (!bType || !supportedDaiTypes.has(bType)) {
      return;
    }

    this.daiValueCreateDialog.templateElement = this.element;
    this.daiValueCreateDialog.instanceElement = this.instanceElement;
    this.daiValueCreateDialog.ancestors = this.ancestors;
    this.daiValueCreateDialog.enumValues = getEnumValues(this.element);
    this.daiValueCreateDialog.show();
  }

  private openEditDialog(valElement?: Element | null, sGroup?: number): void {
    const bType = this.element.getAttribute('bType');
    if (!bType || !supportedDaiTypes.has(bType)) {
      return;
    }
    if (!this.instanceElement) {
      return;
    }

    this.daiValueEditDialog.templateElement = this.element;
    this.daiValueEditDialog.instanceElement = this.instanceElement;
    this.daiValueEditDialog.enumValues = getEnumValues(this.element);
    this.daiValueEditDialog.valElement = valElement ?? null;
    this.daiValueEditDialog.sGroup = sGroup ?? null;
    this.daiValueEditDialog.show();
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

  private renderValueSection(): TemplateResult[] {
    const bType = this.element!.getAttribute('bType');
    const element = this.instanceElement ?? this.element;
    const hasInstantiatedVal = !!this.instanceElement?.querySelector('Val');

    const settingGroupCount = this.getMultipleSettingGroupCount();
    if (
      settingGroupCount !== null &&
      settingGroupCount > 1 &&
      hasInstantiatedVal
    ) {
      const values = getValueElements(element);
      return Array.from({ length: settingGroupCount }, (_, index) => {
        const sGroup = index + 1;
        const val =
          values.find(item => item.getAttribute('sGroup') === `${sGroup}`) ??
          null;
        const icon = val ? 'edit' : 'add';

        return renderValueRow(
          val ? getValueDisplayString(val) : `SG${sGroup}: `,
          bType,
          icon,
          () => this.openEditDialog(val, sGroup),
        );
      });
    }

    return hasInstantiatedVal
      ? getValueElements(element).map(val =>
          renderValueRow(getValueDisplayString(val), bType, 'edit', () =>
            this.openEditDialog(val, 1),
          ),
        )
      : [renderValueRow('\u00A0', bType, 'add', this.openCreateDialog)];
  }

  private getMultipleSettingGroupCount(): number | null {
    let daElement;
    if (this.element.tagName === 'BDA') {
      const daTypeId = this.element.parentElement?.getAttribute('id');
      const root = this.element.getRootNode() as Document | Element;
      const referencedDa = root.querySelector(
        `DOType > DA[type="${daTypeId}"]`,
      );
      if (referencedDa) {
        daElement = referencedDa;
      }
    } else {
      daElement = this.element;
    }

    const fc = daElement?.getAttribute('fc') ?? '';
    const iedElement = this.ancestors.find(
      element => element.tagName === 'IED',
    );
    const settingControl = iedElement?.querySelector('SettingControl');
    const numOfSGs = settingControl?.getAttribute('numOfSGs') ?? '';
    const count = parseInt(numOfSGs);

    if (
      (fc === 'SG' || fc === 'SE') &&
      numOfSGs !== '' &&
      !Number.isNaN(count)
    ) {
      return count;
    }

    return null;
  }

  render(): TemplateResult {
    const bType = this.element!.getAttribute('bType');

    const nsDocDescription = this.nsdoc.getDataDescription(
      this.element,
      this.ancestors,
    ).label;
    const infoButtonTooltip =
      nsDocDescription !== this.element.getAttribute('name')
        ? nsDocDescription
        : msg('Show more information');

    return html`
      <oscd-action-pane
        .label="${this.header()}"
        icon="${this.instanceElement != null ? 'done' : ''}"
      >
        <abbr slot="action">
          <oscd-icon-button
            aria-label="${infoButtonTooltip}"
            title=${infoButtonTooltip}
            @click=${() => this.openInfoDialog()}
          >
            <oscd-icon>info</oscd-icon>
          </oscd-icon-button>
        </abbr>
        ${bType === 'Struct'
          ? html` <abbr slot="action">
              <oscd-icon-button
                aria-label="${msg('Toggle child elements')}"
                title="${msg('Toggle child elements')}"
                id="toggleButton"
                toggle
                .selected=${this.expanded}
                @click=${this.toggleExpanded}
              >
                <oscd-icon>keyboard_arrow_down</oscd-icon>
                <oscd-icon slot="selected">keyboard_arrow_up</oscd-icon>
              </oscd-icon-button>
            </abbr>`
          : html`${this.renderValueSection()}`}
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
      <dai-value-create-dialog></dai-value-create-dialog>
      <dai-value-edit-dialog></dai-value-edit-dialog>
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
      color: var(--md-sys-color-on-surface);
      font-family: var(--oscd-text-font);
      font-weight: 300;
      margin: 0px;
      padding-left: 0.3em;
      word-break: break-word;
      white-space: pre-wrap;
    }

    .da-value-row {
      display: flex;
      flex-direction: row;
    }

    .da-value-row-label {
      display: flex;
      align-items: center;
      flex: auto;
    }

    .da-value-row-action {
      display: flex;
      align-items: center;
    }

    oscd-icon-button {
      color: var(--md-sys-color-on-surface);
    }
  `;
}
