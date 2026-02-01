import { expect, fixture, html } from '@open-wc/testing';
import { OscdFilledSelect } from '@omicronenergy/oscd-ui/select/OscdFilledSelect.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { DaiValueField } from './dai-value-field.js';

if (!customElements.get('dai-value-field')) {
  customElements.define('dai-value-field', DaiValueField);
}

describe('dai-value-field', () => {
  it('renders boolean select and emits change', async () => {
    const field = await fixture<DaiValueField>(
      html`<dai-value-field
        bType="BOOLEAN"
        label="Bool"
        value="true"
      ></dai-value-field>`,
    );

    const select = field.shadowRoot?.querySelector(
      'oscd-filled-select',
    ) as OscdFilledSelect | null;
    expect(select).to.exist;

    let lastDetail: unknown = null;
    field.addEventListener('change', event => {
      lastDetail = (event as CustomEvent).detail;
    });

    select!.value = 'false';
    select!.dispatchEvent(new Event('change', { bubbles: true }));

    expect(lastDetail).to.deep.equal({ value: 'false', sGroup: null });
  });

  it('renders numeric input with step', async () => {
    const field = await fixture<DaiValueField>(
      html`<dai-value-field
        bType="FLOAT32"
        label="Float"
        value="1.5"
      ></dai-value-field>`,
    );

    const input = field.shadowRoot?.querySelector(
      'oscd-filled-text-field',
    ) as OscdFilledTextField | null;
    expect(input).to.exist;
    expect(input?.type).to.equal('number');
    expect(input?.step).to.equal('0.1');
  });
});
