import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement, TemplateResult, html, css, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { msg } from '@lit/localize';

import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import {
  determineUninitializedStructure,
  initializeElements,
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

export class DaiValueCreateDialog extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-dialog': OscdDialog,
    'oscd-outlined-button': OscdOutlinedButton,
    'oscd-filled-button': OscdFilledButton,
    'oscd-filled-text-field': OscdFilledTextField,
    'dai-value-field': DaiValueField,
    'dai-timestamp-field': DaiTimestampField,
  };

  @property({ attribute: false })
  templateElement!: Element;

  @property({ attribute: false })
  instanceElement: Element | null = null;

  @property({ attribute: false })
  ancestors: Element[] = [];

  @property({ type: Array })
  enumValues: string[] = [];

  @query('oscd-dialog')
  private dialog!: OscdDialog;

  private dialogTitle = '';

  private bType = '';

  private templateValue: string | null = null;

  private multipleSettings: number | null = null;

  private targetDai: Element | null = null;

  private insertElement: Element | null = null;

  private lnElement: Element | null = null;

  private editedValues = new Map<number, string>();

  public show(): void {
    const bType = this.templateElement?.getAttribute('bType') ?? '';
    if (!bType) {
      return;
    }

    this.editedValues.clear();
    this.bType = bType;
    if (bType !== 'Enum') {
      this.enumValues = [];
    }
    this.multipleSettings = this.getMultipleSettingGroupCount();
    this.templateValue =
      this.templateElement?.querySelector('Val')?.textContent?.trim() ?? null;

    if (this.instanceElement) {
      this.targetDai = this.instanceElement;
      this.insertElement = null;
      this.lnElement = null;
      this.dialogTitle = `Create DAI "${this.instanceElement.getAttribute('name') ?? ''}"`;
    } else {
      const lnElement =
        this.ancestors.find(element =>
          ['LN0', 'LN'].includes(element.tagName),
        ) ?? null;
      if (!lnElement) {
        return;
      }

      const templateStructure = this.getTemplateStructure();
      const [_, uninitializedTemplateStructure] =
        determineUninitializedStructure(lnElement, templateStructure);
      const insertElement = initializeElements(uninitializedTemplateStructure);
      const targetDai =
        insertElement.tagName === 'DAI'
          ? insertElement
          : insertElement.querySelector('DAI');
      if (!targetDai) {
        return;
      }

      this.lnElement = lnElement;
      this.insertElement = insertElement;
      this.targetDai = targetDai;
      this.dialogTitle = `Create DAI "${targetDai.getAttribute('name') ?? ''}"`;
    }

    this.requestUpdate();
    this.dialog.show();
  }

  private close(): void {
    this.dialog.close();
    this.targetDai = null;
    this.insertElement = null;
    this.lnElement = null;
    this.dialogTitle = '';
    this.bType = '';
    this.templateValue = null;
    this.multipleSettings = null;
    this.enumValues = [];
    this.editedValues.clear();
    this.requestUpdate();
  }

  private confirm(): void {
    if (!this.targetDai) {
      return;
    }

    const values = this.getResolvedValues();
    Array.from(this.targetDai.querySelectorAll('Val')).forEach(val =>
      val.remove(),
    );
    if (this.multipleSettings) {
      values.forEach((value, index) => {
        this.targetDai!.append(this.buildValElement(value, index + 1));
      });
    } else {
      this.targetDai.append(this.buildValElement(values[0] ?? ''));
    }

    if (this.insertElement && this.lnElement) {
      this.dispatchEvent(
        newEditEventV2({
          parent: this.lnElement,
          node: this.insertElement,
          reference: null,
        }),
      );
      this.close();
      return;
    }

    const edits = [
      ...Array.from(this.targetDai.querySelectorAll('Val')).map(
        existingVal => ({
          node: existingVal,
        }),
      ),
      ...(this.multipleSettings
        ? values.map((value, index) => ({
            parent: this.targetDai!,
            node: this.buildValElement(value, index + 1),
            reference: null,
          }))
        : [
            {
              parent: this.targetDai!,
              node: this.buildValElement(values[0] ?? ''),
              reference: null,
            },
          ]),
    ];

    this.dispatchEvent(newEditEventV2(edits));
    this.close();
  }

  private getTemplateStructure(): Element[] {
    const doElement = this.ancestors.find(element => element.tagName === 'DO');
    if (!doElement) {
      return [this.templateElement];
    }

    const dataStructure = this.ancestors.slice(
      this.ancestors.indexOf(doElement),
    );
    dataStructure.push(this.templateElement);
    return dataStructure;
  }

  private getMultipleSettingGroupCount(): number | null {
    let daElement = this.templateElement;
    if (this.templateElement.tagName === 'BDA') {
      const daTypeId = this.templateElement.parentElement?.getAttribute('id');
      const root = this.templateElement.getRootNode() as Document | Element;
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

  private buildValElement(value: string, sGroup?: number): Element {
    // Review-me: consider a shared helper (createElement + text + optional sGroup) to avoid duplicating Val creation logic.
    const val = this.templateElement.ownerDocument.createElementNS(
      'http://www.iec.ch/61850/2003/SCL',
      'Val',
    );
    val.textContent = value ?? '';
    if (sGroup) {
      val.setAttribute('sGroup', `${sGroup}`);
    }
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

  private getInstanceValue(index: number): string | null {
    if (!this.instanceElement) {
      return null;
    }

    const values = Array.from(this.instanceElement.querySelectorAll('Val'));
    if (!values.length) {
      return null;
    }

    if (this.multipleSettings) {
      const sGroup = `${index + 1}`;
      const match = values.find(val => val.getAttribute('sGroup') === sGroup);
      if (match) {
        return match.textContent?.trim() ?? '';
      }
    }

    const fallback = values[index] ?? values[0];
    return fallback?.textContent?.trim() ?? '';
  }

  private getCurrentValue(index: number): string {
    if (this.editedValues.has(index)) {
      return this.editedValues.get(index) ?? '';
    }

    const instanceValue = this.getInstanceValue(index);
    if (instanceValue !== null) {
      return instanceValue;
    }

    return this.templateValue ?? '';
  }

  private getResolvedValues(): string[] {
    const count = this.multipleSettings ?? 1;
    return Array.from({ length: count }, (_, index) =>
      this.getCurrentValue(index),
    );
  }

  private renderValueField(index: number): TemplateResult {
    const { bType, enumValues } = this;
    const label = this.multipleSettings
      ? msg(`Val for sGroup ${index + 1}`)
      : msg('Val');
    const value = this.getCurrentValue(index);
    const sGroup = this.multipleSettings ? index + 1 : null;

    if (bType === 'Timestamp') {
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
        .bType=${bType}
        .value=${value}
        .label=${label}
        .enumValues=${enumValues}
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
        <div slot="headline">${this.dialogTitle}</div>
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
    :host {
      --md-filled-text-field-disabled-input-text-opacity: 0.8;
      --md-filled-text-field-disabled-label-text-opacity: 0.8;
      --md-filled-text-field-disabled-container-color: transparent;

      --md-filled-text-field-disabled-active-indicator-color: transparent;
      --md-filled-text-field-active-indicator-height: 0px;
    }

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
