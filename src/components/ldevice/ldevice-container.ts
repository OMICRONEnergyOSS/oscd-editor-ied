import { TemplateResult, html, nothing, css } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { msg } from '@lit/localize';

import { BaseContainer } from '../base-container.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdSclIcon } from '@omicronenergy/oscd-ui/scl-icon/OscdSclIcon.js';
import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';
import { LNContainer } from '../lnode/ln-container.js';
import {
  newConfirmDeleteEvent,
  newEditElementEvent,
} from '../../foundation/events.js';
import { newEditEventV2 } from '@openscd/oscd-api/utils.js';
import OscdSclDialogs from '@omicronenergy/oscd-scl-dialogs/OscdSclDialogs.js';
import { EditV2 } from '@openscd/oscd-api';

/** [[`IED`]] plugin subeditor for editing `LDevice` element. */
export class LDeviceContainer extends ScopedElementsMixin(BaseContainer) {
  static scopedElements = {
    'oscd-action-pane': OscdActionPane,
    'oscd-icon-button': OscdIconButton,
    'oscd-scl-icon': OscdSclIcon,
    'oscd-icon': OscdIcon,
    'ln-container': LNContainer,
    'oscd-scl-dialogs': OscdSclDialogs,
  };

  @property()
  selectedLNClasses: string[] = [];

  @property({ type: Boolean })
  expanded = false;

  @query('oscd-scl-dialogs')
  private oscdSclDialogs!: OscdSclDialogs;

  private async handleAddLN(event: Event): Promise<void> {
    const trigger = event.currentTarget as OscdIconButton | null;
    let edits: EditV2[] | undefined;
    const createType = {
      parent: this.element,
      tagName: 'LN',
    };
    try {
      edits = await this.oscdSclDialogs.create(createType);
    } finally {
      // Ensure focus doesn't return to the trigger after dialog closes (e.g., Escape).
      setTimeout(() => trigger?.blur?.(), 0);
    }

    this.dispatchEvent(newEditEventV2(edits));
  }

  private handleEditLDevice(): void {
    this.dispatchEvent(newEditElementEvent({ element: this.element }));
  }

  private removeLDevice(): void {
    const name = this.header();
    this.dispatchEvent(
      newConfirmDeleteEvent({
        heading: msg(`Delete`),
        message: msg(
          `Are you sure you want to delete LogicalDevice "${name}" and all its content?`,
        ),
        onConfirm: () => {
          this.dispatchEvent(newEditEventV2({ node: this.element }));
        },
      }),
    );
  }

  private toggleExpanded(): void {
    this.expanded = !this.expanded;
  }

  private header() {
    const nameOrInst =
      this.element.getAttribute('name') ?? this.element.getAttribute('inst');
    const desc = this.element.getAttribute('desc');
    const ldName = this.element.getAttribute('ldName');

    return `${nameOrInst}${desc ? ` \u2014 ${desc}` : ''}${
      ldName ? ` \u2014 ${ldName}` : ''
    }`;
  }

  private getLnElements(): Element[] {
    return Array.from(this.element.querySelectorAll(':scope > LN,LN0')).filter(
      element => {
        const lnClass = element.getAttribute('lnClass') ?? '';
        return this.selectedLNClasses.includes(lnClass);
      },
    );
  }

  render(): TemplateResult {
    const lnElements = this.getLnElements();

    return html`<oscd-action-pane label="${this.header()}">
        <oscd-scl-icon slot="icon">logicalDeviceIcon</oscd-scl-icon>
        <oscd-icon-button
          slot="action"
          title="${msg('remove')}"
          @click=${() => this.removeLDevice()}
        >
          <oscd-icon>delete</oscd-icon>
        </oscd-icon-button>
        <abbr slot="action" title="${msg('edit')}">
          <oscd-icon-button @click=${() => this.handleEditLDevice()}>
            <oscd-icon>edit</oscd-icon>
          </oscd-icon-button>
        </abbr>
        <abbr slot="action" title=${msg('Add LN')}>
          <oscd-icon-button
            @click=${(event: Event) => {
              this.handleAddLN(event);
            }}
          >
            <oscd-icon>playlist_add</oscd-icon>
          </oscd-icon-button>
        </abbr>
        ${lnElements.length > 0
          ? html`<abbr slot="action" title="${msg('Toggle child elements')}">
              <oscd-icon-button
                toggle
                id="toggleButton"
                .selected=${this.expanded}
                @click=${this.toggleExpanded}
              >
                <oscd-icon>keyboard_arrow_down</oscd-icon>
                <oscd-icon slot="selected">keyboard_arrow_up</oscd-icon>
              </oscd-icon-button>
            </abbr>`
          : nothing}
        <div id="lnContainer">
          ${this.expanded
            ? lnElements.map(
                ln =>
                  html`<ln-container
                    .docVersion=${this.docVersion}
                    .doc=${this.doc}
                    .element=${ln}
                    .nsdoc=${this.nsdoc}
                    .ancestors=${[...this.ancestors, this.element]}
                  ></ln-container> `,
              )
            : nothing}
        </div> </oscd-action-pane
      ><oscd-scl-dialogs></oscd-scl-dialogs>`;
  }

  static styles = css`
    #lnContainer {
      display: grid;
      grid-gap: 12px;
      box-sizing: border-box;
      grid-template-columns: repeat(auto-fit, minmax(316px, auto));
    }

    abbr {
      text-decoration: none;
    }

    @media (max-width: 387px) {
      #lnContainer {
        grid-template-columns: repeat(auto-fit, minmax(196px, auto));
      }
    }
  `;
}
