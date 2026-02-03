/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { DAContainer } from './da-container.js';
import { parseDoc, testDocs } from '../../test-utils/test-files.js';
import { getFirstAndAssertBySelector } from '../../test-utils/queries.js';
import { getAncestors, nsdocStub } from '../../test-utils/test-harness.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { DaiValueEditDialog } from './dai-value-edit-dialog.js';

customElements.define('da-container', DAContainer);

const testSetup = async ({
  docContents,
  doSelector,
  daSelector,
  ancestorsSelectors,
  daiSelector,
}: {
  docContents: string;
  doSelector: string;
  daSelector: string;
  ancestorsSelectors: string[];
  daiSelector?: string;
}) => {
  const doc = parseDoc(docContents);
  const doElement = getFirstAndAssertBySelector(doc, doSelector);
  const daElement = getFirstAndAssertBySelector(doc, daSelector);
  const daiElement = daiSelector
    ? getFirstAndAssertBySelector(doc, daiSelector)
    : null;

  const ancestors = [...getAncestors(doc, ancestorsSelectors), doElement];

  const daContainer = await fixture<DAContainer>(html`
    <da-container
      .doc=${doc}
      .docVersion=${0}
      .element=${daElement}
      .instanceElement=${daiElement}
      .nsdoc=${nsdocStub}
      .ancestors=${ancestors}
    ></da-container>
  `);
  await daContainer.updateComplete;
  return {
    daContainer,
    doc,
    doElement,
    daElement,
    ancestors,
    daiElement,
  };
};

