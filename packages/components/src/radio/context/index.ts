import { createContext } from 'react';
import type { RadioGroupContextValue } from '../types';

const changeNoop = (): undefined => undefined;

/** The static snapshot served when no <Radio.Group> is mounted. */
export const defaultRadioGroupContextValue: RadioGroupContextValue = {
  value: '',
  onChange: changeNoop,
  name: '',
  // The family default an ungrouped radio and an unsized group land
  // on: members resolve size against this when neither sets their own.
  size: 'md',
  disabled: false,
};

/**
 * The context behind useRadioGroupContext, consumed only through that
 * hook and provided only by the <Radio.Group> root.
 */
export const RadioGroupContext = createContext<RadioGroupContextValue>(
  defaultRadioGroupContextValue,
);
