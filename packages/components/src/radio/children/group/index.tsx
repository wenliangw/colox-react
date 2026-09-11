import { forwardRef, useMemo } from 'react';
import clsx from 'clsx';
import { RadioGroupContext } from '../../context';
import { useRadioGroup } from '../../hooks/use-radio-group';
import type { RadioGroupContextValue, RadioGroupProps, RadioGroupRef } from '../../types';

/**
 * The single-select container: owns the selection value (symmetric
 * control — `value` / `defaultValue` + `onChange`), lays members out
 * in a column and hands each member its checked state, shared `name`
 * and disabled inheritance through context. A radio participates by
 * declaring a `value` without its own checked control (see
 * `resolveRadioState`); explicit checked members stay independent.
 */
export const RadioGroup = forwardRef<RadioGroupRef, RadioGroupProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    disabled = false,
    name = '',
    className,
    style,
    children,
    ...rest
  } = props;

  const group = useRadioGroup({ value, defaultValue, onChange });
  const contextValue = useMemo<RadioGroupContextValue>(
    () => ({ value: group.value, selectValue: group.selectValue, name, groupDisabled: disabled }),
    [group.value, group.selectValue, name, disabled],
  );

  return (
    <div
      ref={ref}
      role="radiogroup"
      className={clsx('colox-radio-group', className)}
      style={style}
      {...rest}
    >
      <RadioGroupContext.Provider value={contextValue}>{children}</RadioGroupContext.Provider>
    </div>
  );
});
