import { forwardRef } from 'react';
import { useFormFieldContext } from '../../context';
import type { FormValidateProps } from '../../types';

/**
 * One validation rule (or a small ordered set) for the field it lives
 * in, and the error line it owns. Rules run in declaration order across
 * the field's leaves and only the first failure shows — this leaf
 * renders the message when it is the one that failed, so the error can
 * sit wherever the author put the leaf.
 */
export const FormValidate = forwardRef<HTMLDivElement, FormValidateProps>((props, ref) => {
  const { ruleIndex } = props;
  const field = useFormFieldContext();

  if (field.error === undefined || ruleIndex !== field.errorLeaf) {
    return null;
  }

  return (
    <div ref={ref} id={field.errorId} className="colox-form-error" role="alert">
      {field.error}
    </div>
  );
});

FormValidate.displayName = 'Form.Validate';
