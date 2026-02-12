import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { LNContainer } from './ln-container.js';
import { parseDoc, testDocs } from '../../test-utils/test-files.js';
import {
  findIconButtonByIconName,
  getFirstAndAssertBySelector,
} from '../../test-utils/queries.js';
import { getAncestors, nsdocStub } from '../../test-utils/test-harness.js';
import { EVENTS } from '../../foundation/events.js';

customElements.define('ln-container', LNContainer);

const testSetup = async ({
  docContents,
  elementSelector,
  ancestorsSelectors,
}: {
  docContents: string;
  elementSelector: string;
  ancestorsSelectors: string[];
}) => {
  const doc = parseDoc(docContents);
  const element = getFirstAndAssertBySelector(doc, elementSelector);
  const ancestors = getAncestors(doc, ancestorsSelectors);

  const lnContainer = await fixture<LNContainer>(html`
    <ln-container
      .doc=${doc}
      .docVersion=${0}
      .element=${element}
      .nsdoc=${nsdocStub}
      .ancestors=${ancestors}
    ></ln-container>
  `);
  await lnContainer.updateComplete;

  return { lnContainer, doc, element, ancestors };
};

describe('ln-container', () => {
  describe('with LN element and DOs', () => {
    let testHarness: Awaited<ReturnType<typeof testSetup>>;

    beforeEach(async () => {
      testHarness = await testSetup({
        docContents: testDocs.withIED_instanciated,
        elementSelector: 'LN[lnClass="TCTR"][inst="1"]',
        ancestorsSelectors: [
          'IED',
          'AccessPoint',
          'Server',
          'LDevice[inst="LD1"]',
        ],
      });
    });

    it('renders a header label with nsdoc label and inst', async () => {
      const actionPane = testHarness.lnContainer.shadowRoot?.querySelector(
        'oscd-action-pane',
      ) as { label?: string } | null;
      expect(actionPane).to.exist;
      expect(actionPane?.label).to.contain('LN-label');
      expect(actionPane?.label).to.contain('1');
    });

    it('renders edit, delete, and toggle actions', async () => {
      const editButton = findIconButtonByIconName(
        testHarness.lnContainer,
        'edit',
      );
      const deleteButton = findIconButtonByIconName(
        testHarness.lnContainer,
        'delete',
      );
      const toggleButton =
        testHarness.lnContainer.shadowRoot?.querySelector('#toggleButton');
      expect(editButton).to.exist;
      expect(deleteButton).to.exist;
      expect(toggleButton).to.exist;
    });

    it('expands and renders DO containers on toggle', async () => {
      const toggleButton = testHarness.lnContainer.shadowRoot?.querySelector(
        '#toggleButton',
      ) as (HTMLElement & { selected?: boolean }) | null;
      expect(toggleButton).to.exist;
      expect(toggleButton?.selected).to.be.false;

      toggleButton!.click();
      await testHarness.lnContainer.updateComplete;
      expect(testHarness.lnContainer.expanded).to.be.true;

      const doContainers =
        testHarness.lnContainer.shadowRoot?.querySelectorAll('do-container') ??
        [];
      expect(doContainers.length).to.equal(4);
    });

    it('passes instance elements to DO containers when present', async () => {
      const toggleButton = testHarness.lnContainer.shadowRoot?.querySelector(
        '#toggleButton',
      ) as HTMLElement | null;
      toggleButton!.click();
      await testHarness.lnContainer.updateComplete;

      const doContainers = Array.from(
        testHarness.lnContainer.shadowRoot?.querySelectorAll('do-container') ??
          [],
      ) as Array<{
        element?: Element;
        instanceElement?: Element | null;
      }>;

      const artgContainer = doContainers.find(
        container => container.element?.getAttribute('name') === 'ARtg',
      );
      const hzrtgContainer = doContainers.find(
        container => container.element?.getAttribute('name') === 'HzRtg',
      );

      expect(artgContainer?.instanceElement).to.exist;
      expect(artgContainer?.instanceElement?.getAttribute('name')).to.equal(
        'ARtg',
      );
      expect(hzrtgContainer?.instanceElement).to.be.null;
    });

    it('dispatches an edit event when clicking edit', async () => {
      const editButton = findIconButtonByIconName(
        testHarness.lnContainer,
        'edit',
      );
      expect(editButton).to.exist;

      const editEventPromise = new Promise<CustomEvent>(resolve => {
        testHarness.lnContainer.addEventListener(
          EVENTS.EDIT_ELEMENT,
          event => resolve(event as CustomEvent),
          { once: true },
        );
      });

      editButton!.click();
      const editEvent = await editEventPromise;
      expect(editEvent.detail.element).to.equal(testHarness.element);
    });

    it('dispatches delete confirmation and edit-v2 on confirm', async () => {
      const deleteButton = findIconButtonByIconName(
        testHarness.lnContainer,
        'delete',
      );
      expect(deleteButton).to.exist;

      let confirmDetail: { onConfirm: () => void } | null = null;
      testHarness.lnContainer.addEventListener(
        EVENTS.CONFIRM_DELETE,
        event => {
          confirmDetail = (event as CustomEvent).detail;
        },
        { once: true },
      );

      let editEventCalled = false;
      testHarness.lnContainer.addEventListener(
        'oscd-edit-v2',
        () => {
          editEventCalled = true;
        },
        { once: true },
      );

      deleteButton!.click();
      expect(confirmDetail).to.exist;
      confirmDetail!.onConfirm();

      await waitUntil(() => editEventCalled, 'edit-v2 not dispatched');
    });
  });

  describe('with LN0 element', () => {
    let testHarness: Awaited<ReturnType<typeof testSetup>>;

    beforeEach(async () => {
      testHarness = await testSetup({
        docContents: testDocs.withIED_instanciated,
        elementSelector: 'LDevice[inst="LD1"] > LN0[lnClass="LLN0"]',
        ancestorsSelectors: [
          'IED',
          'AccessPoint',
          'Server',
          'LDevice[inst="LD1"]',
        ],
      });
    });

    it('renders edit and toggle actions, but no delete', async () => {
      const editButton = findIconButtonByIconName(
        testHarness.lnContainer,
        'edit',
      );
      const deleteButton = findIconButtonByIconName(
        testHarness.lnContainer,
        'delete',
      );
      const toggleButton =
        testHarness.lnContainer.shadowRoot?.querySelector('#toggleButton');
      expect(editButton).to.exist;
      expect(toggleButton).to.exist;
      expect(deleteButton).to.not.exist;
    });
  });

  describe('without DOs in LNodeType', () => {
    it('renders no action buttons', async () => {
      const doc = parseDoc(testDocs.withIED_instanciated);
      const element = getFirstAndAssertBySelector(
        doc,
        'LN[lnClass="TCTR"][inst="1"]',
      );
      element.setAttribute('lnType', 'MissingType');
      const ancestors = getAncestors(doc, [
        'IED',
        'AccessPoint',
        'Server',
        'LDevice[inst="LD1"]',
      ]);

      const lnContainer = await fixture<LNContainer>(html`
        <ln-container
          .doc=${doc}
          .docVersion=${0}
          .element=${element}
          .nsdoc=${nsdocStub}
          .ancestors=${ancestors}
        ></ln-container>
      `);
      await lnContainer.updateComplete;

      const actionButtons =
        lnContainer.shadowRoot?.querySelectorAll('oscd-icon-button') ?? [];
      expect(actionButtons.length).to.equal(0);
    });
  });
});
