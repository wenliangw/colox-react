import type { RadioGroupContextValue } from '../types';

export interface ResolveRadioStateParams {
  /** The member value prop (`string`), or absent on independent radios. */
  memberValue: string | undefined;
  /** Explicit controls; presence takes the member out of the group. */
  checked: boolean | undefined;
  defaultChecked: boolean | undefined;
  /** Own props the group overrides when inherited. */
  disabled: boolean | undefined;
  name: string | undefined;
  /** The mounted group snapshot (static defaults outside a group). */
  group: RadioGroupContextValue;
}

export interface ResolveRadioStateResult {
  /** Whether this radio contributes its value to the group selection. */
  groupMember: boolean;
  /** Resolved checked state: group-derived for members, own otherwise. */
  checked: boolean | undefined;
  disabled: boolean;
  name: string | undefined;
}

/**
 * Resolves a radio's state contract from its own props and the mounted
 * group: a `value` without explicit checked control is a group member
 * (its check derives from the single selection), everything else stays
 * own-controlled. `disabled` and `name` inherit from the group with
 * own prop precedence (a disabled group cannot be opted out of).
 */
export function resolveRadioState({
  memberValue,
  checked,
  defaultChecked,
  disabled,
  name,
  group,
}: ResolveRadioStateParams): ResolveRadioStateResult {
  const groupMember =
    memberValue !== undefined && checked === undefined && defaultChecked === undefined;

  return {
    groupMember,
    checked: groupMember ? group.value === memberValue : checked,
    disabled: disabled || group.groupDisabled,
    name: name ?? (group.name === '' ? undefined : group.name),
  };
}
