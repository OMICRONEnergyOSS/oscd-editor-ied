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

  private targetDai: Element | null = null;

  public show(): void {
    if (!this.instanceElement) {
      return;
    }

    const bType = this.templateElement?.getAttribute('bType') ?? '';
    if (!bType) {
      return;
    }

    this.bType = bType;
    if (bType !== 'Enum') {
      this.enumValues = [];
    }
    this.templateValue =
      this.templateElement?.querySelector('Val')?.textContent?.trim() ?? null;
    this.editedValue = null;

    this.targetDai = this.instanceElement;
    this.dialogTitle = `Edit DAI "${this.instanceElement.getAttribute('name') ?? ''}"`;

    this.requestUpdate();
    this.dialog.show();
  }

  private close(): void {
    this.dialog.close();
    this.targetDai = null;
    this.dialogTitle = '';
    this.bType = '';
    this.templateValue = null;
    this.enumValues = [];
    this.valElement = null;
    this.sGroup = null;
    this.editedValue = null;
    this.requestUpdate();
  }

  private confirm(): void {
    if (!this.targetDai) {
      return;
    }

    const value = this.editedValue ?? this.getInstanceValue() ?? '';
    const edits: EditV2 = [];
    const newVal = this.buildValElement(value, this.sGroup ?? undefined);

    if (this.valElement) {
      edits.push({ node: this.valElement });
      edits.push({ parent: this.targetDai, node: newVal, reference: null });
    } else {
      const reference = this.findInsertReference();
      edits.push({ parent: this.targetDai, node: newVal, reference });
    }

    this.dispatchEvent(newEditEventV2(edits));
    this.close();
  }

  private editedValue: string | null = null;

  private buildValElement(value: string, sGroup?: number): Element {
    // Review-me: wouldn't the createElement of scl-lib be the right thing to be using everywhere? Where else are we "rolling our own"? Scan code base and add a "review-me comment" there too.
    // Response: we could use @openscd/scl-lib createElement for consistency, but we still need to set sGroup/text. If we standardize,
    // a small helper in src/foundation could wrap createElement + text + optional sGroup. Create dialog has a similar builder.
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

  private getInstanceValue(): string | null {
    if (this.valElement) {
      return this.valElement.textContent?.trim() ?? '';
    }

    if (!this.instanceElement) {
      return null;
    }

    if (this.sGroup) {
      const match = this.instanceElement.querySelector(
        `Val[sGroup="${this.sGroup}"]`,
      );
      if (match) {
        return match.textContent?.trim() ?? '';
      }
    }

    const val = this.instanceElement.querySelector('Val');
    return val?.textContent?.trim() ?? '';
  }

  private findInsertReference(): Element | null {
    if (!this.sGroup || !this.targetDai) {
      return null;
    }

    const vals = Array.from(this.targetDai.querySelectorAll('Val'));
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
    const value = this.editedValue ?? this.getInstanceValue() ?? '';

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
