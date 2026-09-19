import type { RadioGroupContextValue, RadioSize } from '../types';

export interface ResolveRadioStateParams {
  /** The member value prop (`string`), or absent on independent radios. */
  memberValue: string | undefined;
  /** Explicit controls; presence takes the member out of the group. */
  checked: boolean | undefined;
  defaultChecked: boolean | undefined;
  /** Own props the group overrides when inherited. */
  disabled: boolean | undefined;
  /** Own invalid flag; unset members inherit the group's. */
  invalid: boolean | undefined;
  name: string | undefined;
  size: RadioSize | undefined;
  /** The mounted group snapshot (static defaults outside a group). */
  group: RadioGroupContextValue;
}

export interface ResolveRadioStateResult {
  /** Whether this radio contributes its value to the group selection. */
  groupMember: boolean;
  /** Resolved checked state: group-derived for members, own otherwise. */
  checked: boolean | undefined;
  disabled: boolean;
  /** Resolved invalid flag: own prop wins, the group speaks otherwise. */
  invalid: boolean;
  name: string | undefined;
  /** Resolved tier: own prop wins, the group carries the axis otherwise. */
  size: RadioSize;
}

/**
 * Resolves a radio's state contract from its own props and the mounted
 * group: a `value` without explicit checked control is a group member
 * (its check derives from the single selection), everything else stays
 * own-controlled. `size`, `invalid` and `name` inherit from the group
 * with own prop precedence; `disabled` is sticky instead (a disabled
 * group cannot be opted out of).
 */
export function resolveRadioState({
  memberValue,
  checked,
  defaultChecked,
  disabled,
  invalid,
  name,
  size,
  group,
}: ResolveRadioStateParams): ResolveRadioStateResult {
  const groupMember =
    memberValue !== undefined && checked === undefined && defaultChecked === undefined;

  return {
    groupMember,
    checked: groupMember ? group.value === memberValue : checked,
    disabled: disabled || group.disabled,
    invalid: invalid ?? group.invalid,
    name: name ?? (group.name === '' ? undefined : group.name),
    size: size ?? group.size,
  };
}
