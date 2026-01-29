import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdFilledSelect } from '@omicronenergy/oscd-ui/select/OscdFilledSelect.js';
import { OscdSelectOption } from '@omicronenergy/oscd-ui/select/OscdSelectOption.js';
import { DaiValueDialog } from './dai-value-dialog.js';

if (!customElements.get('dai-value-dialog')) {
  customElements.define('dai-value-dialog', DaiValueDialog);
}

function getOscdDialog(element: HTMLElement): OscdDialog | null {
  return element.shadowRoot?.querySelector('oscd-dialog') ?? null;
}

describe('dai-value-dialog', () => {
  it('opens and renders template value', async () => {
    const dialog = await fixture<DaiValueDialog>(
      html`<dai-value-dialog></dai-value-dialog>`,
    );

    dialog.dialogTitle = 'Edit DAI';
    dialog.bType = 'Enum';
    dialog.enumValues = ['on', 'off'];
    dialog.values = ['on'];
    dialog.templateValue = 'off';
    dialog.multipleSettings = null;
    dialog.onConfirm = () => undefined;
    dialog.show();

    const oscdDialog = getOscdDialog(dialog);
    expect(oscdDialog).to.exist;
    await waitUntil(() => oscdDialog?.open === true);

    const templateField = dialog.shadowRoot?.querySelector(
      'oscd-filled-text-field[label="DA template value"]',
    ) as OscdFilledTextField | null;
    expect(templateField).to.exist;
    expect(templateField?.value).to.equal('off');
  });

  it('renders enum values and selected value', async () => {
    const dialog = await fixture<DaiValueDialog>(
      html`<dai-value-dialog></dai-value-dialog>`,
    );

    dialog.dialogTitle = 'Edit DAI';
    dialog.bType = 'Enum';
    dialog.enumValues = ['on', 'off'];
    dialog.values = ['off'];
    dialog.templateValue = null;
    dialog.multipleSettings = null;
    dialog.onConfirm = () => undefined;
    dialog.show();

    const oscdDialog = getOscdDialog(dialog);
    expect(oscdDialog).to.exist;
    await waitUntil(() => oscdDialog?.open === true);

    const select = dialog.shadowRoot?.querySelector(
      'oscd-filled-select',
    ) as OscdFilledSelect | null;
    expect(select).to.exist;
    expect(select?.value).to.equal('off');

    const options = Array.from(
      dialog.shadowRoot?.querySelectorAll('oscd-select-option') ?? [],
    ) as OscdSelectOption[];
    const optionValues = options.map(
      option => option.textContent?.trim() ?? '',
    );
    expect(optionValues).to.deep.equal(['on', 'off']);
  });

  it('renders multiple setting group fields', async () => {
    const dialog = await fixture<DaiValueDialog>(
      html`<dai-value-dialog></dai-value-dialog>`,
    );

    dialog.dialogTitle = 'Edit DAI';
    dialog.bType = 'Enum';
    dialog.enumValues = ['v1', 'v2'];
    dialog.values = ['v1', 'v2'];
    dialog.templateValue = null;
    dialog.multipleSettings = 2;
    dialog.onConfirm = () => undefined;
    dialog.show();

    const oscdDialog = getOscdDialog(dialog);
    expect(oscdDialog).to.exist;
    await waitUntil(() => oscdDialog?.open === true);

    const selects = Array.from(
      dialog.shadowRoot?.querySelectorAll('oscd-filled-select') ?? [],
    ) as OscdFilledSelect[];
    expect(selects.length).to.equal(2);
    expect(selects[0].getAttribute('label')).to.equal('Val for sGroup 1');
    expect(selects[1].getAttribute('label')).to.equal('Val for sGroup 2');
    expect(selects[0].value).to.equal('v1');
    expect(selects[1].value).to.equal('v2');
  });

  it('confirms updated values', async () => {
    let confirmed: string[] | null = null;
    const dialog = await fixture<DaiValueDialog>(
      html`<dai-value-dialog></dai-value-dialog>`,
    );

    dialog.dialogTitle = 'Edit DAI';
    dialog.bType = 'Enum';
    dialog.enumValues = ['on', 'off'];
    dialog.values = ['on'];
    dialog.templateValue = null;
    dialog.multipleSettings = null;
    dialog.onConfirm = values => {
      confirmed = values;
    };
    dialog.show();

    const oscdDialog = getOscdDialog(dialog);
    expect(oscdDialog).to.exist;
    await waitUntil(() => oscdDialog?.open === true);

    const select = dialog.shadowRoot?.querySelector(
      'oscd-filled-select',
    ) as OscdFilledSelect | null;
    expect(select).to.exist;
    select!.value = 'off';
    select!.dispatchEvent(new Event('change'));

    const saveButton = dialog.shadowRoot?.querySelector(
      'oscd-filled-button[slot="primaryAction"]',
    ) as HTMLElement | null;
    expect(saveButton).to.exist;
    saveButton!.click();

    expect(confirmed).to.deep.equal(['off']);
  });

  it('confirms timestamp values with normalized time', async () => {
    let confirmed: string[] | null = null;
    const dialog = await fixture<DaiValueDialog>(
      html`<dai-value-dialog></dai-value-dialog>`,
    );

    dialog.dialogTitle = 'Edit DAI';
    dialog.bType = 'Timestamp';
    dialog.enumValues = [];
    dialog.values = ['2020-01-01T00:00:00.000'];
    dialog.templateValue = null;
    dialog.multipleSettings = null;
    dialog.onConfirm = values => {
      confirmed = values;
    };
    dialog.show();

    const oscdDialog = getOscdDialog(dialog);
    expect(oscdDialog).to.exist;
    await waitUntil(() => oscdDialog?.open === true);

    const dateField = dialog.shadowRoot?.querySelector(
      'oscd-filled-text-field[type="date"]',
    ) as OscdFilledTextField | null;
    const timeField = dialog.shadowRoot?.querySelector(
      'oscd-filled-text-field[type="time"]',
    ) as OscdFilledTextField | null;
    expect(dateField).to.exist;
    expect(timeField).to.exist;

    dateField!.value = '2024-05-06';
    dateField!.dispatchEvent(new Event('input'));
    timeField!.value = '12:34:56';
    timeField!.dispatchEvent(new Event('input'));

    const saveButton = dialog.shadowRoot?.querySelector(
      'oscd-filled-button[slot="primaryAction"]',
    ) as HTMLElement | null;
    expect(saveButton).to.exist;
    saveButton!.click();

    expect(confirmed).to.deep.equal(['2024-05-06T12:34:56.000']);
  });
});
