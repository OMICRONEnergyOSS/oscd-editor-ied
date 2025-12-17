import {
  LitElement,
  PropertyValues,
  TemplateResult,
  html,
  css,
  nothing,
} from 'lit';
import { property, state } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { OscdListItem } from '@omicronenergy/oscd-ui/list/OscdListItem.js';
import { OscdOutlinedButton } from '@omicronenergy/oscd-ui/button/OscdOutlinedButton.js';
import {
  FilterButtonDialogCloseEvent,
  OscdFilterButton,
} from '@omicronenergy/oscd-ui/filter-button/OscdFilterButton.js';
import { OscdSclIcon } from '@omicronenergy/oscd-ui/scl-icon/OscdSclIcon.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';

import {
  findLLN0LNodeType,
  createLLN0LNodeType,
  createIEDStructure,
  FullElementPathEvent,
} from './foundation.js';

import { newEditEventV2 } from '@openscd/oscd-api/utils.js';
import { Insert } from '@openscd/oscd-api';
import { initializeNsdoc, Nsdoc } from './foundation/nsdoc.js';
import { OpenscdApi } from './foundation/types.js';
import { SelectItem } from '@omicronenergy/oscd-ui/selection-list/OscdSelectionList.js';
import { IedContainer } from './components/ied-container.js';
import { ElementPath } from './components/element-path.js';
import { msg } from '@lit/localize';
import { compareNames } from '@omicronenergy/oscd-edit-dialog';

type SelectedItemsChangedEvent = CustomEvent<{ selectedItems: string[] }>;

function getIEDSelectItem(element: Element, selected: boolean): SelectItem {
  const name = element.getAttribute('name');
  const descr = element.getAttribute('desc');
  const type = element.getAttribute('type');
  const manufacturer = element.getAttribute('manufacturer');

  return {
    headline: `${name} ${descr ? descr : ''}`,
    supportingText: `${type} ${type && manufacturer ? '&mdash;' : ''}
                ${manufacturer}`,
    selected,
    attachedElement: element,
  };
}

function getLnClassSelectItem(
  lnClass: Element,
  selectedLNClasses: string[],
  nsdoc: Nsdoc,
): SelectItem {
  const lnClassName = lnClass.getAttribute('lnClass');

  return {
    headline: nsdoc.getDataDescription(lnClass).label,
    selected: !!lnClassName && selectedLNClasses.includes(lnClassName),
    attachedElement: lnClass,
  };
}

