import { List } from '@material/mwc-list';
import { Select } from '@material/mwc-select';
import { TextField } from '@material/mwc-textfield';

import AceEditor from 'ace-custom-element';
import { TemplateResult } from 'lit';
import { WizardCheckbox } from './wizard-checkbox.js';
import { WizardSelect } from './wizard-select.js';
import { WizardTextField } from './wizard-textfield.js';

/** Sorts selected `ListItem`s to the top and disabled ones to the bottom. */
export function compareNames(a: Element | string, b: Element | string): number {
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  }

  if (typeof a === 'object' && typeof b === 'string') {
    return (a.getAttribute('name') ?? '').localeCompare(b);
  }

  if (typeof a === 'string' && typeof b === 'object') {
    return a.localeCompare(b.getAttribute('name')!);
  }

  if (typeof a === 'object' && typeof b === 'object') {
    return (a.getAttribute('name') ?? '').localeCompare(
      b.getAttribute('name') ?? '',
    );
  }

  return 0;
}

/**
 * Extract the 'name' attribute from the given XML element.
 * @param element - The element to extract name from.
 * @returns the name, or undefined if there is no name.
 */
export function getNameAttribute(element: Element): string | undefined {
  const name = element.getAttribute('name');
  return name ? name : undefined;
}

/**
 * Extract the 'ldName' attribute from the given XML element.
 * @param element - The element to extract ldName from.
 * @returns the ldName, or undefined if there is no ldName.
 */
export function getLdNameAttribute(element: Element): string | undefined {
  const name = element.getAttribute('ldName');
  return name ? name : undefined;
}

/**
 * Extract the 'desc' attribute from the given XML element.
 * @param element - The element to extract description from.
 * @returns the name, or undefined if there is no description.
 */
export function getDescriptionAttribute(element: Element): string | undefined {
  const name = element.getAttribute('desc');
  return name ? name : undefined;
}

// /** @returns a string uniquely identifying `e` in its document, or NaN if `e`
//  * is unidentifiable. */
// export function identity(e: Element | null): string | number {
//   if (e === null) {
//     return NaN;
//   }
//   if (e.closest('Private')) {
//     return NaN;
//   }
//   const tag = e.tagName;

//   if (isSCLTag(tag)) {
//     return tags[tag].identity(e);
//   }

//   return NaN;
// }

export const wizardInputSelector =
  'wizard-textfield, mwc-textfield, ace-editor, mwc-select, wizard-select, wizard-checkbox';
export type WizardInputElement =
  | WizardTextField
  | TextField
  | (typeof AceEditor & {
      checkValidity: () => boolean;
      validityTransform: (
        newValue: string,
        nativeValidity: ValidityState,
      ) => ValidityState;
      validationMessage: string;
      validity: ValidityState;
      label: string;
      requestUpdate(name?: PropertyKey, oldValue?: unknown): Promise<unknown>;
    })
  // TODO(c-dinkel): extend component
  | Select
  | WizardSelect;

// TODO stee: Is removing WizardAction ok?
// export type WizardAction = EditorAction | WizardFactory;
export type WizardAction = WizardFactory;

/** @returns [[`EditorAction`]]s to dispatch on [[`WizardDialog`]] commit. */
export type WizardActor = (
  inputs: WizardInputElement[],
  wizard: Element,
  list?: List | null,
) => WizardAction[];

/** @returns the validity of `input` depending on type. */
export function checkValidity(input: WizardInputElement): boolean {
  if (input instanceof WizardTextField || input instanceof Select) {
    return input.checkValidity();
  } else {
    return true;
  }
}

/** reports the validity of `input` depending on type. */
export function reportValidity(input: WizardInputElement): boolean {
  if (input instanceof WizardTextField || input instanceof Select) {
    return input.reportValidity();
  } else {
    return true;
  }
}

/** @returns the `value` or `maybeValue` of `input` depending on type. */
export function getValue(input: WizardInputElement): string | null {
  if (
    input instanceof WizardTextField ||
    input instanceof WizardSelect ||
    input instanceof WizardCheckbox
  ) {
    return input.maybeValue;
  } else if ('value' in input) {
    return input.value ?? null;
  } else {
    return null;
  }
}

