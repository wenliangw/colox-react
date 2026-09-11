import type { CheckboxGroupContextValue, CheckboxSize } from '../types';

export interface ResolveCheckboxStateParams {
  /** The member value prop (`string`), or absent on independent boxes. */
  memberValue: string | undefined;
  /** Explicit controls; presence takes the member out of the group. */
  checked: boolean | undefined;
  defaultChecked: boolean | undefined;
  /** Own props the group overrides when inherited. */
  disabled: boolean | undefined;
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
  name: string | undefined;
  /** Resolved tier: own prop wins, the group carries the axis otherwise. */
  size: CheckboxSize;
}

/**
 * Resolves a checkbox's state contract from its own props and the
 * mounted group: a `value` without explicit checked control is a group
 * member (its check derives from the selection array), everything else
 * stays own-controlled. `size`, `disabled` and `name` inherit from the
 * group with own prop precedence (a disabled group cannot be opted out
 * of).
 */
export function resolveCheckboxState({
  memberValue,
  checked,
  defaultChecked,
  disabled,
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
    name: name ?? (group.name === '' ? undefined : group.name),
    size: size ?? group.size,
  };
}
