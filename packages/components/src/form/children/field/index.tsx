import { cloneElement, forwardRef, useEffect, useId, useMemo } from 'react';
import type { ReactElement } from 'react';
import { Stack } from '../../../stack';
import {
  FormFieldContext,
  useFormContext,
  useFormError,
  useFormErrorLeaf,
  useFormValue,
} from '../../context';
import type { FormControlProps, FormFieldContextValue, FormFieldProps } from '../../types';
import { formFieldVariants } from '../../variants';
import { buildRuleRunner, walkFormLeaves } from '../../utils/walk-form-leaves';
import { isBooleanControl, isGroupControl } from '../../utils/resolve-control-kind';
import { resolveEmptyValue } from '../../utils/resolve-empty-value';
import { readPayloadValue } from '../../utils/read-payload-value';

/**
 * The field: one store name, one control and the members around it. It
 * renders the field container (the family Stack skeleton, direction
 * following the label placement), wires the label to the control, and
 * injects the controlled value plus the change channel into its single
 * control child — `checked` for the boolean leaves (Checkbox / Switch /
 * Radio, whose `value` is a string form token), `value` for every other
 * domain. Rules come from the `Form.Validate` leaves and are registered
 * with the store.
 */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>((props, ref) => {
  const {
    name,
    labelPlacement: labelPlacementProp,
    labelWidth: labelWidthProp,
    className,
    style,
    children,
    ...rest
  } = props;

  const { store, labelPlacement, labelWidth, validateOn } = useFormContext();
  const placement = labelPlacementProp ?? labelPlacement;
  const width = labelWidthProp ?? labelWidth;

  const leaves = useMemo(() => walkFormLeaves(children), [children]);
  const runner = useMemo(() => buildRuleRunner(leaves.validators), [leaves.validators]);
  const control = leaves.control as ReactElement<FormControlProps>;
  const controlProps = control.props;

  const uid = useId();
  const controlId = controlProps.id ?? `${uid}-control`;
  const labelId = `${uid}-label`;
  const hintId = `${uid}-hint`;
  const errorId = `${uid}-error`;

  const booleanControl = isBooleanControl(control);
  const groupControl = isGroupControl(control);
  const emptyWord = useMemo(() => resolveEmptyValue(control), [control]);

  const value = useFormValue(store, name);
  const error = useFormError(store, name);
  const errorLeaf = useFormErrorLeaf(store, name);
  const invalid = error !== undefined;

  // Rules register once per field shape: the store runs them on submit,
  // the field runs them on its own triggers, both through one runner.
  useEffect(
    () => store.registerField(name, { runRules: runner.runRules, deps: runner.deps }),
    [store, name, runner],
  );

  // The first value the control shows: the author's uncontrolled seed
  // when declared, the family's empty word for its domain otherwise.
  // Injecting it from the very first render keeps the control controlled
  // for its whole life (no uncontrolled-to-controlled switch), and the
  // mount effect puts the same value into the store so validation and
  // submit see it without an edit.
  const seed = controlProps.defaultValue ?? controlProps.defaultChecked ?? emptyWord;
  const current = value === undefined ? seed : value;

  useEffect(() => {
    if (store.getValue(name) === undefined) {
      store.setValue(name, seed);
    }
  }, [name, seed, store]);

  const handleChange = (payload: unknown) => {
    store.setValue(name, readPayloadValue(payload));
    if (validateOn.includes('change')) {
      void store.validateField(name);
    }
    controlProps.onChange?.(payload);
  };

  const handleBlur = (event: unknown) => {
    if (validateOn.includes('blur')) {
      void store.validateField(name);
    }
    controlProps.onBlur?.(event);
  };

  const describedBy =
    [
      leaves.hints.length > 0 && !invalid ? hintId : null,
      invalid && errorLeaf >= 0 ? errorId : null,
    ]
      .filter((id): id is string => id !== null)
      .join(' ') || undefined;

  const injected: FormControlProps = {
    id: controlId,
    name,
    invalid,
    'aria-describedby': describedBy,
    onChange: handleChange,
    onBlur: handleBlur,
    // The field takes the uncontrolled seed over: keeping it next to the
    // injected controlled word would put both on the native element.
    defaultValue: undefined,
    defaultChecked: undefined,
  };
  if (groupControl) {
    injected['aria-labelledby'] = labelId;
  }
  if (booleanControl) {
    injected.checked = Boolean(current);
  } else {
    injected.value = current;
  }

  const controlNode = cloneElement(control, injected);
  const messages = (
    <>
      {leaves.hints.map((hint, index) => cloneElement(hint, { key: hint.key ?? index }))}
      {leaves.validators.map((leaf, index) =>
        cloneElement(leaf, { key: leaf.key ?? `rule-${index}`, ruleIndex: index }),
      )}
    </>
  );

  const contextValue: FormFieldContextValue = {
    name,
    controlId,
    labelId,
    hintId,
    errorId,
    invalid,
    error,
    errorLeaf,
    labelledBy: groupControl,
  };

  const fieldClassName = formFieldVariants({
    labelPlacement: placement,
    labelWidth: width,
    className,
  });

  let body: ReactElement;
  if (placement === 'start') {
    body = (
      <Stack
        ref={ref}
        direction="row"
        align="start"
        gap="3"
        className={fieldClassName}
        style={style}
        {...rest}
      >
        <span className="colox-form__label-slot">{leaves.label}</span>
        <Stack direction="column" gap="1-5" className="colox-form__control-slot">
          {controlNode}
          {messages}
        </Stack>
      </Stack>
    );
  } else {
    body = (
      <Stack
        ref={ref}
        direction="column"
        gap="1-5"
        className={fieldClassName}
        style={style}
        {...rest}
      >
        {leaves.label}
        {controlNode}
        {messages}
      </Stack>
    );
  }

  return <FormFieldContext.Provider value={contextValue}>{body}</FormFieldContext.Provider>;
});

FormField.displayName = 'Form.Field';
