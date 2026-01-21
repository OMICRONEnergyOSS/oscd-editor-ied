import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement, TemplateResult, html, css, nothing } from 'lit';
import { query, state } from 'lit/decorators.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';

export type DaInfoData = {
  nsdocDescription: string;
  daName: string;
  daiDescription: string;
  daFc: string;
  daBType: string;
  daValue: string;
  doName: string;
  doCdc: string;
  lnPrefix: string;
  lnClassLabel: string;
  lnInst: string;
  lDevice: string;
  accessPoint: string;
  ied: string;
};

function renderField(label: string, value: string): TemplateResult {
  return html`
    <oscd-filled-text-field
      label=${label}
      .value=${value}
      disabled
    ></oscd-filled-text-field>
  `;
}

/** Read-only info dialog for a DA/DAI */
export class DaInfoDialog extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-dialog': OscdDialog,
    'oscd-outlined-button': OscdOutlinedButton,
    'oscd-filled-text-field': OscdFilledTextField,
  };

  @state() private data: DaInfoData | null = null;

  @query('oscd-dialog') private dialog!: OscdDialog;

  public show(data: DaInfoData): void {
    this.data = data;
    this.dialog.show();
  }

  private close(): void {
    this.dialog.close();
    this.data = null;
  }

  render(): TemplateResult {
    const data = this.data;
    return html`
      <oscd-dialog @closed=${this.close}>
        <div slot="headline">Show DA Info</div>
        <div slot="content" class="dialog-content">
          ${data
            ? html`
                <oscd-filled-text-field
                  label="NSDoc description"
                  .value=${data.nsdocDescription}
                  type="textarea"
                  rows="3"
                  disabled
                ></oscd-filled-text-field>
                ${renderField('Data attribute name', data.daName)}
                ${renderField(
                  'Data attribute description',
                  data.daiDescription,
                )}
                ${renderField(
                  'Data attribute functional constraint',
                  data.daFc,
                )}
                ${renderField('Data attribute type', data.daBType)}
                ${renderField('Data attribute value', data.daValue)}
                <div class="divider"></div>
                ${renderField('Data object name', data.doName)}
                ${renderField('Data object common data class', data.doCdc)}
                <div class="divider"></div>
                ${renderField('Logical node prefix', data.lnPrefix)}
                ${renderField('Logical Node Class', data.lnClassLabel)}
                ${renderField('Logical node inst', data.lnInst)}
                <div class="divider"></div>
                ${renderField('Logical device', data.lDevice)}
                ${renderField('Access point', data.accessPoint)}
                ${renderField('IED', data.ied)}
              `
            : nothing}
        </div>
        <div slot="actions">
          <oscd-outlined-button slot="primaryAction" @click=${this.close}
            >Close</oscd-outlined-button
          >
        </div>
      </oscd-dialog>
    `;
  }

  static styles = css`
    [slot='content'] {
      width: 360px;
      max-width: 100vw;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .divider {
      height: 1px;
      background: var(--oscd-base2);
      margin: 4px 0;
    }
  `;
}
