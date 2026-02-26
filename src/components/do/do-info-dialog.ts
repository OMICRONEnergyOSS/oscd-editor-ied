import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement, TemplateResult, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import {
  findDOTypeElement,
  findElement,
  MISSING_VALUE,
} from '../../foundation.js';
import { findLogicalNodeElement } from '../../foundation/virtual-ied.js';
import { Nsdoc } from '../../foundation/nsdoc.js';
import { InfoDialog, InfoGroup } from '../info-dialog.js';

export type InfoContext = {
  ancestors: Element[];
  nsdoc: Nsdoc;
  templateElement: Element | null;
  instanceElement?: Element | null;
  detailed?: boolean;
};

export function buildDoInfoGroups({
  ancestors,
  nsdoc,
  templateElement,
  instanceElement,
  detailed,
}: InfoContext): InfoGroup[] {
  const logicalNodeElement = findLogicalNodeElement(ancestors);
  const lDeviceElement = findElement(ancestors, 'LDevice');
  const accessPointElement = findElement(ancestors, 'AccessPoint');
  const iedElement = findElement(ancestors, 'IED');
  const doTypeElement = findDOTypeElement(templateElement);

  return [
    [
      ...(detailed
        ? [
            {
              label: 'NSDoc description',
              value: templateElement
                ? nsdoc.getDataDescription(templateElement, ancestors).label
                : MISSING_VALUE,
              multiline: true,
              rows: 3,
            },
          ]
        : []),
      {
        label: 'Data object name',
        value: templateElement?.getAttribute('name') ?? MISSING_VALUE,
      },
      ...(detailed
        ? [
            {
              label: 'Data object description',
              value: instanceElement?.getAttribute('desc') ?? MISSING_VALUE,
            },
          ]
        : []),
      {
        label: 'Data object common data class',
        value: doTypeElement?.getAttribute('cdc') ?? MISSING_VALUE,
      },
      {
        label: 'Data object Type',
        value: templateElement?.getAttribute('type') ?? MISSING_VALUE,
      },
    ],
    [
      {
        label: 'Logical node prefix',
        value: logicalNodeElement?.getAttribute('prefix') ?? MISSING_VALUE,
      },
      {
        label: 'Logical Node Class',
        value: logicalNodeElement
          ? nsdoc.getDataDescription(logicalNodeElement, ancestors).label
          : MISSING_VALUE,
      },
      {
        label: 'Logical node inst',
        value: logicalNodeElement?.getAttribute('inst') ?? MISSING_VALUE,
      },
    ],
    [
      {
        label: 'Logical device',
        value:
          lDeviceElement?.getAttribute('name') ??
          lDeviceElement?.getAttribute('inst') ??
          MISSING_VALUE,
      },
      {
        label: 'Access point',
        value: accessPointElement?.getAttribute('name') ?? MISSING_VALUE,
      },
      {
        label: 'IED',
        value: iedElement?.getAttribute('name') ?? MISSING_VALUE,
      },
    ],
  ];
}

/** Read-only info dialog for a DO/DOI */
export class DoInfoDialog extends ScopedElementsMixin(LitElement) {
  static scopedElements = {
    'info-dialog': InfoDialog,
  };

  @property({ attribute: false })
  ancestors!: Element[];

  @property({ attribute: false })
  nsdoc!: Nsdoc;

  @property({ attribute: false })
  templateElement!: Element;

  @property({ attribute: false })
  instanceElement!: Element | null;

  @state() private infoGroups: InfoGroup[] = [];

  @query('info-dialog') private infoDialog!: InfoDialog;

  public show(): void {
    this.infoGroups = buildDoInfoGroups({
      ancestors: this.ancestors,
      nsdoc: this.nsdoc,
      templateElement: this.templateElement,
      instanceElement: this.instanceElement,
      detailed: true,
    });

    this.infoDialog.show();
  }

  render(): TemplateResult {
    return html`
      <info-dialog
        headline="Show DO Info"
        .infoGroups=${this.infoGroups}
      ></info-dialog>
    `;
  }
}
