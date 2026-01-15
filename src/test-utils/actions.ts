/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable import-x/no-extraneous-dependencies */
import { sendKeys } from '@web/test-runner-commands';
import { OscdSclTextField } from '@omicronenergy/oscd-ui/scl-textfield/OscdSclTextField.js';
import { OscdSwitch } from '@omicronenergy/oscd-ui/switch/OscdSwitch.js';
import { OscdFilledTextField } from '@omicronenergy/oscd-ui/textfield/OscdFilledTextField.js';
import { expect } from '@open-wc/testing';

export async function typeIn(
  element: HTMLElement,
  text: string,
): Promise<void> {
  element.focus();
  await sendKeys({ type: text });
}

export async function setSclTextFieldValue(
  oscdSclTextField: OscdSclTextField,
  value: string,
): Promise<void> {
  const textField = oscdSclTextField.shadowRoot?.querySelector(
    'oscd-filled-text-field',
  ) as OscdFilledTextField;
  expect(textField).to.exist;

  await activateOscdSclTextField(oscdSclTextField);
  await textField.updateComplete;
  expect(textField.disabled).to.be.false;

  const inputElement = textField.shadowRoot?.querySelector(
    'input',
  ) as HTMLInputElement;
  expect(inputElement).to.exist;
  await typeIn(inputElement, value);

  await oscdSclTextField.updateComplete;
}

export async function activateOscdSclTextField(
  oscdSclTextField: OscdSclTextField,
): Promise<void> {
  const oscdSwitch = oscdSclTextField.shadowRoot?.querySelector(
    'oscd-switch',
  ) as OscdSwitch;
  expect(oscdSwitch).to.exist;
  if (!oscdSwitch.selected) {
    oscdSwitch.click();
  }
  await oscdSwitch.requestUpdate();
}
