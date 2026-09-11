import { forwardRef, useMemo } from 'react';
import clsx from 'clsx';
import { CheckboxGroupContext } from '../../context';
import { useCheckboxGroup } from '../../hooks/use-checkbox-group';
import type { CheckboxGroupContextValue, CheckboxGroupProps, CheckboxGroupRef } from '../../types';

/**
 * The multi-select container: owns the selection array (symmetric
 * control — `value` / `defaultValue` + `onChange`), lays members out
 * in a column and hands each member its checked state, shared `size`,
 * `name` and disabled inheritance through context. A checkbox
 * participates by declaring a `value` without its own checked control
 * (see `resolveCheckboxState`); explicit checked members stay
 * independent.
 */
export const CheckboxGroup = forwardRef<CheckboxGroupRef, CheckboxGroupProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    size = 'md',
    disabled = false,
    name = '',
    className,
    style,
    children,
    ...rest
  } = props;

  const group = useCheckboxGroup({ value, defaultValue, onChange });
  const contextValue = useMemo<CheckboxGroupContextValue>(
    () => ({
      value: group.value,
      onChange: group.toggleValue,
      name,
      size,
      disabled,
    }),
    [group.value, group.toggleValue, name, size, disabled],
  );

  return (
    <div
      ref={ref}
      role="group"
      className={clsx('colox-checkbox-group', className)}
      style={style}
      {...rest}
    >
      <CheckboxGroupContext.Provider value={contextValue}>{children}</CheckboxGroupContext.Provider>
    </div>
  );
});
