import { useContext } from 'react';
import { CheckboxGroupContext } from '../context';
import type { CheckboxGroupContextValue } from '../types';

/**
 * The single protected outlet for the Checkbox.Group context: members
 * derive their checked state, name and disabled inheritance through it
 * — no consumer reads CheckboxGroupContext directly. Unlike parts that
 * require a root, a bare <Checkbox> outside any group is fully valid
 * usage, so there is no warning here: the static default makes every
 * group feature a no-op and the unmounted consumer behaves as a plain
 * checkbox.
 */
export const useCheckboxGroupContext = (): CheckboxGroupContextValue =>
  useContext(CheckboxGroupContext);
