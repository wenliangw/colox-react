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
 *
 * The label splits into the required mark and a text slot: the star
 * rides outside the text, so the column's text alignment (`labelAlign`,
 * `justify` included) spreads the text alone and the mark stays glued
 * to it. The mark renders while some `Form.Validate required` leaf
 * declares the field required, before or after the text per the
 * field's `requiredMarkPosition`; `requiredMark={false}` hides it on
 * this label only.
 */
export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>((props, ref) => {
  const { children, className, requiredMark = true, ...rest } = props;
  const field = useFormFieldContext();

  const mark =
    field.required && requiredMark ? (
      // The glyph comes from CSS (content), not from a text node — the
      // label's text stays what the author wrote (labelled queries and
      // the aria-labelledby path read the clean text), and the empty
      // box still keeps the star outside the text slot so the justify
      // alignment spreads the text alone.
      <span className="colox-form-label__required" aria-hidden="true" />
    ) : null;

  return (
    <label
      ref={ref}
      className={clsx('colox-form-label', className)}
      htmlFor={field.labelledBy ? undefined : field.controlId}
      id={field.labelledBy ? field.labelId : undefined}
      {...rest}
    >
      {field.requiredMarkPosition === 'start' ? mark : null}
      <span className="colox-form-label__text">{children}</span>
      {field.requiredMarkPosition === 'end' ? mark : null}
    </label>
  );
});

FormLabel.displayName = 'Form.Label';
