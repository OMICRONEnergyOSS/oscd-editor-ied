import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement, TemplateResult, html, css, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { msg } from '@lit/localize';

import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
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

export class DaiValueEditDialog extends ScopedElementsMixin(LitElement) {
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

  @property({ type: Array })
  enumValues: string[] = [];

  @property({ attribute: false })
  valElement: Element | null = null;

  @property({ type: Number })
  sGroup: number | null = null;

  @query('oscd-dialog')
  private dialog!: OscdDialog;

  private dialogTitle = '';

  private bType = '';

  private templateValue: string | null = null;

  public show(): void {
    this.bType = this.templateElement?.getAttribute('bType') ?? '';
    if (!this.instanceElement || !this.bType) {
      return;
    }

    this.templateValue =
      this.templateElement?.querySelector('Val')?.textContent?.trim() ?? null;
    this.editedValue = this.getInstanceValue() ?? '';

    this.dialogTitle = `Edit DAI "${this.instanceElement.getAttribute('name') ?? ''}"`;

    this.requestUpdate();
    this.dialog.show();
  }

  private reset() {
    this.dialogTitle = '';
    this.bType = '';
    this.templateValue = null;
    this.enumValues = [];
    this.valElement = null;
    this.sGroup = null;
    this.editedValue = null;
    this.requestUpdate();
  }

  private close(): void {
    this.dialog.close();
    this.reset();
  }

  private confirm(): void {
    if (!this.instanceElement) {
      return;
    }

    const edits: EditV2 = [];

    if (!this.valElement) {
      const reference = this.findInsertReference();
      const newVal = this.buildValElement(
        this.editedValue ?? '',
        this.sGroup ?? undefined,
      );
      edits.push({ parent: this.instanceElement, node: newVal, reference });
    } else {
      edits.push({
        element: this.valElement,
        textContent: this.editedValue ?? '',
      });
    }

    this.dispatchEvent(newEditEventV2(edits));
    this.close();
  }

  private editedValue: string | null = null;

  private buildValElement(value: string, sGroup?: number): Element {

    const val = createElement(this.templateElement.ownerDocument, 'Val', {
      ...(sGroup ? { sGroup: `${sGroup}` } : {}),
    });
    val.textContent = value ?? '';
    return val;
  }

  private getInstanceValue(): string | undefined {
    if (this.valElement) {
      return this.valElement.textContent?.trim();
    }

    if (!this.instanceElement) {
      return undefined;
    }

    if (this.sGroup !== null && this.sGroup > 1) {
      const match = this.instanceElement.querySelector(
        `Val[sGroup="${this.sGroup}"]`,
      );
      return match?.textContent?.trim();
    }

    const val = this.instanceElement.querySelector('Val');
    return val?.textContent?.trim();
  }

  private findInsertReference(): Element | null {
    if (!this.sGroup || !this.instanceElement) {
      return null;
    }

    const vals = Array.from(this.instanceElement.querySelectorAll('Val'));
    return (
      vals.find(val => {
        const current = parseInt(val.getAttribute('sGroup') ?? '0');
        return !Number.isNaN(current) && current > this.sGroup!;
      }) ?? null
    );
  }

  private handleValueChange(event: CustomEvent<DaiValueFieldChange>): void {
    this.editedValue = event.detail.value ?? '';
  }

  private handleTimestampChange(
    event: CustomEvent<DaiTimestampFieldChange>,
  ): void {
    this.editedValue = event.detail.value ?? '';
  }

  private renderValueField(): TemplateResult {
    const value = this.editedValue ?? '';

    if (this.bType === 'Timestamp') {
      return html`
        <dai-timestamp-field
          .value=${value}
          .labelDate=${msg('Val (Date)')}
          .labelTime=${msg('Val (Time)')}
          @change=${this.handleTimestampChange}
        ></dai-timestamp-field>
      `;
    }

    return html`
      <dai-value-field
        .bType=${this.bType}
        .value=${value}
        .label=${msg('Val')}
        .enumValues=${this.enumValues}
        @change=${this.handleValueChange}
      ></dai-value-field>
    `;
  }

  render(): TemplateResult {
    return html`
      <oscd-dialog @closed=${this.close}>
        <div slot="headline">${this.dialogTitle}</div>
        <div slot="content" class="dialog-content">
          <div class="field-group">${this.renderValueField()}</div>
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
