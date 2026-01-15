import { TemplateResult, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';

import { findLLN0LNodeType, createLLN0LNodeType } from '../../foundation.js';

import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { BaseContainer } from '../base-container.js';
import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdSclIcon } from '@omicronenergy/oscd-ui/scl-icon/OscdSclIcon.js';
import { LDeviceContainer } from '../ldevice/ldevice-container.js';
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
    const name = this.element.tagName;
    const desc = this.element.getAttribute('desc');
    const ref =
      name === 'ServerAt' ? ` (${this.element.getAttribute('apName')})` : '';

    return html`${name}${ref}${desc ? ` \u2014 ${desc}` : ''}`;
  }

  private getLDeviceElements(): Element[] {
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

  render() {
    return html`<oscd-action-pane .label=${this.header()}>
      <oscd-scl-icon slot="icon">serverIcon</oscd-scl-icon>
      ${this.element.tagName === 'Server'
        ? html`<abbr slot="action" title=${msg('Add LDevice')}>
            <oscd-icon-button
              @click=${() => console.log('Add LDevice clicked')}
            >
              <oscd-icon>playlist_add</oscd-icon>
            </oscd-icon-button>
          </abbr>`
        : nothing}
      ${this.getLDeviceElements().map(
        server =>
          html`<ldevice-container
            .docVersion=${this.docVersion}
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
