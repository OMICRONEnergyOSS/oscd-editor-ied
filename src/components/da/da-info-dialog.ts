import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement, TemplateResult, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import {
  findElement,
  getValueElements,
  MISSING_VALUE,
} from '../../foundation.js';
import { Nsdoc } from '../../foundation/nsdoc.js';
import { InfoDialog, InfoGroup } from '../info-dialog.js';
import { buildDoInfoGroups, InfoContext } from '../do/do-info-dialog.js';

export function buildDaInfoGroups({
  ancestors,
  nsdoc,
  templateElement,
  instanceElement,
}: InfoContext): InfoGroup[] {
  const doElement = findElement(ancestors, 'DO');
  const doInfoGroups = buildDoInfoGroups({
    ancestors,
    nsdoc,
    templateElement: doElement,
    instanceElement: null,
    detailed: false,
  });

  const valueElement = instanceElement ?? templateElement;
  const values = valueElement ? getValueElements(valueElement) : [];
  const daValue =
    values.length > 0
      ? values.map(val => val.textContent ?? '').join(', ')
      : MISSING_VALUE;

  return [
    [
      {
        label: 'NSDoc description',
        value: templateElement
          ? nsdoc.getDataDescription(templateElement, ancestors).label
          : MISSING_VALUE,
        multiline: true,
        rows: 3,
      },
      {
        label: 'Data attribute name',
        value: templateElement?.getAttribute('name') ?? MISSING_VALUE,
      },
      {
        label: 'Data attribute description',
        value: instanceElement?.getAttribute('desc') ?? MISSING_VALUE,
      },
      {
        label: 'Data attribute functional constraint',
        value: templateElement?.getAttribute('fc') ?? MISSING_VALUE,
      },
      {
        label: 'Data attribute base type',
        value: templateElement?.getAttribute('bType') ?? MISSING_VALUE,
      },
      {
        label: 'Data attribute type',
        value: templateElement?.getAttribute('type') ?? MISSING_VALUE,
      },
      {
        label: 'Data attribute value',
        value: daValue,
      },
    ],
    ...doInfoGroups,
  ];
}

/** Read-only info dialog for a DA/DAI */
export class DaInfoDialog extends ScopedElementsMixin(LitElement) {
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
    this.infoGroups = buildDaInfoGroups({
      ancestors: this.ancestors,
      nsdoc: this.nsdoc,
      templateElement: this.templateElement,
      instanceElement: this.instanceElement,
    });

    this.infoDialog.show();
  }

  render(): TemplateResult {
    return html`
      <info-dialog
        headline="Show DA Info"
        .infoGroups=${this.infoGroups}
      ></info-dialog>
    `;
  }
}
