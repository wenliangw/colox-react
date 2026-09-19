import type { ReactElement } from 'react';
import { AutoComplete } from '../../autocomplete';
import { Checkbox } from '../../checkbox';
import { DatePicker } from '../../date-picker';
import { Input } from '../../input';
import { InputNumber } from '../../input-number';
import { Radio } from '../../radio';
import { Select } from '../../select';
import { Slider } from '../../slider';
import { Switch } from '../../switch';
import { Textarea } from '../../textarea';

/**
 * The family's empty word for a control: the value a field holds before
 * anyone has touched it. Every leaf has one and they differ by domain
 * (`''` for text, `null` for number/date, `[]` for a selection, `false`
 * for a boolean, the minimum for a range), so the field picks the word
 * by component identity — the same family knowledge the boolean
 * judgement uses. An unknown component falls back to the text word,
 * which is the family default.
 */
export function resolveEmptyValue(element: ReactElement): unknown {
  const { type } = element;

  if (type === Checkbox || type === Switch || type === Radio) {
    return false;
  }
  if (type === Checkbox.Group) {
    return [];
  }
  if (type === InputNumber || type === DatePicker) {
    return null;
  }
  if (type === Slider) {
    const { min } = element.props as { min?: number };
    return min ?? 0;
  }
  if (type === Select) {
    const { mode } = element.props as { mode?: string };
    return mode === 'multiple' ? [] : '';
  }
  // Input, Textarea, Radio.Group, AutoComplete — and any unknown
  // component — speak the text word.
  void Input;
  void Textarea;
  void Radio.Group;
  void AutoComplete;
  return '';
}
