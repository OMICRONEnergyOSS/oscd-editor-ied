import { expect, fixture } from '@open-wc/testing';
import { Commit, CommitOptions, EditV2 } from '@openscd/oscd-api';
import { XMLEditor } from '@openscd/oscd-editor';
import { html } from 'lit';
import Sinon from 'sinon';
import {
  findIconButtonByIconName,
  getFirstAndAssertBySelector,
} from '../../test-utils/queries.js';
import { parseDoc } from '../../test-utils/test-files.js';
import { getAncestors, nsdocStub } from '../../test-utils/test-harness.js';
import { ServerContainer } from './server-container.js';

customElements.define('server-container', ServerContainer);
type TestSetupProps = {
  docContents: string;
  elementSelector: string;
  instancePathSelectors: string[];
};

const docContents = `
    <SCL>
      <IED name="IED1">
        <AccessPoint name="AP1">
          <Server>
            <LDevice inst="LD1">
              <LN0 lnClass="LLN0" inst="" lnType="t1"/>
              <LN lnClass="PTOC" inst="1" lnType="t2"/>
              <LN lnClass="MMXU" inst="1" lnType="t3"/>
            </LDevice>
          </Server>
        </AccessPoint>
      </IED>
    </SCL>
  `;

const elementSelector = 'Server';
const instancePathSelectors = ['IED[name="IED1"]', 'AccessPoint[name="AP1"]'];

/*
 * Don't call this directly, instead call the testSetup function located in the top-level describe.
 * It will automatically delegate to this but also handle cleanup after each test.
 */
const createTestHarness = async ({
  docContents,
  elementSelector,
  instancePathSelectors: ancestorsSelectors = [],
}: TestSetupProps) => {
  const xmlEditor = new XMLEditor();
  const editSpy = Sinon.spy(xmlEditor, 'commit');

  const handleEditEvent = (event: Event) => {
    const editEvent = event as CustomEvent<{ edit: EditV2 }>;
    xmlEditor.commit(editEvent.detail.edit);
  };

  const doc = parseDoc(docContents);
  const element = getFirstAndAssertBySelector(doc, elementSelector);

  const ancestors = getAncestors(doc, ancestorsSelectors);

  const serverContainer = await fixture<ServerContainer>(html`
    <server-container
      .doc=${doc}
      .element=${element}
      .nsdoc=${nsdocStub}
      .ancestors=${ancestors}
    ></server-container>
  `);

  serverContainer.addEventListener('oscd-edit-v2', handleEditEvent);

  const dispose = async () => {
    serverContainer.removeEventListener('oscd-edit-v2', handleEditEvent);
    serverContainer.remove();
    editSpy.restore();
  };

  await serverContainer.updateComplete;
  return {
    doc,
    ancestors,
    serverContainer,
    editSpy,
    dispose,
  };
};

describe('server-container', () => {
  let cleanup: (() => Promise<void>) | undefined;
  let serverContainer: ServerContainer;
  let editSpy: Sinon.SinonSpy<
    [change: EditV2, (CommitOptions | undefined)?],
    Commit<EditV2>
  >;

  beforeEach(async () => {
    const setup = await createTestHarness({
      docContents,
      elementSelector,
      instancePathSelectors,
    });

    cleanup = setup.dispose;
    serverContainer = setup.serverContainer;
    editSpy = setup.editSpy;
  });

  afterEach(async () => {
    if (cleanup) {
      await cleanup();
    }
  });

  it('is expanded by default and shows all LDevices', async () => {
    serverContainer.selectedLNClasses = ['LLN0', 'PTOC', 'MMXU'];
    await serverContainer.updateComplete;

    const ldevices =
      serverContainer.shadowRoot?.querySelectorAll('ldevice-container');

    expect(ldevices?.length).to.equal(1);
  });

  it('opens the Add LDevice dialog when the add button is clicked', async () => {
    const oscdSclDialogs = serverContainer['oscdSclDialogs'];

    const mockLDevice = parseDoc(`
    <SCL>
      <LDevice inst="LD_NEW"/>
    </SCL>
  `).querySelector('LDevice')!;

    const createStub = Sinon.stub(oscdSclDialogs, 'create').resolves([
      {
        parent: serverContainer.element,
        node: mockLDevice,
        reference: null,
      } as EditV2,
    ]);
    const addButton = findIconButtonByIconName(serverContainer, 'playlist_add');
    expect(addButton?.tagName).to.equal('OSCD-ICON-BUTTON');
    addButton!.click();
    await serverContainer.updateComplete;

    expect(createStub.calledOnce).to.be.true;
    expect(editSpy.calledOnce).to.be.true;

    createStub.restore();
  });
});
