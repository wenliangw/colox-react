import { createContext } from 'react';
import type { RadioGroupContextValue } from '../types';

const selectNoop = (): undefined => undefined;

/** The static snapshot served when no <Radio.Group> is mounted. */
export const defaultRadioGroupContextValue: RadioGroupContextValue = {
  value: '',
  selectValue: selectNoop,
  name: '',
  groupDisabled: false,
};

/**
 * The context behind useRadioGroupContext, consumed only through that
 * hook and provided only by the <Radio.Group> root.
 */
export const RadioGroupContext = createContext<RadioGroupContextValue>(
  defaultRadioGroupContextValue,
);
