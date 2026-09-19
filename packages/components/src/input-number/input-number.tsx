import { forwardRef, useImperativeHandle, useRef } from 'react';
import clsx from 'clsx';
import { InputControl } from '@colox/cdk/input-control';
import { Stepper } from './controls/stepper';
import { useInputNumber } from './hooks/use-input-number';
import type { InputNumberProps, InputNumberRef } from './types';
import { inputNumberVariants } from './variants';

import './styles/index.scss';

/**
 * Single-line number editor on a text input (`inputmode="decimal"`,
 * so mobile keyword boards surface): the control is a bare native
 * input carrying a `spinbutton` role, and the built-in stepper strip
 * (chevron up/down) sits at the trailing edge — both step by
 * `step`. The onChange payload is the number input's own event face —
 * `{ event, value }` with the committed number (or `null` when
 * emptied) already parsed; partial drafts never notify and blur rolls
 * them back, clamps into `[min, max]`, and shrinks the display to its
 * canonical form. Size tiers share the family row heights
 * (xs/sm/md/lg) and the Step results carry the step's decimal
 * precision.
 */
const InputNumberRoot = forwardRef<InputNumberRef, InputNumberProps>((props, ref) => {
  const {
    size,
    invalid = false,
    value,
    defaultValue,
    min,
    max,
    step = 1,
    disabled,
    readOnly,
    className,
    style,
    onChange,
    onBlur,
    onKeyDown,
    ...rest
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const editor = useInputNumber({
    inputRef,
    value,
    defaultValue,
    min,
    max,
    step,
    onChange,
    onBlur,
    onKeyDown,
  });

  return (
    <div
      className={clsx(
        inputNumberVariants({ size }),
        { 'colox-input-number--invalid': invalid, 'colox-input-number--disabled': disabled },
        className,
      )}
      style={style}
    >
      <InputControl
        ref={inputRef}
        className="colox-input-number__control"
        type="text"
        inputMode="decimal"
        role="spinbutton"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={editor.current === null ? undefined : editor.current}
        aria-invalid={invalid || undefined}
        value={editor.draft}
        onChange={editor.handleChange}
        onBlur={editor.handleBlur}
        onKeyDown={editor.handleKeyDown}
        disabled={disabled}
        readOnly={readOnly}
        {...rest}
      />
      {!readOnly && <Stepper onStep={editor.handleStep} disabled={disabled ?? false} />}
    </div>
  );
});

InputNumberRoot.displayName = 'InputNumber';

export const InputNumber = InputNumberRoot;
