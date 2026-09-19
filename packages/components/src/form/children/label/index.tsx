import { forwardRef } from 'react';
import clsx from 'clsx';
import { useFormFieldContext } from '../../context';
import type { FormLabelProps } from '../../types';

/**
 * The field's label: a native `<label>` wired to the field's control.
 * A labelable control takes `htmlFor`; a group control (a group-shaped
 * div, not a labelable element) cannot be the target of one, so the
 * label carries its own id and the group announces it through
 * `aria-labelledby` instead — the label lands on whatever the field
 * actually controls.
 */
export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>((props, ref) => {
  const { children, className, ...rest } = props;
  const field = useFormFieldContext();

  return (
    <label
      ref={ref}
      className={clsx('colox-form-label', className)}
      htmlFor={field.labelledBy ? undefined : field.controlId}
      id={field.labelledBy ? field.labelId : undefined}
      {...rest}
    >
      {children}
    </label>
  );
});

FormLabel.displayName = 'Form.Label';
