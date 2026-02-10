import { expect, fixture } from '@open-wc/testing';
import { renderLogSettingsServices } from './service-log-settings.js';
import { html } from 'lit';
import { IedServicesAction } from './ied-services-action.js';
import { parseDoc, testDocs } from '../../../test-utils/test-files.js';
import { extractServicesData } from '../../../foundation/services.js';
import { renderClientServerServices } from './service-client-server.js';
import { renderReportConfigurationsServices } from './service-report-configurations.js';
import { renderGseControlServices } from './service-GSE-Control.js';
import { renderNetworkingServices } from './service-networking.js';
import { renderSampledValuesServices } from './service-sampled-values.js';

customElements.define('ied-services-action', IedServicesAction);

const testDoc = parseDoc(testDocs.withIED_instanciated);
const ied = testDoc.querySelector('IED')!;

describe('ied-services-action', () => {
  let iedServicesAction: IedServicesAction;

  beforeEach(async () => {
    iedServicesAction = await fixture<IedServicesAction>(
      html`<ied-services-action></ied-services-action>`,
    );
  });

  describe('with no services', () => {
    beforeEach(async () => {
      iedServicesAction.ied = parseDoc(testDocs.withIED).querySelector('IED')!;
      await iedServicesAction.updateComplete;
    });
    it('disables icon button', async () => {
      const button =
        iedServicesAction.shadowRoot!.querySelector('oscd-icon-button')!;
      expect(button.hasAttribute('disabled')).to.be.true;
    });
  });

  describe('with services', () => {
    beforeEach(async () => {
      iedServicesAction.ied = parseDoc(
        testDocs.withIED_instanciated,
      ).querySelector('IED')!;
      await iedServicesAction.updateComplete;
    });

    it('enables icon button', async () => {
      iedServicesAction.ied = parseDoc(
        testDocs.withIED_instanciated,
      ).querySelector('IED')!;
      await iedServicesAction.updateComplete;
      const button =
        iedServicesAction.shadowRoot!.querySelector('oscd-icon-button')!;
      expect(button.hasAttribute('disabled')).to.be.false;
    });

    it('resets activeIndex on show()', () => {
      iedServicesAction.activeIndex = 4;

      iedServicesAction.show();

      expect(iedServicesAction.activeIndex).to.equal(0);
    });
  });
});

describe('Page Renderers', () => {
  it('renders all Log Settings fields', async () => {
    const el = await fixture(html`
      <oscd-form .data=${extractServicesData(ied)}>
        ${renderLogSettingsServices()}
      </oscd-form>
    `);

    const fields = el.querySelectorAll('oscd-form-field');
    expect(fields.length).to.equal(12);
  });

  it('renders all Report Configurations fields', async () => {
    const el = await fixture(html`
      <oscd-form .data=${extractServicesData(ied)}>
        ${renderReportConfigurationsServices()}
      </oscd-form>
    `);

    const fields = el.querySelectorAll('oscd-form-field');
    expect(fields.length).to.equal(18);
  });

  it('renders all GSE Control fields', async () => {
    const el = await fixture(html`
      <oscd-form .data=${extractServicesData(ied)}>
        ${renderGseControlServices()}
      </oscd-form>
    `);

    const fields = el.querySelectorAll('oscd-form-field');
    expect(fields.length).to.equal(17);
  });

  it('renders all Networking fields', async () => {
    const el = await fixture(html`
      <oscd-form .data=${extractServicesData(ied)}>
        ${renderNetworkingServices()}
      </oscd-form>
    `);

    const fields = el.querySelectorAll('oscd-form-field');
    expect(fields.length).to.equal(17);
  });

  it('renders all Sampled Values fields', async () => {
    const el = await fixture(html`
      <oscd-form .data=${extractServicesData(ied)}>
        ${renderSampledValuesServices()}
      </oscd-form>
    `);

    const fields = el.querySelectorAll('oscd-form-field');
    expect(fields.length).to.equal(24);
  });

  it('renders all Client Server Services fields', async () => {
    const el = await fixture(html`
      <oscd-form .data=${extractServicesData(ied)}>
        ${renderClientServerServices()}
      </oscd-form>
    `);

    const fields = el.querySelectorAll('oscd-form-field');
    expect(fields.length).to.equal(16);
  });
});
