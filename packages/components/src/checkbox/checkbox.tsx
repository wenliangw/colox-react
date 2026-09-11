import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { ChangeEvent } from 'react';
import clsx from 'clsx';
import { IconCheck } from '@colox/icons';
import type { CheckboxProps, CheckboxRef } from './types';
import { CheckboxGroup } from './children/group';
import { useCheckboxGroupContext } from './hooks/use-checkbox-group-context';
import { useIndeterminate } from './hooks/use-indeterminate';
import { resolveCheckboxState } from './utils/resolve-checkbox-state';
import { checkboxVariants } from './variants';

import './styles/index.scss';

/**
 * Single checkbox on a native `<label>` root: the control IS the native
 * input (the ref, attributes and events all land there), drawn as the
 * box via appearance none with the mark overlaid. `children` render as
 * the label. States: checked (brand solid + inverse check),
 * `indeterminate` (a bar — visual only, `checked` stays the truth) and
 * `invalid` (red border/ring, same channel as Input). Size tiers share
 * the Button/Input design language (xs/sm/md/lg). Inside a
 * `<Checkbox.Group>`, a `value` without its own checked control joins
 * the group's selection array (see `resolveCheckboxState`).
 */
const CheckboxRoot = forwardRef<CheckboxRef, CheckboxProps>((props, ref) => {
  const {
    size,
    invalid = false,
    indeterminate = false,
    value: memberValue,
    checked,
    defaultChecked,
    onChange,
    name,
    disabled,
    children,
    className,
    style,
    ...rest
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
  useIndeterminate({ inputRef, indeterminate });

  const group = useCheckboxGroupContext();
  const state = resolveCheckboxState({
    memberValue,
    checked,
    defaultChecked,
    disabled,
    name,
    size,
    group,
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (state.groupMember && memberValue !== undefined) {
      group.onChange(memberValue);
    }
    onChange?.(event);
  };

  return (
    <label
      className={clsx(
        checkboxVariants({ size: state.size }),
        { 'colox-checkbox--invalid': invalid, 'colox-checkbox--disabled': state.disabled },
        className,
      )}
      style={style}
    >
      <span className="colox-checkbox__box">
        <input
          ref={inputRef}
          className="colox-checkbox__control"
          type="checkbox"
          aria-invalid={invalid || undefined}
          value={memberValue}
          name={state.name}
          checked={state.checked}
          defaultChecked={state.groupMember ? undefined : defaultChecked}
          disabled={state.disabled}
          onChange={handleChange}
          {...rest}
        />
        <span className="colox-checkbox__mark" aria-hidden="true">
          <IconCheck className="colox-checkbox__mark-check" />
          <span className="colox-checkbox__mark-bar" />
        </span>
      </span>
      {children !== undefined && <span className="colox-checkbox__label">{children}</span>}
    </label>
  );
});

export type CheckboxComponent = typeof CheckboxRoot & {
  Group: typeof CheckboxGroup;
};

export const Checkbox: CheckboxComponent = Object.assign(CheckboxRoot, { Group: CheckboxGroup });
