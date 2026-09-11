import { createContext } from 'react';
import type { CheckboxGroupContextValue } from '../types';

const toggleNoop = (): undefined => undefined;

/** The static snapshot served when no <Checkbox.Group> is mounted. */
export const defaultCheckboxGroupContextValue: CheckboxGroupContextValue = {
  value: [],
  toggleValue: toggleNoop,
  name: '',
  groupDisabled: false,
};

/**
 * The context behind useCheckboxGroupContext, consumed only through that
 * hook and provided only by the <Checkbox.Group> root.
 */
export const CheckboxGroupContext = createContext<CheckboxGroupContextValue>(
  defaultCheckboxGroupContextValue,
);
