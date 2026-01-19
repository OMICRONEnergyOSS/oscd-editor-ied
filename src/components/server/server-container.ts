import { TemplateResult, html, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';

import {
  findLLN0LNodeType,
  createLLN0LNodeType,
  findInsertedElement,
} from '../../foundation.js';

import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { BaseContainer } from '../base-container.js';
import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdSclIcon } from '@omicronenergy/oscd-ui/scl-icon/OscdSclIcon.js';
import { LDeviceContainer } from '../ldevice/ldevice-container.js';
import { msg } from '@lit/localize';
import { EditV2 } from '@openscd/oscd-api';
import { createElement } from '@openscd/scl-lib/dist/foundation/utils.js';
import { newEditEventV2 } from '@openscd/oscd-api/utils.js';
import OscdSclDialogs from '@omicronenergy/oscd-scl-dialogs/OscdSclDialogs.js';

/** [[`IED`]] plugin subeditor for editing `Server` element. */
export class ServerContainer extends ScopedElementsMixin(BaseContainer) {
  static scopedElements = {
    'oscd-icon': OscdIcon,
    'oscd-scl-icon': OscdSclIcon,
    'oscd-icon-button': OscdIconButton,
    'oscd-action-pane': OscdActionPane,
    'ldevice-container': LDeviceContainer,
    'oscd-scl-dialogs': OscdSclDialogs,
  };

  @property()
  selectedLNClasses: string[] = [];

  @query('oscd-scl-dialogs')
  private oscdSclDialogs!: OscdSclDialogs;

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

  private async handleCreateLDevice(event: Event) {
    const trigger = event.currentTarget as OscdIconButton | null;
    const createType = {
      parent: this.element,
      tagName: 'LDevice',
    };

    let createLDeviceEdit: EditV2[] | undefined;
    try {
      createLDeviceEdit = await this.oscdSclDialogs.create(createType);
    } finally {
      // Ensure focus doesn't return to the trigger after dialog closes (e.g., Escape).
      setTimeout(() => trigger?.blur?.(), 0);
    }

    if (!createLDeviceEdit?.length) {
      return;
    }

    const inserts: EditV2[] = [];
    const lln0Type = findLLN0LNodeType(this.doc);
    const lnTypeId = lln0Type?.getAttribute('id') || 'PlaceholderLLN0';

    if (!lln0Type) {
      const lnodeTypeInserts = createLLN0LNodeType(this.doc, lnTypeId);
      inserts.push(...lnodeTypeInserts);
    }

    const lDevice = findInsertedElement(createLDeviceEdit, 'LDevice');

    const ln0 = createElement(this.doc, 'LN0', {
      lnClass: 'LLN0',
      inst: '',
      lnType: lnTypeId,
    });
    lDevice?.appendChild(ln0);

    inserts.push(...createLDeviceEdit);
    this.dispatchEvent(newEditEventV2(inserts));
  }

  render() {
    return html`<oscd-action-pane .label=${this.header()}>
        <oscd-scl-icon slot="icon">serverIcon</oscd-scl-icon>
        ${this.element.tagName === 'Server'
          ? html`<abbr slot="action" title=${msg('Add LDevice')}>
              <oscd-icon-button
                @click=${(event: Event) => {
                  event.stopImmediatePropagation();
                  this.handleCreateLDevice(event);
                }}
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
      </oscd-action-pane>
      <oscd-scl-dialogs></oscd-scl-dialogs> `;
  }
}
