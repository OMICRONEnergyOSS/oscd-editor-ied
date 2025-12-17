import { ScopedElementsMixin } from '@open-wc/scoped-elements/lit-element.js';
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import {
  getTitleForElementPath,
  newFullElementPathEvent,
} from '../foundation.js';
import { Nsdoc } from '../foundation/nsdoc.js';

/** Base class for all containers inside the IED Editor. */
export class BaseContainer extends ScopedElementsMixin(LitElement) {
  @property()
  doc!: XMLDocument;

  @property({ type: Number })
  editCount = -1;

  @property({ attribute: false })
  element!: Element;

  @property()
  nsdoc!: Nsdoc;

  @property()
  ancestors: Element[] = [];

  constructor() {
    super();

    this.addEventListener('focus', event => {
      event.stopPropagation();
      const pathOfAncestorNames = this.ancestors.map(
        ancestor => getTitleForElementPath(ancestor)!,
      );
      pathOfAncestorNames.push(getTitleForElementPath(this.element)!);

      this.dispatchEvent(newFullElementPathEvent(pathOfAncestorNames));
    });

    this.addEventListener('blur', () => {
      this.dispatchEvent(
        newFullElementPathEvent(
          this.ancestors.map(ancestor => getTitleForElementPath(ancestor)!),
        ),
      );
    });
  }
}
