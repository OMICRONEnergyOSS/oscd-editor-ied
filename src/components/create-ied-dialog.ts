import { LitElement, TemplateResult, html, css } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { msg } from '@lit/localize';

import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { createVirtualIED } from '../foundation/virtual-ied.js';
import { newEditEventV2 } from '@openscd/oscd-api/utils.js';
import { newIedCreatedEvent } from '../foundation/events.js';
import { OscdFilledButton } from '@omicronenergy/oscd-ui/button/OscdFilledButton.js';

/** A dialog component for creating virtual IEDs */
export class CreateIedDialog extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-dialog': OscdDialog,
    'oscd-filled-textfield': OscdFilledTextField,
    'oscd-outlined-button': OscdOutlinedButton,
    'oscd-filled-button': OscdFilledButton,
  };

  @property()
  doc!: XMLDocument;

  @property({ type: Function })
  onConfirm!: (iedName: string) => void;

  @query('oscd-dialog') dialog!: OscdDialog;

  @state()
  private newIedName = '';

  private isIedNameValid(name: string): boolean {
    const trimmedName = name.trim();
    return (
      trimmedName.length > 0 &&
      !trimmedName.includes(' ') &&
      this.isIedNameUnique(trimmedName)
    );
  }

  private getIedNameError(name: string): string {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return '';
    }
    if (trimmedName.includes(' ')) {
      return msg('IED name cannot contain spaces');
    }
    if (!this.isIedNameUnique(trimmedName)) {
      return msg('IED name already exists');
    }
    return '';
  }

  private isIedNameUnique(name: string): boolean {
    const existingNames = Array.from(this.doc.querySelectorAll('IED'))
      .map(ied => ied.getAttribute('name'))
      .filter(n => n !== null) as string[];

    return !existingNames.includes(name);
  }

  public show(): void {
    this.newIedName = '';
    this.dialog.show();
  }

  private close(): void {
    this.dialog.close();
    this.newIedName = '';
  }

  private handleCreate(): void {
    if (this.isIedNameValid(this.newIedName)) {
      const edits = createVirtualIED(this.newIedName, this.doc);
      this.dispatchEvent(newEditEventV2(edits));
      this.dispatchEvent(newIedCreatedEvent({ iedName: this.newIedName }));
      this.close();
    }
  }

  render(): TemplateResult {
    const isNameValid = this.isIedNameValid(this.newIedName);
    const errorMessage = this.getIedNameError(this.newIedName);

    return html`
      <oscd-dialog @closed=${this.close}>
        <div slot="headline">${msg('Create Virtual IED')}</div>
        <div slot="content" class="dialog-content">
          <oscd-filled-textfield
            label=${msg('IED name')}
            .value=${this.newIedName}
            .error=${!!errorMessage}
            .errorText=${errorMessage}
            .validityTransform=${(value: string) => {
              const error = this.getIedNameError(value);
              return {
                valid: error === '',
                customError: error !== '',
              };
            }}
            required
            autoValidate
            helper=${msg('IED name')}
            dialogInitialFocus
            style="width: 100%; margin-bottom: 16px;"
            @input=${(e: Event) => {
              this.newIedName = (e.target as HTMLInputElement).value;
            }}
          ></oscd-filled-textfield>
        </div>
        <div slot="actions">
          <oscd-outlined-button slot="secondaryAction" @click=${this.close}>
            ${msg('Cancel')}
          </oscd-outlined-button>
          <oscd-filled-button
            slot="primaryAction"
            @click=${this.handleCreate}
            ?disabled=${!isNameValid}
          >
            ${msg('Create')}
          </oscd-filled-button>
        </div>
      </oscd-dialog>
    `;
  }

  static styles = css`
    oscd-dialog {
    }
    .dialog-content {
      margin-top: 16px;
    }
  `;
}
