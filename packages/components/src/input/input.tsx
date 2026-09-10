import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import clsx from 'clsx';
import { IconSearch } from '@colox/icons';
import type { InputProps, InputRef } from './types';
import { useInputFilter } from './utils/use-input-filter';
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
  const restoreValue = String(value ?? defaultValue ?? '');
  const { handleChange, handleClear, handleCompositionStart, handleCompositionEnd } =
    useInputFilter({ inputRef, filterPattern, restoreValue, isControlled, onChange });

  const [revealed, setRevealed] = useState(false);
  const passwordToggleOn = allowTogglePassword && type === 'password';
  const resolvedType = passwordToggleOn && revealed ? 'text' : type;
  const searchLeading = type === 'search' ? (leading ?? <IconSearch />) : leading;
  const showClear = clearable && !disabled && !readOnly;
  const showTrailing = trailing !== undefined || showClear || passwordToggleOn;

  return (
    <div
      className={clsx(
        inputVariants({ size }),
        { 'colox-input--invalid': invalid, 'colox-input--disabled': disabled },
        className,
      )}
      style={style}
    >
      {searchLeading !== undefined && <span className="colox-input__leading">{searchLeading}</span>}
      <input
        ref={inputRef}
        className="colox-input__control"
        type={resolvedType}
        aria-invalid={invalid || undefined}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        onCompositionStart={(event) => {
          handleCompositionStart();
          onCompositionStart?.(event);
        }}
        onCompositionEnd={(event) => {
          handleCompositionEnd();
          onCompositionEnd?.(event);
        }}
        disabled={disabled}
        readOnly={readOnly}
        {...rest}
      />
      {showTrailing && (
        <span className="colox-input__trailing">
          {trailing}
          {showClear && <ClearButton onClear={handleClear} icon={clearIcon} />}
          {passwordToggleOn && (
            <VisibilityToggle
              revealed={revealed}
              onToggle={() => setRevealed((current) => !current)}
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
