import { css, html, TemplateResult } from 'lit';

import { OscdDialog } from '@omicronenergy/oscd-ui/dialog/OscdDialog.js';
import { OscdActionPane } from '@omicronenergy/oscd-ui/action-pane/OscdActionPane.js';
// import { newEditEventV2 } from '@omicronenergy/oscd-api/utils.js';
import { wizards } from '@omicronenergy/oscd-edit-dialog/wizards.js';
import { property, query } from 'lit/decorators.js';
import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { BaseContainer } from './base-container.js';

import { OscdIcon } from '@omicronenergy/oscd-ui/icon/OscdIcon.js';
import { OscdIconButton } from '@omicronenergy/oscd-ui/iconbutton/OscdIconButton.js';
import { AccessPointContainer } from './access-point-container.js';
import { msg } from '@lit/localize';

/** [[`IED`]] plugin subeditor for editing `IED` element. */
export class IedContainer extends ScopedElementsMixin(BaseContainer) {
  static scopedElements = {
    'oscd-icon': OscdIcon,
    'oscd-icon-button': OscdIconButton,
    'oscd-action-pane': OscdActionPane,
    'access-point-container': AccessPointContainer,
    // 'add-access-point-dialog': AddAccessPointDialog,
  };

  @property()
  selectedLNClasses: string[] = [];

  @query('add-access-point-dialog')
  addAccessPointDialog!: OscdDialog;

  private openEditWizard(): void {
    const wizard = wizards['IED'].edit(this.element);
    if (wizard) {
      // this.dispatchEvent(newWizardEvent(wizard));
      console.log('Please implement me');
    }
  }

  // private createAccessPoint(data: AccessPointCreationData): void {
  //   const inserts: InsertV2[] = [];
  //   const accessPoint = createAccessPoint(this.doc, data.name);

  //   inserts.push({
  //     parent: this.element,
  //     node: accessPoint,
  //     reference: null,
  //   });

  //   if (data.createServerAt && data.serverAtApName) {
  //     const serverAt = createServerAt(
  //       this.doc,
  //       data.serverAtApName,
  //       data.serverAtDesc,
  //     );
  //     inserts.push({
  //       parent: accessPoint,
  //       node: serverAt,
  //       reference: null,
  //     });
  //   }

  //   this.dispatchEvent(newEditEventV2(inserts));
  // }

  private renderServicesIcon(): TemplateResult {
    const services: Element | null = this.element.querySelector('Services');

    if (!services) {
      return html``;
    }

    return html` <abbr
      slot="action"
      title="${msg('Show Services the IED/AccessPoint provides')}"
    >
      <oscd-icon-button @click=${() => this.handleEditServices(services)}
        ><oscd-icon>settings</oscd-icon></oscd-icon-button
      >
    </abbr>`;
  }

  private handleEditServices(services: Element): void {
    // const wizard = editServicesWizard(services);
    // if (wizard) {
    //   this.dispatchEvent(newWizardEvent(wizard));
    // }
    console.log(
      'Please implement me',
      this.element.getAttribute('name'),
      new XMLSerializer().serializeToString(services),
    );
  }

  private removeIED(): void {
    console.log('Please implement me', this.element);
  }

  private header() {
    const name = this.element.getAttribute('name') ?? '';
    const desc = this.element.getAttribute('desc');

    return `${name}${desc ? ` \u2014 ${desc}` : ''}`;
  }

  render() {
    return html` <oscd-action-pane .label="${this.header()}">
      <oscd-icon slot="icon">developer_board</oscd-icon>
      <abbr slot="action" title="${msg('remove')}">
        <oscd-icon-button @click=${() => this.removeIED()}
          ><oscd-icon>delete</oscd-icon></oscd-icon-button
        >
      </abbr>
      <abbr slot="action" title="${msg('edit')}">
        <oscd-icon-button @click=${() => this.openEditWizard()}
          ><oscd-icon>edit</oscd-icon></oscd-icon-button
        >
      </abbr>
      ${this.renderServicesIcon()}
      <abbr slot="action" title="${msg('Add AccessPoint')}">
        <oscd-icon-button @click=${() => this.addAccessPointDialog.show()}
          ><oscd-icon>playlist_add</oscd-icon></oscd-icon-button
        >
      </abbr>
      ${Array.from(this.element.querySelectorAll(':scope > AccessPoint')).map(
        ap =>
          html`<access-point-container
            .editCount=${this.editCount}
            .doc=${this.doc}
            .element=${ap}
            .nsdoc=${this.nsdoc}
            .selectedLNClasses=${this.selectedLNClasses}
            .ancestors=${[this.element]}
          ></access-point-container>`,
      )}
      <add-access-point-dialog
        .doc=${this.doc}
        .ied=${this.element}
        .onConfirm=${(data: unknown) =>
          // this.createAccessPoint(data)
          console.log('Please implement me', data)}
      ></add-access-point-dialog>
    </oscd-action-pane>`;
  }

  static styles = css`
    abbr {
      text-decoration: none;
      border-bottom: none;
    }
  `;
}
