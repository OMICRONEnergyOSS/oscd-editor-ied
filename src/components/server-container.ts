import { PropertyValues, TemplateResult, html } from 'lit';
import { property, state } from 'lit/decorators.js';

import { findLLN0LNodeType, createLLN0LNodeType } from '../foundation.js';

import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { BaseContainer } from './base-container.js';
import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdSclIcon } from '@omicronenergy/oscd-ui/scl-icon/OscdSclIcon.js';
import { LDeviceContainer } from './ldevice-container.js';
import { msg } from '@lit/localize';
import { Insert } from '@openscd/oscd-api';

/** [[`IED`]] plugin subeditor for editing `Server` element. */
export class ServerContainer extends ScopedElementsMixin(BaseContainer) {
  static scopedElements = {
    'oscd-icon': OscdIcon,
    'oscd-scl-icon': OscdSclIcon,
    'oscd-icon-button': OscdIconButton,
    'oscd-action-pane': OscdActionPane,
    'ldevice-container': LDeviceContainer,
    // 'add-access-point-dialog': AddAccessPointDialog,
  };

  @property()
  selectedLNClasses: string[] = [];

  private header(): TemplateResult {
    const desc = this.element.getAttribute('desc');
    return html`Server${desc ? ` \u2014 ${desc}` : ''}`;
  }

  protected updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);

    // When the LN Classes filter is updated, we also want to trigger rendering for the LN Elements.
    if (_changedProperties.has('selectedLNClasses')) {
      this.requestUpdate('lDeviceElements');
    }
  }

  @state()
  private get lDeviceElements(): Element[] {
    return Array.from(this.element.querySelectorAll(':scope > LDevice')).filter(
      element => {
        return (
          Array.from(element.querySelectorAll(':scope > LN,LN0')).filter(
            element => {
              const lnClass = element.getAttribute('lnClass') ?? '';
              return this.selectedLNClasses.includes(lnClass);
            },
          ).length > 0
        );
      },
    );
  }

  private handleAddLDevice(_data: unknown) {
    const inserts: Insert[] = [];
    const lln0Type = findLLN0LNodeType(this.doc);
    const lnTypeId = lln0Type?.getAttribute('id') || 'PlaceholderLLN0';

    if (!lln0Type) {
      const lnodeTypeInserts = createLLN0LNodeType(this.doc, lnTypeId);
      inserts.push(...lnodeTypeInserts);
    }
    // const lDevice = createElement(this.doc, 'LDevice', {
    //   inst: data.inst,
    // });

    // const ln0 = createElement(this.doc, 'LN0', {
    //   lnClass: 'LLN0',
    //   inst: '',
    //   lnType: lnTypeId,
    // });

    // lDevice.appendChild(ln0);
    // inserts.push({ parent: this.element, node: lDevice, reference: null });
    // this.dispatchEvent(newEditEventV2(inserts));
  }

  render(): TemplateResult {
    return html`<oscd-action-pane .label=${this.header()}>
      <oscd-scl-icon slot="icon">serverIcon</oscd-scl-icon>
      <abbr slot="action" title=${msg('Add AccessPoint')}>
        <oscd-icon-button @click=${() => console.log('Add LDevice clicked')}>
          <oscd-icon>playlist_add</oscd-icon>
        </oscd-icon-button>
      </abbr>
      ${this.lDeviceElements.map(
        server =>
          html`<ldevice-container
            .editCount=${this.editCount}
            .doc=${this.doc}
            .element=${server}
            .nsdoc=${this.nsdoc}
            .selectedLNClasses=${this.selectedLNClasses}
            .ancestors=${[...this.ancestors, this.element]}
          ></ldevice-container>`,
      )}
      <add-ldevice-dialog
        .server=${this.element}
        .onConfirm=${(data: unknown) => this.handleAddLDevice(data)}
      ></add-ldevice-dialog>
    </oscd-action-pane>`;
  }
}
