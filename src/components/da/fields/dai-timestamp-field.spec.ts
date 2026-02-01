import { expect, fixture, html } from '@open-wc/testing';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { DaiTimestampField } from './dai-timestamp-field.js';

if (!customElements.get('dai-timestamp-field')) {
  customElements.define('dai-timestamp-field', DaiTimestampField);
}

describe('dai-timestamp-field', () => {
  it('parses value into date and time inputs', async () => {
    const field = await fixture<DaiTimestampField>(
      html`<dai-timestamp-field
        labelDate="Date"
        labelTime="Time"
        value="2024-05-06T12:34:56.789"
      ></dai-timestamp-field>`,
    );

    const inputs = Array.from(
      field.shadowRoot?.querySelectorAll('oscd-filled-text-field') ?? [],
    ) as OscdFilledTextField[];
    expect(inputs.length).to.equal(2);
    expect(inputs[0].value).to.equal('2024-05-06');
    expect(inputs[1].value).to.equal('12:34:56');
  });

  it('handles change when date is updated', async () => {
    const field = await fixture<DaiTimestampField>(
      html`<dai-timestamp-field
        labelDate="Date"
        labelTime="Time"
      ></dai-timestamp-field>`,
    );

    let lastDetail: unknown = null;
    field.addEventListener('change', event => {
      lastDetail = (event as CustomEvent).detail;
    });

    const inputs = Array.from(
      field.shadowRoot?.querySelectorAll('oscd-filled-text-field') ?? [],
    ) as OscdFilledTextField[];
    const dateInput = inputs[0];
    dateInput.value = '2024-05-06';
    dateInput.dispatchEvent(new Event('input', { bubbles: true }));

    expect(lastDetail).to.deep.equal({
      value: '2024-05-06T00:00:00.000',
      dateValue: '2024-05-06',
      timeValue: '',
      sGroup: null,
    });
  });

  it('handles change when time is updated after date', async () => {
    const field = await fixture<DaiTimestampField>(
      html`<dai-timestamp-field
        labelDate="Date"
        labelTime="Time"
      ></dai-timestamp-field>`,
    );

    let lastDetail: unknown = null;
    field.addEventListener('change', event => {
      lastDetail = (event as CustomEvent).detail;
    });

    const inputs = Array.from(
      field.shadowRoot?.querySelectorAll('oscd-filled-text-field') ?? [],
    ) as OscdFilledTextField[];
    const [dateInput, timeInput] = inputs;

    dateInput.value = '2024-05-06';
    dateInput.dispatchEvent(new Event('input', { bubbles: true }));

    timeInput.value = '12:34:56';
    timeInput.dispatchEvent(new Event('input', { bubbles: true }));

    expect(lastDetail).to.deep.equal({
      value: '2024-05-06T12:34:56.000',
      dateValue: '2024-05-06',
      timeValue: '12:34:56',
      sGroup: null,
    });
  });
});