/** @returns the `multiplier` of `input` if available. */
export function getMultiplier(input: WizardInputElement): string | null {
  if (input instanceof WizardTextField) {
    return input.multiplier;
  } else {
    return null;
  }
}

/** Inputs as `TextField`, `Select` or `Checkbox `used in`wizard-dialog` */
export type WizardInput =
  | WizardInputTextField
  | WizardInputSelect
  | WizardInputCheckbox;

interface WizardInputBase {
  /** maps attribute key */
  label: string;
  /** maps attribute value */
  maybeValue: string | null;
  /** whether attribute is optional */
  nullable?: boolean;
  /** whether the input shall be disabled */
  disabled?: boolean;
  /** helper text */
  helper?: string;
  /** initial focused element in `wizard-dialog` (once per dialog) */
  dialogInitialFocus?: boolean;
}

interface WizardInputTextField extends WizardInputBase {
  kind: 'TextField';
  /** wether the input might be empty string */
  required?: boolean;
  /** pattern definition from schema */
  pattern?: string;
  /** minimal characters allowed */
  minLength?: number;
  /** maximal characters allowed */
  maxLength?: number;
  /** message text explaining invalid inputs */
  validationMessage?: string;
  /** suffix definition - overwrites unit multiplier definition */
  suffix?: string;
  /** SI unit for specific suffix definition */
  unit?: string;
  /** in comibination with unit defines specific suffix */
  multiplier?: string | null;
  /** array of multipliers allowed for the input */
  multipliers?: (string | null)[];
  /** used for specific input type e.g. number */
  type?: string;
  /** minimal valid number in combination with type number */
  min?: number;
  /** maximal valid number in combination with type number */
  max?: number;
  /** value displaxed when input is nulled */
  default?: string;
}

interface WizardInputSelect extends WizardInputBase {
  kind: 'Select';
  /** selectabled values */
  values: string[];
  /** value displayed with input is nulled */
  default?: string;
  /** message explaining invalid inputs */
  valadationMessage?: string;
}

interface WizardInputCheckbox extends WizardInputBase {
  kind: 'Checkbox';
  /** wether checkbox is checked with nulled input */
  default?: boolean;
}

/** User interactions rendered in the wizard-dialog menu */
export interface MenuAction {
  label: string;
  icon?: string;
  action: WizardMenuActor;
}

/** @returns [[`WizardAction`]]s to dispatch on [[`WizardDialog`]] menu action. */
export type WizardMenuActor = (wizard: Element) => void;

/** Represents a page of a wizard dialog */
export interface WizardPage {
  title: string;
  content?: (TemplateResult | WizardInput)[];
  primary?: {
    icon: string;
    label: string;
    action: WizardActor;
    auto?: boolean;
  };
  secondary?: {
    icon: string;
    label: string;
    action: WizardActor;
  };
  initial?: boolean;
  element?: Element;
  menuActions?: MenuAction[];
}
export type Wizard = WizardPage[];
export type WizardFactory = () => Wizard;

export function isWizardFactory(
  maybeFactory: WizardAction | Wizard | null,
): maybeFactory is WizardFactory {
  return typeof maybeFactory === 'function';
}

export interface WizardDetail {
  wizard: WizardFactory | null;
  subwizard?: boolean;
}
export type WizardEvent = CustomEvent<WizardDetail>;
export function newWizardEvent(
  wizardOrFactory?: Wizard | WizardFactory,
  eventInitDict?: CustomEventInit<Partial<WizardDetail>>,
): WizardEvent {
  if (!wizardOrFactory) {
    return new CustomEvent<WizardDetail>('wizard', {
      bubbles: true,
      composed: true,
      ...eventInitDict,
      detail: { wizard: null, ...eventInitDict?.detail },
    });
  }

  const wizard = isWizardFactory(wizardOrFactory)
    ? wizardOrFactory
    : () => wizardOrFactory;

  return new CustomEvent<WizardDetail>('wizard', {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: { wizard, ...eventInitDict?.detail },
  });
}
