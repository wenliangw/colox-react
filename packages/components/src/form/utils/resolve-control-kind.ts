import type { ReactElement } from 'react';
import { Checkbox } from '../../checkbox';
import { Radio } from '../../radio';
import { Switch } from '../../switch';

/**
 * Whether a control speaks the boolean domain — it takes `checked` and
 * reports a boolean. Checkbox / Switch and a standalone Radio are the
 * only such leaves; the judgement is by component identity because
 * their `value` prop is a string form token (or a group key), so a
 * field that injected `value` there would write the wrong word
 * entirely. Groups are not boolean controls.
 */
export function isBooleanControl(element: ReactElement): boolean {
  return element.type === Checkbox || element.type === Switch || element.type === Radio;
}

/**
 * Whether a control is a group-shaped container (`Checkbox.Group` /
 * `Radio.Group`): a `role="group"` / `role="radiogroup"` div, which no
 * `<label for>` can target — the field wires those through
 * `aria-labelledby` instead.
 */
export function isGroupControl(element: ReactElement): boolean {
  return element.type === Checkbox.Group || element.type === Radio.Group;
}
