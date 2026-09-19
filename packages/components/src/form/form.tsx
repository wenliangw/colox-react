import { forwardRef, useMemo } from 'react';
import type { FormEvent } from 'react';
import clsx from 'clsx';
import { Stack } from '../stack';
import { FormContext } from './context';
import { useForm } from './hooks/use-form';
import type { FormContextValue, FormProps, FormValidateOn } from './types';
import { FormField } from './children/field';
import { FormHint } from './children/hint';
import { FormLabel } from './children/label';
import { FormValidate } from './children/validate';

import './styles/index.scss';

const DEFAULT_VALIDATE_ON: readonly FormValidateOn[] = ['submit', 'blur'];

/**
 * The form root: a native `<form>` with native validation off (this
 * layer owns it) holding the store, the validation policy and the
 * layout defaults. Its fields lay out as a column through Stack — the
 * family's token-keyed spacing vocabulary rather than a second layout
 * system — so the root reads as one vertical rhythm and anything
 * fancier (sections, side-by-side rows) composes with
 * Container/Grid/Stack around the fields. Submitting validates every
 * field and hands the values over only when all rules pass; a failing
 * form reports its errors instead.
 */
const FormRoot = forwardRef<HTMLFormElement, FormProps>((props, ref) => {
  const {
    form,
    validateOn,
    labelPlacement = 'top',
    labelWidth = '24',
    gap = '4',
    className,
    children,
    onSubmit,
    onInvalid,
    ...rest
  } = props;

  const ownStore = useForm();
  const store = form ?? ownStore;

  const policy = useMemo<readonly FormValidateOn[]>(
    () => (validateOn === undefined ? DEFAULT_VALIDATE_ON : [validateOn].flat()),
    [validateOn],
  );

  const contextValue = useMemo<FormContextValue>(
    () => ({ store, validateOn: policy, labelPlacement, labelWidth }),
    [store, policy, labelPlacement, labelWidth],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = await store.validate();
    if (!store.isValid()) {
      onInvalid?.({ event, errors });
      return;
    }
    onSubmit?.({ event, values: store.getValues() });
  };

  return (
    <form
      ref={ref}
      className={clsx('colox-form', className)}
      noValidate
      onSubmit={handleSubmit}
      {...rest}
    >
      <FormContext.Provider value={contextValue}>
        <Stack direction="column" gap={gap}>
          {children}
        </Stack>
      </FormContext.Provider>
    </form>
  );
});

type FormComponent = typeof FormRoot & {
  Field: typeof FormField;
  Label: typeof FormLabel;
  Hint: typeof FormHint;
  Validate: typeof FormValidate;
};

export const Form: FormComponent = Object.assign(FormRoot, {
  Field: FormField,
  Label: FormLabel,
  Hint: FormHint,
  Validate: FormValidate,
});
