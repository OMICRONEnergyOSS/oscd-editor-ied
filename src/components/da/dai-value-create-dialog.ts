import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement, TemplateResult, html, css, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { msg } from '@lit/localize';

import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import {
  daSupportsMultipleValues,
  getNumOfSGs,
  planDaiCreation,
} from '../../foundation/dai.js';
import { newEditEventV2 } from '@openscd/oscd-api/utils.js';
import {
  DaiValueField,
  DaiValueFieldChange,
} from './fields/dai-value-field.js';
import {
  DaiTimestampField,
  DaiTimestampFieldChange,
} from './fields/dai-timestamp-field.js';
import { EditV2 } from '@openscd/oscd-api';
import { createElement } from '@openscd/scl-lib/dist/foundation/utils.js';
import { getTemplatePath } from '../../foundation/ln-initialization.js';

export class DaiValueCreateDialog extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-dialog': OscdDialog,
    'oscd-outlined-button': OscdOutlinedButton,
    'oscd-filled-button': OscdFilledButton,
    'oscd-filled-text-field': OscdFilledTextField,
    'dai-value-field': DaiValueField,
    'dai-timestamp-field': DaiTimestampField,
  };

  _templateElement!: Element;
  @property({ attribute: false })
  get templateElement(): Element {
    return this._templateElement;
  }
  set templateElement(value: Element) {
    this._templateElement = value;
    this.bType = value.getAttribute('bType');
  }

  @property({ attribute: false })
  instanceElement: Element | null = null;

  @property({ attribute: false })
  ancestors: Element[] = [];

  @property({ type: Array })
  enumValues: string[] = [];

  @query('oscd-dialog')
  private dialog!: OscdDialog;

  private bType: string | null = null;

  private templateValue: string | null = null;

  private multipleSettings: number | null = null;

  private editedValues = new Map<number, string>();

  private getMultipleSettingGroupCount(): number | null {
    if (!daSupportsMultipleValues(this.templateElement)) {
      return null;
    }

    return getNumOfSGs(this.ancestors);
  }

  public show(): void {
    if (!this.bType || !this.templateElement) {
      return;
    }

    this.editedValues.clear();
    this.multipleSettings = this.getMultipleSettingGroupCount();

    this.templateValue =
      this.templateElement.querySelector('Val')?.textContent?.trim() ?? null;

    this.requestUpdate();
    this.dialog.show();
  }

  private confirm(): void {
    if (!this.templateElement) {
      return;
    }

    const lnElement =
      this.ancestors.find(el => el.tagName === 'LN' || el.tagName === 'LN0') ??
      null;

    if (!lnElement) {
      return;
    }

    const values = Array.from(this.editedValues.entries())
      .filter(([_, value]) => value)
      .map(([index, value]) => ({
        value,
        sGroup: this.multipleSettings ? index + 1 : undefined,
      }));

    if (values.length === 0) {
      return;
    }

    const templatePath = getTemplatePath(this.templateElement, this.ancestors);

    const plan = planDaiCreation(lnElement, templatePath);

    const edits: EditV2[] = [];

    if (plan.kind === 'insert-structure') {
      edits.push({
        parent: plan.parent,
        node: plan.node,
        reference: null,
      });
    }

    for (const { value, sGroup } of values) {
      edits.push({
        parent: plan.instanceElement,
        node: this.buildValElement(value, sGroup),
        reference: null,
      });
    }

    this.dispatchEvent(
      newEditEventV2(edits.map(edit => ({ ...edit, squash: true }))),
    );

    this.close();
  }

  private close(): void {
    this.dialog.close();
    this.bType = '';
    this.templateValue = null;
    this.multipleSettings = null;
    this.enumValues = [];
    this.editedValues.clear();
    this.requestUpdate();
  }

  private buildValElement(value: string, sGroup?: number): Element {
    const val = createElement(
      this.templateElement.ownerDocument,
      'Val',
      sGroup ? { sGroup: `${sGroup}` } : {},
    );
    val.textContent = value ?? '';
    return val;
  }

  private handleValueChange(event: CustomEvent<DaiValueFieldChange>): void {
    const sGroup = event.detail.sGroup ?? null;
    const index = sGroup ? sGroup - 1 : 0;
    this.editedValues.set(index, event.detail.value ?? '');
  }

  private handleTimestampChange(
    event: CustomEvent<DaiTimestampFieldChange>,
  ): void {
    const sGroup = event.detail.sGroup ?? null;
    const index = sGroup ? sGroup - 1 : 0;
    this.editedValues.set(index, event.detail.value ?? '');
  }

  private renderValueField(index: number) {
    const label = this.multipleSettings
      ? msg(`Val for sGroup ${index + 1}`)
      : msg('Val');
    const value = this.editedValues.get(index) ?? '';
    const sGroup = this.multipleSettings ? index + 1 : null;

    if (!this.bType) {
      return nothing;
    }

    if (this.bType === 'Timestamp') {
      const labelDate = this.multipleSettings
        ? msg(`Val (Date) for sGroup ${index + 1}`)
        : msg('Val (Date)');
      const labelTime = this.multipleSettings
        ? msg(`Val (Time) for sGroup ${index + 1}`)
        : msg('Val (Time)');

      return html`
        <dai-timestamp-field
          .value=${value}
          .labelDate=${labelDate}
          .labelTime=${labelTime}
          .sGroup=${sGroup}
          @change=${this.handleTimestampChange}
        ></dai-timestamp-field>
      `;
    }

    return html`
      <dai-value-field
        .bType=${this.bType}
        .value=${value}
        .label=${label}
        .enumValues=${this.enumValues}
        .sGroup=${sGroup}
        @change=${this.handleValueChange}
      ></dai-value-field>
    `;
  }

  private renderFields(): TemplateResult[] {
    const count = this.multipleSettings ?? 1;
    return Array.from(
      { length: count },
      (_, index) =>
        html`<div class="field-group">${this.renderValueField(index)}</div>`,
    );
  }

  render(): TemplateResult {
    return html`
      <oscd-dialog @closed=${this.close}>
        <div slot="headline">
          ${`Create DAI "${this.templateElement?.getAttribute('name') ?? ''}"`}
        </div>
        <div slot="content" class="dialog-content">
          ${this.renderFields()}
          ${this.templateValue
            ? html`<oscd-filled-text-field
                label=${msg('DA template value')}
                .value=${this.templateValue}
                disabled
              ></oscd-filled-text-field>`
            : nothing}
        </div>
        <div slot="actions">
          <oscd-outlined-button slot="secondaryAction" @click=${this.close}>
            ${msg('Cancel')}
          </oscd-outlined-button>
          <oscd-filled-button slot="primaryAction" @click=${this.confirm}>
            ${msg('Save')}
          </oscd-filled-button>
        </div>
      </oscd-dialog>
    `;
  }

  static styles = css`
    [slot='content'] {
      width: 320px;
      max-width: 100vw;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `;
}
