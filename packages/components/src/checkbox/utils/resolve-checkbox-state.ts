import type { CheckboxGroupContextValue, CheckboxSize } from '../types';

export interface ResolveCheckboxStateParams {
  /** The member value prop (`string`), or absent on independent boxes. */
  memberValue: string | undefined;
  /** Explicit controls; presence takes the member out of the group. */
  checked: boolean | undefined;
  defaultChecked: boolean | undefined;
  /** Own props the group overrides when inherited. */
  disabled: boolean | undefined;
  /** Own invalid flag; unset members inherit the group's. */
  invalid: boolean | undefined;
  /** Own read-only flag; the group's is sticky when set. */
  readOnly: boolean | undefined;
  name: string | undefined;
  size: CheckboxSize | undefined;
  /** The mounted group snapshot (static defaults outside a group). */
  group: CheckboxGroupContextValue;
}

export interface ResolveCheckboxStateResult {
  /** Whether this checkbox contributes its value to the group array. */
  groupMember: boolean;
  /** Resolved checked state: group-derived for members, own otherwise. */
  checked: boolean | undefined;
  disabled: boolean;
  /** Resolved invalid flag: own prop wins, the group speaks otherwise. */
  invalid: boolean;
  /** Resolved read-only flag: sticky, like disabled. */
  readOnly: boolean;
  name: string | undefined;
  /** Resolved tier: own prop wins, the group carries the axis otherwise. */
  size: CheckboxSize;
}

/**
 * Resolves a checkbox's state contract from its own props and the
 * mounted group: a `value` without explicit checked control is a group
 * member (its check derives from the selection array), everything else
 * stays own-controlled. `size`, `invalid` and `name` inherit from the
 * group with own prop precedence; `disabled` and `readOnly` are
 * sticky instead (a disabled or read-only group cannot be opted out of
 * — capability restrictions are not per-member states).
 */
export function resolveCheckboxState({
  memberValue,
  checked,
  defaultChecked,
  disabled,
  invalid,
  readOnly,
  name,
  size,
  group,
}: ResolveCheckboxStateParams): ResolveCheckboxStateResult {
  const groupMember =
    memberValue !== undefined && checked === undefined && defaultChecked === undefined;

  return {
    groupMember,
    checked: groupMember ? group.value.includes(memberValue) : checked,
    disabled: disabled || group.disabled,
    invalid: invalid ?? group.invalid,
    readOnly: readOnly || group.readOnly,
    name: name ?? (group.name === '' ? undefined : group.name),
    size: size ?? group.size,
  };
}
