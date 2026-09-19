import { forwardRef } from 'react';
import clsx from 'clsx';
import { useFormFieldContext } from '../../context';
import type { FormHintProps } from '../../types';

/**
 * The field's helper line: one line of expected-value guidance under
 * the control. It yields to the error: while the field is invalid the
 * hint disappears so the error owns that slot, and the control's
 * `aria-describedby` follows the visible line.
 */
export const FormHint = forwardRef<HTMLDivElement, FormHintProps>((props, ref) => {
  const { children, className, ...rest } = props;
  const field = useFormFieldContext();

  if (field.invalid) {
    return null;
  }

  return (
    <div ref={ref} id={field.hintId} className={clsx('colox-form-hint', className)} {...rest}>
      {children}
    </div>
  );
});

FormHint.displayName = 'Form.Hint';
