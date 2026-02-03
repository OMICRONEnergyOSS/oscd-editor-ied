# Finish Line — oscd-editor-ied v0.0.1

This file tracks the finish-line scope for v0.0.1. Each item is numbered so we can reference it in chat.

## How to use

- Add notes under the relevant item using sub-bullets or paragraphs.
- For out-of-scope follow-ups, add them to the “Post-epic backlog” section.

## Epic scope (v0.0.1)

### E1. IED delete behavior

Add a unit test to verify IED delete cleanup behavior in this plugin.
Status: Open
Status note: `@openscd/scl-lib` `removeIED` is already unit-tested there. Add a spot-check test here to assert the main cleanup aspects (e.g., Association/ClientLN/ConnectedAP/KDC/IEDName removal, ExtRef unsubscribes/supervision cleanup, and `LNode[iedName]` updates to `None`). The plugin calls it via `newEditEventV2(removeIED({ node }))`.

### E2. AccessPoint delete behavior

Add a unit test to verify AccessPoint delete cleanup behavior (parity with legacy).
Status: Open
Status note: Legacy delete flow removes references; current delete directly removes the AccessPoint node. Verify if any cleanup is required; if so, implement a `removeAccessPoint` helper modeled after `@openscd/scl-lib` patterns and place tests alongside it so it can be moved to scl-lib later with minimal refactor.

### E3. AccessPoint edit behavior

Implement rename + desc + reference updates parity.
Status: Open
Status note: Legacy edit updates naming attributes and references. Current edit only updates attributes. Add a helper modeled after scl-lib update/rename patterns and keep tests adjacent so it can be migrated to scl-lib later with minimal refactor.

### E4. Services edit

Implement Services edit for IED/AccessPoint (legacy parity).
Status: Open
Legacy provides a multi-step wizard; current UI shows a disabled settings icon with a stubbed handler. Investigation needed to choose an approach (multi-step dialog vs single dialog with sections or master/detail).

### E5. AccessPoint child LN rendering

Ensure LN children render correctly (current bug maps to `LDeviceContainer`).
Status: Done
Current `access-point-container` maps `ln-container` to `LDeviceContainer`, which is incorrect for `:scope > LN` rendering.

### E6. LDevice header

Fix attribute typo and ensure header matches legacy.
Status: Done
Current header uses `getAttribute('nane')` (typo), so `name` never shows. Legacy uses `name` or `inst` plus optional `ldName`. Consider a shared header helper to reduce repetition, but keep scope small for v0.0.1 (fix typo + match legacy first).

### E7. LDevice add LN behavior

Parity with legacy (lnType selection, prefix, amount, inst generation).
Status: Done
Status note: oscd-scl-dialogs `createLNWizard` covers selection, prefix, amount, and inst generation. Prefix maxLength 11 aligns with IEC 61850‑6 schema, so no change needed. `desc` field addition is acceptable.

### E8. DA edit support

Verify supported types vs legacy and align.
Status: Open
Legacy uses `getCustomField()` for DAI edit support; current uses a hard-coded `supportedDaiTypes` set. Verify whether any editable types regressed.
DA/DAI parity tasks:

- E8.1 Confirm `supportedDaiTypes` stays in sync with legacy `getCustomField()` (add a test or checklist).
- E8.2 Add tests for edit dialog targeting a specific `Val` when multiple sGroups exist (edit only the clicked `Val`).
- E8.3 Add tests for missing sGroup values: add icon opens edit dialog, confirm inserts new `Val` with correct `sGroup`.
- E8.4 Add test for insertion order when adding a missing sGroup (e.g., insert sGroup 2 between 1 and 3).
- E8.5 Add tests for sparse sGroups in create flow (numOfSGs > existing Val count) to verify prefill and save behavior.
- E8.6 Decide whether to keep or remove legacy `dai-value-dialog` (now unused) and document the decision.
- E8.7 Re-review da-value-edit-dialog.spec.ts - are we using the same constructs in all the tests - I think it might be a little mixed.

### E9. Coverage ≥ 90%

Add tests and maintain IEC 61850 correctness in edits.
Status: Open
Add/extend tests for all create/edit/delete flows that manipulate SCL: IED, AccessPoint, Server/LDevice/LN, DO/DA/DAI, and reference cleanup. Ensure edits conform to IEC 61850.

## Post-epic backlog (not v0.0.1)

### P1. Migrate remaining dialogs into oscd-scl-dialogs

Status: Open

### P2. Migrate AccessPoint helpers to scl-lib

Status: Open
Move AccessPoint delete/rename helpers (and their tests) from this plugin into `@openscd/scl-lib` after v0.0.1.

### P3. Unify header rendering across containers

Status: Open
Create a shared header helper/component to reduce repetition and keep heading formatting consistent.

## Notes

- Add discussions, decisions, or links under each numbered item.
