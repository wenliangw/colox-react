import { useContext } from 'react';
import { RadioGroupContext } from '../context';
import type { RadioGroupContextValue } from '../types';

/**
 * The single protected outlet for the Radio.Group context: members
 * derive their checked state, name and disabled inheritance through it
 * — no consumer reads RadioGroupContext directly. Unlike parts that
 * require a root, a bare <Radio> outside any group is fully valid
 * usage, so there is no warning here: the static default makes every
 * group feature a no-op and the unmounted consumer behaves as a plain
 * radio.
 */
export const useRadioGroupContext = (): RadioGroupContextValue => useContext(RadioGroupContext);
