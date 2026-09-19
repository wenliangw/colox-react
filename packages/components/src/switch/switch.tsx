import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { ChangeEvent } from 'react';
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
 * render as the label. States: checked (palette solid track — brand
 * by default), `invalid` (red border/ring on the off state, same
 * channel as Checkbox), read-only (the value is pinned while the
 * control stays focusable and readable) and disabled. Size tiers share
 * the
 * Button/Input/Checkbox design language (xs/sm/md/lg).
 */
const SwitchRoot = forwardRef<SwitchRef, SwitchProps>((props, ref) => {
  const {
    size,
    palette,
    invalid = false,
    readOnly = false,
    checked,
    defaultChecked,
    disabled,
    children,
    className,
    style,
    onChange,
    ...rest
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  // Read-only keeps the switch focusable and readable while the value
  // stays put: a change event means the browser has already toggled,
  // so revert it and publish nothing.
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (readOnly) {
      event.target.checked = !event.target.checked;
      return;
    }
    onChange?.({ event, value: event.target.checked });
  };

  return (
    <label
      className={clsx(
        switchVariants({ size, palette }),
        {
          'colox-switch--invalid': invalid,
          'colox-switch--readonly': readOnly,
          'colox-switch--disabled': disabled,
        },
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
          aria-readonly={readOnly || undefined}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={handleChange}
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
