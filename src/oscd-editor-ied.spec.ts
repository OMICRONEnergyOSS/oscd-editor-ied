import { expect, fixture, html } from '@open-wc/testing';
import OscdEditorIED from './oscd-editor-ied.js';

customElements.define('oscd-editor-ied', OscdEditorIED);

const sclXmlDocString = `<?xml version="1.0" encoding="UTF-8"?><SCL version="2007" revision="B" xmlns="http://www.iec.ch/61850/2003/SCL" xmlns:ens1="http://example.org/somePreexistingExtensionNamespace">
  <Substation ens1:foo="a" name="A1" desc="test substation"></Substation>
</SCL>`;

describe('oscd-editor-ied', () => {
  let plugin: OscdEditorIED;

  beforeEach(async () => {
    const sclDoc = new DOMParser().parseFromString(
      sclXmlDocString,
      'application/xml',
    );
    plugin = await fixture(html`<oscd-editor-ied></oscd-editor-ied>`);
    plugin.docs = {
      'test.scd': sclDoc,
    };
    plugin.doc = sclDoc;
    plugin.docName = 'test.scd';
  });

  afterEach(() => {
    plugin.remove();
  });

  it('tests that the plugin works as expected', async () => {
    // Add your assertions here
    expect(plugin.docName).to.equal('test.scd');
  });
});
