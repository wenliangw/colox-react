import { forwardRef, useImperativeHandle, useRef } from 'react';
import clsx from 'clsx';
import type { InputProps, InputRef } from './types';
import { useInputFilter } from './hooks/use-input-filter';
import { usePasswordVisibility } from './hooks/use-password-visibility';
import { resolveInputSlots } from './utils/resolve-input-slots';
import { ClearButton } from './controls/clear-button';
import { VisibilityToggle } from './controls/visibility-toggle';
import { inputVariants } from './variants';

import './styles/index.scss';

/**
 * Single-line text input wrapped in a group shell: the shell carries the
 * visual contract (border, focus ring, size, disabled/invalid state), the
 * inner control stays a bare native input — the ref and all native
 * input attributes/events land there. Slots ride alongside the control:
 * `leading`/`trailing` accept any ReactNode (icons render at
 * 1em/currentColor, inheriting the input's size and color), plus the
 * built-in controls: `clearable`, the password visibility toggle
 * (`allowTogglePassword` + `type="password"`) and the automatic search
 * leading icon. `filterPattern` restricts committed user transitions to
 * the pattern language (see `useInputFilter`).
 */
export const Input = forwardRef<InputRef, InputProps>((props, ref) => {
  const {
    size,
    invalid = false,
    leading,
    trailing,
    clearable = false,
    allowTogglePassword = false,
    clearIcon,
    eyeIcon,
    eyeOffIcon,
    filterPattern,
    type,
    value,
    defaultValue,
    onChange,
    onCompositionStart,
    onCompositionEnd,
    className,
    style,
    disabled,
    readOnly,
    ...rest
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const isControlled = value !== undefined;
  const filter = useInputFilter({
    inputRef,
    filterPattern,
    restoreValue: String(value ?? defaultValue ?? ''),
    isControlled,
    onChange,
  });
  const visibility = usePasswordVisibility({ type, allowTogglePassword });
  const slots = resolveInputSlots({
    type,
    leading,
    trailing,
    clearable,
    disabled,
    readOnly,
    toggleActive: visibility.active,
  });

  return (
    <div
      className={clsx(
        inputVariants({ size }),
        { 'colox-input--invalid': invalid, 'colox-input--disabled': disabled },
        className,
      )}
      style={style}
    >
      {slots.searchLeading !== undefined && (
        <span className="colox-input__leading">{slots.searchLeading}</span>
      )}
      <input
        ref={inputRef}
        className="colox-input__control"
        type={visibility.resolvedType}
        aria-invalid={invalid || undefined}
        value={value}
        defaultValue={defaultValue}
        onChange={filter.handleChange}
        onCompositionStart={(event) => {
          filter.handleCompositionStart();
          onCompositionStart?.(event);
        }}
        onCompositionEnd={(event) => {
          filter.handleCompositionEnd();
          onCompositionEnd?.(event);
        }}
        disabled={disabled}
        readOnly={readOnly}
        {...rest}
      />
      {slots.showTrailing && (
        <span className="colox-input__trailing">
          {trailing}
          {slots.showClear && <ClearButton onClear={filter.handleClear} icon={clearIcon} />}
          {visibility.active && (
            <VisibilityToggle
              revealed={visibility.revealed}
              onToggle={visibility.toggle}
              eyeIcon={eyeIcon}
              eyeOffIcon={eyeOffIcon}
              disabled={disabled}
            />
          )}
        </span>
      )}
    </div>
  );
});