/** An editor [[`plugin`]] for editing the `IED` section. */
export default class IedPlugin extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'oscd-outlined-button': OscdOutlinedButton,
    'oscd-filter-button': OscdFilterButton,
    'oscd-list-item': OscdListItem,
    'oscd-scl-icon': OscdSclIcon,
    'oscd-icon': OscdIcon,
    'element-path': ElementPath,
    'ied-container': IedContainer,
  };

  /** The document being edited as provided to plugins by [[`OpenSCD`]]. */
  @property({ type: Object })
  doc!: XMLDocument;

  @property({ type: Object })
  docs!: Record<string, XMLDocument>;

  @property({ type: String })
  docName!: string;

  @property({ type: Number })
  editCount = -1;

  /** All the nsdoc files that are being uploaded via the settings. */
  @property({ type: Object })
  nsdoc: Nsdoc = initializeNsdoc();

  @property({ type: Object })
  oscdApi?: OpenscdApi | null = null;

  @state()
  selectedIEDs: Element[] = [];

  @state()
  selectedLNClasses: string[] = [];

  @state()
  iedMap: { [key: string]: Element } = {};

  @state()
  selectedElementPath: string[] = [];

  @state()
  private get iedList(): Element[] {
    const ieds = this.doc
      ? Array.from(this.doc.querySelectorAll(':root > IED')).sort((a, b) =>
          compareNames(a, b),
        )
      : [];
    ieds.forEach(ied => {
      this.iedMap[ied.getAttribute('name') || ''] = ied;
    });
    return ieds;
  }

  @state()
  private get lnClassList(): Element[] {
    const currentIed = this.selectedIed;
    const uniqueLNClassList: string[] = [];
    if (currentIed) {
      return Array.from(currentIed.querySelectorAll('LN0, LN'))
        .filter(element => element.hasAttribute('lnClass'))
        .filter(element => {
          const lnClass = element.getAttribute('lnClass') ?? '';
          if (uniqueLNClassList.includes(lnClass)) {
            return false;
          }
          uniqueLNClassList.push(lnClass);
          return true;
        })
        .sort((a, b) => {
          const aLnClass = a.getAttribute('lnClass') ?? '';
          const bLnClass = b.getAttribute('lnClass') ?? '';

          return aLnClass.localeCompare(bLnClass);
        });
      // .map(element => {
      //   const lnClass = element.getAttribute('lnClass');
      //   const label = this.nsdoc.getDataDescription(element).label;
      //   return [lnClass, label];
      // }) as string[][];
    }
    return [];
  }

  @state()
  private get selectedIed(): Element | undefined {
    // When there is no IED selected, or the selected IED has no parent (IED has been removed)
    // select the first IED from the List.
    if (this.selectedIEDs.length >= 1) {
      return this.selectedIEDs[0];
    }
    return undefined;
  }

  lNClassListOpenedOnce = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.loadPluginState();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.storePluginState();
  }

  private createVirtualIED(iedName: string): void {
    const inserts: Insert[] = [];

    const existingLLN0 = findLLN0LNodeType(this.doc);
    const lnTypeId = existingLLN0?.getAttribute('id') || 'PlaceholderLLN0';

    const ied = createIEDStructure(this.doc, iedName, lnTypeId);

    const dataTypeTemplates = this.doc.querySelector('DataTypeTemplates');
    inserts.push({
      parent: this.doc.querySelector('SCL')!,
      node: ied,
      reference: dataTypeTemplates,
    });

    if (!existingLLN0) {
      const lnodeTypeInserts = createLLN0LNodeType(this.doc, lnTypeId);
      inserts.push(...lnodeTypeInserts);
    }

    this.dispatchEvent(newEditEventV2(inserts));

    this.selectedIEDs = [ied];
    this.selectedLNClasses = [];
    this.requestUpdate('selectedIed');
  }

  protected updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);

    // When the document is updated, we reset the selected IED if it no longer exists
    const isDocumentUpdated =
      _changedProperties.has('doc') ||
      _changedProperties.has('editCount') ||
      _changedProperties.has('nsdoc');

    if (isDocumentUpdated) {
      // if the IED exists, retain selection
      const iedExists = this.doc?.querySelector(
        `IED[name="${this.selectedIEDs[0]}"]`,
      );

      if (iedExists) {
        return;
      }

      this.selectedIEDs = [];
      this.selectedLNClasses = [];
      this.lNClassListOpenedOnce = false;

      const iedList = this.iedList;
      if (iedList.length > 0) {
        this.selectedIEDs = [iedList[0]];
      }
    }
  }

  private loadPluginState(): void {
    const stateApi = this.oscdApi?.pluginState;
    const iedNames: string[] =
      (stateApi?.getState()?.selectedIEDs as string[]) ?? [];

    const iedElements = iedNames
      .map(iedName => this.iedMap[iedName])
      .filter(ied => !!ied);

    // We want to always fire this - even for an empty selection,
    // because if the file has changed and the selection is no longer valid,
    // we don't want invalid elements appearing to be selected.
    this.onSelectionChange(iedElements);
  }

  private storePluginState(): void {
    const stateApi = this.oscdApi?.pluginState;

    if (stateApi) {
      stateApi.setState({ selectedIEDs: this.selectedIEDs });
    }
  }

  private calcSelectedLNClasses(): string[] {
    const somethingSelected = this.selectedLNClasses.length > 0;
    const lnClasses = this.lnClassList.map(
      lnClass => lnClass.getAttribute('lnClass')!,
    );

    let selectedLNClasses = lnClasses;

    if (somethingSelected) {
      selectedLNClasses = lnClasses.filter(lnClass =>
        this.selectedLNClasses.includes(lnClass),
      );
    }

    return selectedLNClasses;
  }

  private onSelectionChange(selectedIeds: Element[]): void {
    const equalArrays = <T>(first: T[], second: T[]): boolean => {
      return (
        first.length === second.length &&
        first.every((val, index) => val === second[index])
      );
    };

    const selectionChanged = !equalArrays(this.selectedIEDs, selectedIeds);

    if (!selectionChanged) {
      return;
    }

    this.lNClassListOpenedOnce = false;
    this.selectedIEDs = selectedIeds;
    this.selectedLNClasses = [];
    this.requestUpdate('selectedIed');
  }

  private renderHeader(): TemplateResult {
    return html`<div class="header">
      <h1>${msg('filters')}:</h1>
      <oscd-filter-button
        id="iedFilter"
        .items=${this.iedList.map(ied =>
          getIEDSelectItem(ied, this.selectedIEDs.includes(ied)),
        )}
        .header=${msg('Select IED')}
        @filter-button-dialog-close=${(e: FilterButtonDialogCloseEvent) =>
          this.onSelectionChange(e.detail.selectedElements)}
      >
        <oscd-icon class="ied-icon" slot="icon">developer_board</oscd-icon>
      </oscd-filter-button>

      <oscd-filter-button
        id="lnClassesFilter"
        multiselect
        .header="${msg('Logical Node Filter')}"
        .items=${this.lnClassList.map(lnClass =>
          getLnClassSelectItem(lnClass, this.selectedLNClasses, this.nsdoc),
        )}
        @selected-items-changed="${(e: SelectedItemsChangedEvent) => {
          this.selectedLNClasses = e.detail.selectedItems;
          this.requestUpdate('selectedIed');
        }}"
      >
        <oscd-scl-icon slot="icon">lNIcon</oscd-scl-icon>
      </oscd-filter-button>

      <element-path
        class="elementPath"
        .paths=${this.selectedElementPath}
      ></element-path>

      <oscd-outlined-button
        class="add-ied-button"
        @click=${() => console.log('Create IED clicked')}
      >
        <oscd-icon slot="icon">add</oscd-icon>
        ${msg('Create Virtual IED')}
      </oscd-outlined-button>
    </div>`;
  }

  private renderSelectedIED(): TemplateResult {
    if (this.iedList.length === 0) {
      return html`<h1>
        <span style="color: var(--base1)">${msg('No IED')}</span>
      </h1>`;
    }
    return html`<section>
      ${this.selectedIed
        ? html`<ied-container
            @full-element-path=${(event: FullElementPathEvent) => {
              this.selectedElementPath = event.detail.elementNames;
            }}
            .editCount=${this.editCount}
            .doc=${this.doc}
            .element=${this.selectedIed}
            .selectedLNClasses=${this.calcSelectedLNClasses()}
            .nsdoc=${this.nsdoc}
          ></ied-container>`
        : nothing}
    </section>`;
  }

  render(): TemplateResult {
    return html`<div>
      ${this.renderHeader()} ${this.renderSelectedIED()}
      <create-ied-dialog
        .doc=${this.doc}
        .onConfirm=${(iedName: string) => this.createVirtualIED(iedName)}
      ></create-ied-dialog>
    </div>`;
  }

  static styles = css`
    :host {
      position: relative;
    }

    .header,
    section {
      padding-inline: 12px;
    }
    section {
      padding-block: 8px 16px;
    }

    .header {
      display: flex;
      gap: 8px;
      align-items: center;
      max-width: calc(100% - 24px);
    }

    h1 {
      color: var(--md-theme-on-surface);
      font-family: var(--oscd-text-font, 'Roboto', sans-serif);
      font-weight: 300;
      margin: 0px;
      line-height: 48px;
    }

    .elementPath {
      margin-left: auto;
      padding-right: 12px;
      min-width: 0;
    }

    oscd-action-pane {
      --oscd-action-pane-theme-on-primary: var(--oscd-base2);
    }
  `;
}