describe('da-container', () => {
  describe('basic tests - container has correct contents', () => {
    describe('with no instance values', () => {
      let testHarness: Awaited<ReturnType<typeof testSetup>>;

      beforeEach(async () => {
        testHarness = await testSetup({
          docContents: testDocs.withIED_instanciated,
          doSelector: 'LNodeType[id="TCTR_Test"] > DO[name="Beh"]',
          daSelector: 'DOType[id="Beh_Test"] > DA[name="stVal"]',
          ancestorsSelectors: [
            'IED',
            'AccessPoint',
            'LDevice[inst="LD2"]',
            'LN',
          ],
        });
      });

      it('it renders no content when no instance values are set', async () => {
        const h4Contents = testHarness.daContainer.shadowRoot
          ?.querySelector('div > div > h4')
          ?.textContent?.trim();
        expect(h4Contents).to.equal('');
      });

      it('renders a create button for non-struct DA without instance values', async () => {
        const toggleButton =
          testHarness.daContainer.shadowRoot?.querySelector('#toggleButton');
        expect(toggleButton).to.not.exist;

        const addIcon = Array.from(
          testHarness.daContainer.shadowRoot?.querySelectorAll('oscd-icon') ??
            [],
        ).find(icon => icon.textContent?.trim() === 'add');
        expect(addIcon).to.exist;
      });
    });

    describe('with instance values', () => {
      let testHarness: Awaited<ReturnType<typeof testSetup>>;

      beforeEach(async () => {
        testHarness = await testSetup({
          docContents: testDocs.withIED_instanciated,
          doSelector: 'LNodeType[id="TCTR_Test"] > DO[name="Beh"]',
          daSelector: 'DOType[id="Beh_Test"] > DA[name="stVal"]',
          daiSelector:
            'LN[lnClass="TCTR"] > DOI[name="Beh"] > DAI[name="stVal"]',
          ancestorsSelectors: [
            'IED',
            'AccessPoint',
            'LDevice[inst="LD1"]',
            'LN[lnClass="TCTR"]',
          ],
        });
      });

      it('it renders the instance attributes when instance values set', async () => {
        const h4Contents = testHarness.daContainer.shadowRoot
          ?.querySelector('div > div > h4')
          ?.textContent?.trim();
        expect(h4Contents).to.equal(
          testHarness.daiElement?.querySelector('Val')?.textContent,
        );
      });

      it('renders an edit button when instance values exist', async () => {
        const editIcon = Array.from(
          testHarness.daContainer.shadowRoot?.querySelectorAll('oscd-icon') ??
            [],
        ).find(icon => icon.textContent?.trim() === 'edit');
        expect(editIcon).to.exist;
      });
    });

    describe('with bType="Struct"', () => {
      let testHarness: Awaited<ReturnType<typeof testSetup>>;

      beforeEach(async () => {
        testHarness = await testSetup({
          docContents: testDocs.withIED_instanciated,
          doSelector: 'LNodeType[id="TCTR_Test"] > DO[name="HzRtg"]',
          daSelector: 'DOType[id="HzRtg_Test"] > DA[name="setMag"]',
          ancestorsSelectors: [
            'IED',
            'AccessPoint',
            'LDevice[inst="LD2"]',
            'LN',
          ],
        });
      });

      it('renders an expandable toggle button (collapsed by default)', async () => {
        const toggleButton =
          testHarness.daContainer.shadowRoot?.querySelector<OscdIconButton>(
            '#toggleButton',
          );
        expect(toggleButton).to.exist;
        expect(toggleButton?.selected).to.be.false;
      });

      it('does not expand BDA containers by default', async () => {
        const bdaContainers =
          testHarness.daContainer.shadowRoot?.querySelectorAll(
            'da-container',
          ) ?? [];
        expect(bdaContainers.length).to.equal(0);
      });
    });

    describe('when numOfSGs is set in LN0 > SettingControl', () => {
      describe('when DA does NOT support multiple values', () => {
        let testHarness: Awaited<ReturnType<typeof testSetup>>;

        beforeEach(async () => {
          testHarness = await testSetup({
            docContents: testDocs.withIED_instanciated,
            doSelector: 'LNodeType[id="TCTR_Test"] > DO[name="Beh"]',
            daSelector: 'DOType[id="Beh_Test"] > DA[name="stVal"]',
            ancestorsSelectors: [
              'IED',
              'AccessPoint',
              'LDevice[inst="LD2"]',
              'LN',
            ],
          });
        });

        it('renders a single "add" button when no instance values are set', async () => {
          expect(
            testHarness.daContainer.shadowRoot?.querySelectorAll(
              '.da-value-row',
            ),
          ).to.have.length(1);
        });
        it('renders a single "add" button when instance values are set', async () => {
          expect(
            testHarness.daContainer.shadowRoot?.querySelector(
              '.da-value-row-action oscd-icon',
            )?.textContent,
          ).to.equal('add');
        });
      });
      describe('when DA supports multiple values', () => {
        describe('without instance values', () => {
          let testHarness: Awaited<ReturnType<typeof testSetup>>;

          beforeEach(async () => {
            testHarness = await testSetup({
              docContents: testDocs.withIED_instanciated,
              doSelector: 'LNodeType[id="TCTR_Test"] > DO[name="ARtg"]',
              daSelector: 'DOType[id="ARtg_Test"] > DA[name="setMag"]',
              ancestorsSelectors: [
                'IED',
                'AccessPoint',
                'LDevice[inst="LD2"]',
                'LN',
              ],
            });
          });

          it('renders a single "add" button when no instance values are set', async () => {
            expect(
              testHarness.daContainer.shadowRoot?.querySelectorAll(
                '.da-value-row',
              ),
            ).to.have.length(1);

            expect(
              testHarness.daContainer.shadowRoot?.querySelector(
                '.da-value-row-action oscd-icon',
              )?.textContent,
            ).to.equal('add');
          });
        });

        describe('with instance values', () => {
          let testHarness: Awaited<ReturnType<typeof testSetup>>;

          beforeEach(async () => {
            testHarness = await testSetup({
              docContents: testDocs.withIED_instanciated,
              doSelector: 'LNodeType[id="TCTR_Test"] > DO[name="ARtg"]',
              daSelector: 'DOType[id="ARtg_Test"] > DA[name="setVal"]',
              daiSelector:
                'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"] > DAI[name="setVal"]',
              ancestorsSelectors: [
                'IED',
                'AccessPoint',
                'LDevice[inst="LD1"]',
                'LN',
              ],
            });
          });

          it('renders the instance values when instance values are set', async () => {
            expect(
              testHarness.daContainer.shadowRoot?.querySelectorAll(
                '.da-value-row',
              ),
            ).to.have.length(5);

            expect(
              testHarness.daContainer.shadowRoot?.querySelector(
                '.da-value-row-action oscd-icon',
              )?.textContent,
            ).to.equal('edit');
          });
        });

        describe('with partial sGroups instance values', () => {
          let testHarness: Awaited<ReturnType<typeof testSetup>>;

          beforeEach(async () => {
            testHarness = await testSetup({
              docContents: testDocs.withIED_instanciated,
              doSelector: 'LNodeType[id="TCTR_Test"] > DO[name="ARtg"]',
              daSelector: 'DOType[id="ARtg_Test"] > DA[name="setMag"]',
              ancestorsSelectors: [
                'IED',
                'AccessPoint',
                'LDevice[inst="LD1"]',
                'LN',
              ],
              daiSelector:
                'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"] > DAI[name="setMag"]',
            });
          });

          it('renders the correct value action button (create/edit) when there are only Vals for some sGroups', async () => {
            const daValueRows =
              testHarness.daContainer.shadowRoot?.querySelectorAll(
                '.da-value-row',
              );
            expect(daValueRows).to.have.length(5);

            expect(
              daValueRows![0].querySelector('.da-value-row-action oscd-icon')
                ?.textContent,
            ).to.equal('edit');

            expect(
              daValueRows![1].querySelector('.da-value-row-action oscd-icon')
                ?.textContent,
            ).to.equal('add');

            expect(
              daValueRows![2].querySelector('.da-value-row-action oscd-icon')
                ?.textContent,
            ).to.equal('add');

            expect(
              daValueRows![3].querySelector('.da-value-row-action oscd-icon')
                ?.textContent,
            ).to.equal('add');

            expect(
              daValueRows![4].querySelector('.da-value-row-action oscd-icon')
                ?.textContent,
            ).to.equal('edit');
          });
        });
      });
    });

    it('disables create/edit controls for unsupported bType', async () => {
      const { daContainer } = await testSetup({
        docContents: testDocs.withIED_instanciated,
        doSelector: 'LNodeType[id="TCTR_Test"] > DO[name="Beh"]',
        daSelector: 'DOType[id="Beh_Test"] > DA[name="q"]',
        ancestorsSelectors: ['IED', 'AccessPoint', 'LDevice[inst="LD1"]', 'LN'],
      });

      const contentButton = daContainer.shadowRoot?.querySelector(
        'div > div> oscd-icon-button',
      );

      expect(contentButton).to.exist;
      expect(contentButton?.hasAttribute('disabled')).to.equal(true);
    });
  });

  describe('header actions', () => {
    let testHarness: Awaited<ReturnType<typeof testSetup>>;

    beforeEach(async () => {
      testHarness = await testSetup({
        docContents: testDocs.withIED_instanciated,
        doSelector: 'LNodeType[id="TCTR_Test"] > DO[name="ARtg"]',
        daSelector: 'DOType[id="ARtg_Test"] > DA[name="setVal"]',
        ancestorsSelectors: ['IED', 'AccessPoint', 'LDevice', 'LN'],
      });
    });

    it('opens the dialog on info button click', async () => {
      const infoDialog = testHarness.daContainer.daInfoDialog;
      expect(infoDialog).to.exist;
      const innerInfoDialog = infoDialog.shadowRoot?.querySelector(
        'info-dialog',
      ) as HTMLElement | null;
      expect(innerInfoDialog).to.exist;
      const oscdDialog = (innerInfoDialog as any)?.shadowRoot?.querySelector(
        'oscd-dialog',
      ) as { open?: boolean } | null;
      expect(oscdDialog).to.exist;

      const nsdocLabel = nsdocStub.getDataDescription(
        testHarness.daElement,
        testHarness.ancestors,
      ).label;
      const infoButton = testHarness.daContainer.shadowRoot?.querySelector(
        `oscd-icon-button[title="${nsdocLabel}"]`,
      ) as HTMLElement | null;
      expect(infoButton).to.exist;
      infoButton!.click();

      await waitUntil(() => oscdDialog?.open === true);
    });
  });

  describe('content interactions', () => {
    describe('with bType="Struct"', () => {
      let testHarness: Awaited<ReturnType<typeof testSetup>>;

      beforeEach(async () => {
        testHarness = await testSetup({
          docContents: testDocs.withIED_instanciated,
          doSelector: 'LNodeType[id="TCTR_Test"] > DO[name="HzRtg"]',
          daSelector: 'DOType[id="HzRtg_Test"] > DA[name="setMag"]',
          ancestorsSelectors: ['IED', 'AccessPoint', 'LDevice', 'LN'],
        });
      });

      it('renders BDA containers when expanded for Struct DA', async () => {
        const toggleButton = testHarness.daContainer.shadowRoot?.querySelector(
          '#toggleButton',
        ) as HTMLElement;
        expect(toggleButton).to.exist;

        toggleButton.click();
        await testHarness.daContainer.updateComplete;
        expect(testHarness.daContainer.expanded).to.be.true;

        const bdaContainers =
          testHarness.daContainer.shadowRoot?.querySelectorAll(
            'da-container',
          ) ?? [];
        expect(bdaContainers.length).to.equal(1);
      });
    });

    describe('create dialog', () => {
      let testHarness: Awaited<ReturnType<typeof testSetup>>;

      beforeEach(async () => {
        testHarness = await testSetup({
          docContents: testDocs.withIED,
          doSelector: 'LNodeType > DO',
          daSelector: 'DOType > DA[name="stVal"]',
          ancestorsSelectors: ['IED', 'AccessPoint', 'LDevice', 'LN0'],
        });
      });

      it('opens the create dialog when clicking the add button', async () => {
        const daiDialog = testHarness.daContainer
          .daiValueCreateDialog as HTMLElement;
        expect(daiDialog).to.exist;
        const oscdDialog = (daiDialog as any)?.shadowRoot?.querySelector(
          'oscd-dialog',
        ) as { open?: boolean } | null;
        expect(oscdDialog).to.exist;

        const addButton = Array.from(
          testHarness.daContainer.shadowRoot?.querySelectorAll(
            'oscd-icon-button',
          ) ?? [],
        ).find(
          button =>
            button.querySelector('oscd-icon')?.textContent?.trim() === 'add',
        ) as HTMLElement | undefined;
        expect(addButton).to.exist;
        addButton!.click();
        await waitUntil(() => oscdDialog?.open === true);
      });
    });

    describe('edit dialog', () => {
      let testHarness: Awaited<ReturnType<typeof testSetup>>;

      beforeEach(async () => {
        testHarness = await testSetup({
          docContents: testDocs.withIED_instanciated,
          doSelector: 'LNodeType[id="TCTR_Test"] > DO[name="ARtg"]',
          daSelector: 'DOType[id="ARtg_Test"] > DA[name="setVal"]',
          daiSelector:
            'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"] > DAI[name="setVal"]',
          ancestorsSelectors: ['IED', 'AccessPoint', 'LDevice', 'LN'],
        });
      });

      it('opens the edit dialog when clicking the edit button', async () => {
        const daiDialog = testHarness.daContainer
          .daiValueEditDialog as HTMLElement;
        expect(daiDialog).to.exist;
        const oscdDialog = (daiDialog as any)?.shadowRoot?.querySelector(
          'oscd-dialog',
        ) as { open?: boolean } | null;
        expect(oscdDialog).to.exist;

        const editButton = Array.from(
          testHarness.daContainer.shadowRoot?.querySelectorAll(
            'oscd-icon-button',
          ) ?? [],
        ).find(
          button =>
            button.querySelector('oscd-icon')?.textContent?.trim() === 'edit',
        ) as HTMLElement | undefined;
        expect(editButton).to.exist;
        editButton!.click();
        await waitUntil(() => oscdDialog?.open === true);
      });
    });

    it('renders add icons for missing sGroups BUT opens edit dialog for them', async () => {
      const { daContainer } = await testSetup({
        docContents: testDocs.withIED_instanciated,
        doSelector: 'LNodeType[id="TCTR_Test"] > DO[name="ARtg"]',
        daSelector: 'DOType[id="ARtg_Test"] > DA[name="setMag"]',
        ancestorsSelectors: ['IED', 'AccessPoint', 'LDevice[inst="LD1"]', 'LN'],
        daiSelector:
          'LN[lnClass="TCTR"][inst="1"] > DOI[name="ARtg"] > DAI[name="setMag"]',
      });

      const addButtons = Array.from(
        daContainer.shadowRoot?.querySelectorAll('oscd-icon-button') ?? [],
      ).filter(
        button =>
          button.querySelector('oscd-icon')?.textContent?.trim() === 'add',
      );
      expect(addButtons.length).to.equal(3);

      const daiValueEditDialog =
        daContainer.daiValueEditDialog as DaiValueEditDialog;
      expect(daiValueEditDialog).to.exist;
      const oscdDialog =
        daiValueEditDialog?.shadowRoot?.querySelector<OscdDialog>(
          'oscd-dialog',
        );
      expect(oscdDialog).to.exist;

      addButtons[0].click();
      await waitUntil(
        () => oscdDialog?.open === true,
        "Edit dialog didn't open",
      );
    });
  });
});
