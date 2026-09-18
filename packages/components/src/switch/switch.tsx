import { forwardRef, useImperativeHandle, useRef } from 'react';
import clsx from 'clsx';
import type { SwitchProps, SwitchRef } from './types';
import { switchVariants } from './variants';

import './styles/index.scss';

/**
 * Single boolean switch on a native `<label>` root: the control IS the
 * native checkbox input (the ref, name/value and events all land
 * there), dressed as the track via appearance none with the thumb
 * overlaid — `role="switch"` tells assistive tech the toggle
 * semantics, the native form keeps its zero-cost path. `children`
 * render as the label. States: checked (brand solid track), `invalid`
 * (red border/ring on the off state, same channel as Checkbox) and
 * disabled. Size tiers share the Button/Input/Checkbox design language
 * (xs/sm/md/lg).
 */
const SwitchRoot = forwardRef<SwitchRef, SwitchProps>((props, ref) => {
  const {
    size,
    invalid = false,
    checked,
    defaultChecked,
    onChange,
    disabled,
    children,
    className,
    style,
    ...rest
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  return (
    <label
      className={clsx(
        switchVariants({ size }),
        { 'colox-switch--invalid': invalid, 'colox-switch--disabled': disabled },
        className,
      )}
      style={style}
    >
      <span className="colox-switch__box">
        <input
          ref={inputRef}
          className="colox-switch__control"
          type="checkbox"
          role="switch"
          aria-invalid={invalid || undefined}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={onChange}
          {...rest}
        />
        <span className="colox-switch__thumb" aria-hidden="true" />
      </span>
      {children !== undefined && <span className="colox-switch__label">{children}</span>}
    </label>
  );
});

SwitchRoot.displayName = 'Switch';

export const Switch = SwitchRoot;
