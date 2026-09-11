import { createContext } from 'react';
import type { CheckboxGroupContextValue } from '../types';

const changeNoop = (): undefined => undefined;

/** The static snapshot served when no <Checkbox.Group> is mounted. */
export const defaultCheckboxGroupContextValue: CheckboxGroupContextValue = {
  value: [],
  onChange: changeNoop,
  name: '',
  // The family default an ungrouped checkbox and an unsized group land
  // on: members resolve size against this when neither sets their own.
  size: 'md',
  disabled: false,
};

/**
 * The context behind useCheckboxGroupContext, consumed only through that
 * hook and provided only by the <Checkbox.Group> root.
 */
export const CheckboxGroupContext = createContext<CheckboxGroupContextValue>(
  defaultCheckboxGroupContextValue,
);
