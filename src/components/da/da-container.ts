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
import {
  determineUninitializedStructure,
  initializeElements,
} from '../../foundation/dai.js';
import { DaiValueDialog } from './dai-value-dialog.js';
import { newEditEventV2 } from '@openscd/oscd-api/utils.js';
import { DaInfoDialog } from './da-info-dialog.js';

function getValueDisplayString(val: Element): string {
  const sGroup = val.getAttribute('sGroup');
  const prefix = sGroup ? `SG${sGroup}: ` : '';
  const value = val.textContent?.trim();

  return `${prefix}${value}`;
}

function getInstanceValues(
  instanceElement: Element | null,
  multipleSettings: number | null,
): string[] {
  if (!instanceElement) {
    return multipleSettings ? Array(multipleSettings).fill('') : [''];
  }

  const vals = Array.from(instanceElement.querySelectorAll('Val'));
  if (multipleSettings && multipleSettings > 0) {
    return Array.from({ length: multipleSettings }, (_, index) => {
      const sGroup = `${index + 1}`;
      const val = vals.find(v => v.getAttribute('sGroup') === sGroup);
      return val?.textContent?.trim() ?? '';
    });
  }

  const val = vals.find(v => !v.getAttribute('sGroup')) ?? vals[0];
  return [val?.textContent?.trim() ?? ''];
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

  private openCreateWizard(): void {
    const bType = this.element.getAttribute('bType');
    if (!bType || !supportedDaiTypes.has(bType)) {
      return;
    }

    const lnElement = this.ancestors.find(element =>
      ['LN0', 'LN'].includes(element.tagName),
    );
    if (!lnElement) {
      return;
    }

    const templateStructure = this.getTemplateStructure();
    const multipleSettings = this.getMultipleSettingGroupCount();
    const templateValue = this.element
      .querySelector('Val')
      ?.textContent?.trim();

    let parentElement = lnElement;
    let insertElement: Element | null = null;
    let targetDai: Element | null = null;

    if (this.instanceElement?.tagName === 'DAI') {
      parentElement = this.instanceElement;
      targetDai = this.instanceElement;
    } else {
      const [parent, uninitializedTemplateStructure] =
        determineUninitializedStructure(lnElement, templateStructure);
      parentElement = parent;
      insertElement = initializeElements(uninitializedTemplateStructure);
      targetDai =
        insertElement.tagName === 'DAI'
          ? insertElement
          : insertElement.querySelector('DAI');
    }

    if (!targetDai) {
      return;
    }

    this.daiValueDialog.show({
      title: `Create DAI "${targetDai.getAttribute('name') ?? ''}"`,
      bType,
      enumValues: bType === 'Enum' ? this.getEnumValues() : [],
      values: this.instanceElement
        ? getInstanceValues(this.instanceElement, multipleSettings)
        : [],
      templateValue,
      multipleSettings,
      onConfirm: values => {
        if (insertElement) {
          Array.from(targetDai!.querySelectorAll('Val')).forEach(val =>
            val.remove(),
          );
          if (multipleSettings) {
            values.forEach((value, index) => {
              targetDai!.append(this.buildValElement(value, index + 1));
            });
          } else {
            targetDai!.append(this.buildValElement(values[0] ?? ''));
          }

          this.dispatchEvent(
            newEditEventV2({
              parent: parentElement,
              node: insertElement,
              reference: null,
            }),
          );
          return;
        }

        const edits = [
          ...Array.from(targetDai!.querySelectorAll('Val')).map(val => ({
            node: val,
          })),
          ...(multipleSettings
            ? values.map((value, index) => ({
                parent: targetDai!,
                node: this.buildValElement(value, index + 1),
                reference: null,
              }))
            : [
                {
                  parent: targetDai!,
                  node: this.buildValElement(values[0] ?? ''),
                  reference: null,
                },
              ]),
        ];

        this.dispatchEvent(newEditEventV2(edits));
      },
    });
  }

  private openEditWizard(_val: Element): void {
    const bType = this.element.getAttribute('bType');
    if (!bType || !supportedDaiTypes.has(bType)) {
      return;
    }
    if (!this.instanceElement) {
      return;
    }

    const multipleSettings = this.getMultipleSettingGroupCount();
    const templateValue = this.element
      .querySelector('Val')
      ?.textContent?.trim();

    this.daiValueDialog.show({
      title: `Edit DAI "${this.instanceElement.getAttribute('name') ?? ''}"`,
      bType,
      enumValues: bType === 'Enum' ? this.getEnumValues() : [],
      values: getInstanceValues(this.instanceElement, multipleSettings),
      templateValue,
      multipleSettings,
      onConfirm: values => {
        const edits = [
          ...Array.from(this.instanceElement!.querySelectorAll('Val')).map(
            existingVal => ({
              node: existingVal,
            }),
          ),
          ...(multipleSettings
            ? values.map((value, index) => ({
                parent: this.instanceElement!,
                node: this.buildValElement(value, index + 1),
                reference: null,
              }))
            : [
                {
                  parent: this.instanceElement!,
                  node: this.buildValElement(values[0] ?? ''),
                  reference: null,
                },
              ]),
        ];

        this.dispatchEvent(newEditEventV2(edits));
      },
    });
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

  private getMultipleSettingGroupCount(): number | null {
    let daElement = this.element;
    if (this.element.tagName === 'BDA') {
      const daTypeId = this.element.parentElement?.getAttribute('id');
      const root = this.element.getRootNode() as Document | Element;
      const referencedDa = root.querySelector(
        `DOType > DA[type="${daTypeId}"]`,
      );
      if (referencedDa) {
        daElement = referencedDa;
      }
    }

    const fc = daElement.getAttribute('fc') ?? '';
    const settingControl = this.element
      .closest('IED')
      ?.querySelector('SettingControl');
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

  private getEnumValues(): string[] {
    const enumTypeId = this.element.getAttribute('type');
    if (!enumTypeId) {
      return [];
    }

    return Array.from(
      this.element.ownerDocument.querySelectorAll(
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

  private buildValElement(value: string, sGroup?: number): Element {
    const namespace =
      this.element.ownerDocument.documentElement.namespaceURI ??
      'http://www.iec.ch/61850/2003/SCL';
    const val = this.element.ownerDocument.createElementNS(namespace, 'Val');
    if (sGroup) {
      val.setAttribute('sGroup', `${sGroup}`);
    }
    val.textContent = value;
    return val;
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
                ?disabled=${!bType || !supportedDaiTypes.has(bType)}
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
