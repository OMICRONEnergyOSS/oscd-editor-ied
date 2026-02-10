import { fixture, html } from '@open-wc/testing';
import { setViewport } from '@web/test-runner-commands';

// import { visualDiff } from '@web/test-runner-visual-regression';

const factor = window.process && process.env.CI ? 4 : 2;
function timeout(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms * factor);
  });
}
mocha.timeout(2000 * factor);
import { OscdEditorIED } from './oscd-editor-ied.js';
import { parseDoc, testDocs } from './test-utils/test-files.js';

customElements.define('oscd-editor-ied', OscdEditorIED);

describe('oscd-editor-ied', () => {
  let plugin: OscdEditorIED;

  beforeEach(async () => {
    const sclDoc = parseDoc(testDocs.withIED);
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
    await setViewport({ width: 1200, height: 800 });

    await plugin.updateComplete;
    await timeout(400);
    // await visualDiff(document.body, `oscd-editor-ied/#1 Dummy Test`);
  });
});
