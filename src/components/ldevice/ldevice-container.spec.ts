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
import { LDeviceContainer } from './ldevice-container.js';
import OscdSclDialogs from '@omicronenergy/oscd-scl-dialogs/OscdSclDialogs.js';
import { EVENTS } from '../../foundation/events.js';

customElements.define('ldevice-container', LDeviceContainer);

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

const elementSelector = 'LDevice[inst="LD1"]';
const instancePathSelectors = [
  'IED[name="IED1"]',
  'AccessPoint[name="AP1"]',
  'Server',
];

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

  const ldeviceContainer = await fixture<LDeviceContainer>(html`
    <ldevice-container
      .doc=${doc}
      .element=${element}
      .nsdoc=${nsdocStub}
      .ancestors=${ancestors}
    ></ldevice-container>
  `);

  ldeviceContainer.addEventListener('oscd-edit-v2', handleEditEvent);

  const dispose = async () => {
    ldeviceContainer.removeEventListener('oscd-edit-v2', handleEditEvent);
    ldeviceContainer.remove();
    editSpy.restore();
  };

  await ldeviceContainer.updateComplete;
  return {
    doc,
    ancestors,
    ldeviceContainer,
    editSpy,
    dispose,
  };
};

describe('ldevice-container', () => {
  let cleanup: (() => Promise<void>) | undefined;
  let ldeviceContainer: LDeviceContainer;
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
    ldeviceContainer = setup.ldeviceContainer;
    editSpy = setup.editSpy;
  });

  afterEach(async () => {
    if (cleanup) {
      await cleanup();
    }
  });

  it('no lnodes are shown when the device is collapsed', async () => {
    ldeviceContainer.selectedLNClasses = ['LLN0', 'PTOC', 'MMXU'];
    ldeviceContainer.expanded = false;
    await ldeviceContainer.updateComplete;

    const lnContainers =
      ldeviceContainer.shadowRoot?.querySelectorAll('ln-container');

    expect(lnContainers?.length).to.equal(0);
  });

  it('opens the oscdSclDialogs.create to add a new lnode', async () => {
    const dialogs = ldeviceContainer.shadowRoot?.querySelector(
      'oscd-scl-dialogs',
    ) as OscdSclDialogs;

    const fakeEdit: EditV2[] = [{ node: document.createElement('LN') }];

    const createStub = Sinon.stub(dialogs, 'create').resolves(fakeEdit);

    const addButton = Array.from(
      ldeviceContainer.shadowRoot!.querySelectorAll('oscd-icon-button'),
    ).find(btn => btn.textContent?.includes('playlist_add')) as HTMLElement;

    addButton.click();
    await ldeviceContainer.updateComplete;

    expect(createStub.calledOnce).to.be.true;
    expect(editSpy.calledOnce).to.be.true;

    createStub.restore();
  });

  it('it renders all lnodes when expanded', async () => {
    ldeviceContainer.selectedLNClasses = ['LLN0', 'PTOC', 'MMXU'];
    ldeviceContainer.expanded = true;

    await ldeviceContainer.updateComplete;

    const lnContainers =
      ldeviceContainer.shadowRoot?.querySelectorAll('ln-container');

    expect(lnContainers?.length).to.equal(3);
  });

  it('it deletes this LDevice if the user confirms the delete', async () => {
    let confirmEvent: CustomEvent | undefined;

    ldeviceContainer.addEventListener(EVENTS.CONFIRM_DELETE, (e: Event) => {
      confirmEvent = e as CustomEvent;
    });

    const deleteButton = findIconButtonByIconName(ldeviceContainer, 'delete');

    expect(deleteButton?.tagName).to.equal('OSCD-ICON-BUTTON');

    deleteButton!.click();
    await ldeviceContainer.updateComplete;

    expect(confirmEvent).to.exist;

    // simulate user confirmation
    confirmEvent!.detail.onConfirm();

    expect(editSpy.calledOnce).to.be.true;
  });
});
