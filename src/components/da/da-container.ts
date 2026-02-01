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
    /* Review-me: I'm fundamentally unsure how this should work. What if we adopted the style used by oscd-scl-dialogs,
     * by calling edit, passing whats neededas parameters, then awaiting the result (editV2's)?
     * Although I've no current plans to do so, I'm open to the future refactor of moving more of these add/edit IED dialogs over to oscd-scl-dialogs.
     * So adopting a similar style wouldn't hurt, but it shouldn't be an influence right now.
     * If Val was null, we could create our first EditV2 (insert Val here), then await response (which would also be an editv2 (setAttribute)). This way
     * the edit dialog always gets a proper Val, which it only needs to edit. Within this function is the only place where its know if that
     * is an "Insert + setAttribute" Edits, or just "setAttribute" Edit.
     */
    // Response: the dialog-as-component approach fits this codebase; we already pass the minimal props and let the dialog
    // build the edits. If we later migrate to oscd-scl-dialogs/wizard flow, this method is the seam for doing it.
    const bType = this.element.getAttribute('bType');
    if (!bType || !supportedDaiTypes.has(bType)) {
      return;
    }
    if (!this.instanceElement) {
      return;
    }

    /* Review-me: Shouldn't we be showing the default value some where (check open-scd legacy). If so, which is the right place to derive that value? here?
     * Would be useful for cases where no instance val set - user friendly - what does open-scd legacy do?
     * If it makes sense to always know the template default value, then we just pass that value to the dialog?
     */
    // Response: legacy shows template value inside the dialog content; we already do that there (via templateElement Val).
    // Keeping it in the dialog avoids duplicating template lookup in the container.

    this.daiValueEditDialog.templateElement = this.element;
    // Review-me: Based on the ponderings above, if it makes sense to refactor this to be similar to the oscd-scl-dialogs behaviour, then which properties does the dialog actually need?
    // Response: edit dialog only needs templateElement, instanceElement, enumValues, valElement, and sGroup.
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

  /* Review-me:
   */
  // Response: SG/SE is a separate UI mode (row per sGroup). For non‑SG we keep the simple instantiated/not‑instantiated flow.
  private renderVal(): TemplateResult[] {
    const bType = this.element!.getAttribute('bType');
    const element = this.instanceElement ?? this.element;
    const hasInstantiatedVal = !!this.instanceElement?.querySelector('Val');

    const settingGroupCount = this.getMultipleSettingGroupCount();
    if (settingGroupCount) {
      const values = getValueElements(element);
      return Array.from({ length: settingGroupCount }, (_, index) => {
        const sGroup = index + 1;
        const val =
          values.find(item => item.getAttribute('sGroup') === `${sGroup}`) ??
          null;
        const icon = val ? 'edit' : 'add';

        // Review-me: Why is this block repeated two more times below? Should this be extracted to a function or a template or component?
        // Response: yes, a small helper (e.g. renderValRow) would reduce duplication; we can do that once behavior settles.

        return html`<div style="display: flex; flex-direction: row;">
          <div style="display: flex; align-items: center; flex: auto;">
            <h4>${val ? getValueDisplayString(val) : `SG${sGroup}: `}</h4>
          </div>
          <div style="display: flex; align-items: center;">
            <oscd-icon-button
              ?disabled=${!bType || !supportedDaiTypes.has(bType)}
              @click=${() => this.openEditDialog(val, sGroup)}
            >
              <oscd-icon>${icon}</oscd-icon>
            </oscd-icon-button>
          </div>
        </div>`;
      });
    }

    /* Review-me: Here we handle two cases - instanciated, or not. But in the above block handle things differently. Is this correct? Whether its a single value or multiple SGs,
     * is it not true that the "instanciated/not instanciated" logic should be the same?
     */
    // Response: SG/SE always renders all sGroup rows and uses add/edit per row; non‑SG uses single add vs edit based on Val existence.
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
                  @click=${() => this.openEditDialog(val, 1)}
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

  private getMultipleSettingGroupCount(): number | null {
    // Review-me: does this read a little funny? what about setting daElement to this.element in the else block so we never set daElement to first potentially bein a DAI and then fix that inside the if block.
    // Response: we can keep as‑is; starting with template element and remapping BDA→DA is the intent. Happy to refactor for clarity.
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
    // Review-me: we seem to reference bType a lot, should it be a member, set when element changes?
    // Response: computing per render keeps it correct if element changes; caching adds complexity without clear benefit.
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
