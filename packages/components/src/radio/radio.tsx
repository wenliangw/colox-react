import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { ChangeEvent } from 'react';
import clsx from 'clsx';
import type { RadioProps, RadioRef } from './types';
import { RadioGroup } from './children/group';
import { useRadioGroupContext } from './hooks/use-radio-group-context';
import { resolveRadioState } from './utils/resolve-radio-state';
import { radioVariants } from './variants';

import './styles/index.scss';

/**
 * Single radio on a native `<label>` root: the control IS the native
 * input (the ref, attributes and events all land there), drawn as the
 * circle via appearance none with the dot overlaid. `children` render
 * as the label. States: checked (brand ring + brand dot — the classic
 * ring model, so the radio stays distinct from the filled checkbox)
 * and `invalid` (red border/ring on the unfilled state only, same
 * channel and priority as Checkbox). Size tiers share the
 * Button/Input/Checkbox design language (xs/sm/md/lg). Inside a
 * `<Radio.Group>`, a `value` without its own checked control joins the
 * group's single selection (see `resolveRadioState`).
 */
const RadioRoot = forwardRef<RadioRef, RadioProps>((props, ref) => {
  const {
    size,
    invalid = false,
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

  const group = useRadioGroupContext();
  const state = resolveRadioState({
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
      group.onChange(memberValue, event);
    }
    onChange?.(event);
  };

  return (
    <label
      className={clsx(
        radioVariants({ size: state.size }),
        { 'colox-radio--invalid': invalid, 'colox-radio--disabled': state.disabled },
        className,
      )}
      style={style}
    >
      <span className="colox-radio__box">
        <input
          ref={inputRef}
          className="colox-radio__control"
          type="radio"
          aria-invalid={invalid || undefined}
          value={memberValue}
          name={state.name}
          checked={state.checked}
          defaultChecked={state.groupMember ? undefined : defaultChecked}
          disabled={state.disabled}
          onChange={handleChange}
          {...rest}
        />
        <span className="colox-radio__mark" aria-hidden="true" />
      </span>
      {children !== undefined && <span className="colox-radio__label">{children}</span>}
    </label>
  );
});

export type RadioComponent = typeof RadioRoot & {
  Group: typeof RadioGroup;
};

export const Radio: RadioComponent = Object.assign(RadioRoot, { Group: RadioGroup });
