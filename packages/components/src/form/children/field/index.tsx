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
    labelAlign: labelAlignProp,
    requiredMarkPosition: requiredMarkPositionProp,
    validateOn: validateOnProp,
    colon: colonProp,
    className,
    style,
    children,
    ...rest
  } = props;

  const {
    store,
    labelPlacement,
    labelWidth,
    labelAlign,
    requiredMarkPosition,
    validateOn,
    size,
    disabled: formDisabled,
    colon,
    onValuesChange,
  } = useFormContext();
  const placement = labelPlacementProp ?? labelPlacement;
  const width = labelWidthProp ?? labelWidth;
  const align = labelAlignProp ?? labelAlign;
  const markPosition = requiredMarkPositionProp ?? requiredMarkPosition;
  const policy = validateOnProp ?? validateOn;
  const colonOn = colonProp ?? colon;

  const leaves = useMemo(() => walkFormLeaves(children), [children]);
  const runner = useMemo(() => buildRuleRunner(leaves.validators), [leaves.validators]);
  const control = leaves.control as ReactElement<FormControlProps>;
  const controlProps = control.props;

  // A field is required when some rule leaf declares it — the label's
  // mark and the control's aria-required both read this one verdict.
  const required = useMemo(
    () => leaves.validators.some((leaf) => leaf.props.required),
    [leaves.validators],
  );

  const uid = useId();
  const controlId = controlProps.id ?? `${uid}-control`;
  const labelId = `${uid}-label`;
  const hintId = `${uid}-hint`;
  const errorId = `${uid}-error`;
  // One id per hint (the naught keeps the bare id): several hints must
  // not share a DOM id, and described-by names them all.
  const hintIds = leaves.hints.map((_, index) => (index === 0 ? hintId : `${hintId}-${index}`));

  const booleanControl = isBooleanControl(control);
  const groupControl = isGroupControl(control);
  const emptyWord = useMemo(() => resolveEmptyValue(control), [control]);

  const value = useFormValue(store, name);
  const error = useFormError(store, name);
  const errorLeaf = useFormErrorLeaf(store, name);
  const invalid = error !== undefined;

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

  // Rules register once per field shape: the store runs them on submit,
  // the field runs them on its own triggers, both through one runner.
  // The registration also carries the field's first value (the seed) —
  // `reset()` consults it only where the restored map is missing the
  // field, so initial values and explicit reset arguments win — and the
  // focus handle behind the failed-submit landing.
  useEffect(() => {
    const focus = () => {
      const element = document.getElementById(controlId);
      element?.scrollIntoView?.({ block: 'nearest' });
      element?.focus?.({ preventScroll: true });
    };
    return store.registerField(name, { runRules: runner.runRules, deps: runner.deps, seed, focus });
  }, [store, name, runner, seed, controlId]);

  const handleChange = (payload: unknown) => {
    const next = readPayloadValue(payload);
    store.setValue(name, next);
    // The report is the echo of the interaction: only the user-edit
    // channel produces it, with the post-write snapshot.
    onValuesChange?.({ name, value: next, values: store.getValues() });
    if (policy.includes('change')) {
      void store.validateField(name);
    }
    controlProps.onChange?.(payload);
  };

  const handleBlur = (event: unknown) => {
    if (policy.includes('blur')) {
      void store.validateField(name);
    }
    controlProps.onBlur?.(event);
  };

  // The hint lines own the description slot while the field is valid; an
  // error swaps it to the error line (the hints yield to it). Several
  // hints are all named — assistive tech hears each line.
  const describedBy = invalid
    ? errorLeaf >= 0
      ? errorId
      : undefined
    : hintIds.join(' ') || undefined;

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
  if (required) {
    // Only injected while required: an `aria-required: undefined` key
    // would shadow an author's own aria-required on the control.
    injected['aria-required'] = 'true';
  }
  if (formDisabled) {
    // The form-wide lock, sticky like the groups' disabled inheritance —
    // no field exits it. Only injected while set: an undefined key
    // would shadow an author's own disabled prop.
    injected.disabled = true;
  }
  if (size !== undefined && controlProps.size === undefined) {
    // The form-wide control size: a state class — the control's own
    // declared size wins (unlike disabled, there is no lock), and the
    // key only lands while the control stayed silent.
    injected.size = size;
  }

  const controlNode = cloneElement(control, injected);
  const messages = (
    <>
      {leaves.hints.map((hint, index) =>
        cloneElement(hint, { key: hint.key ?? index, hintIndex: index }),
      )}
      {leaves.validators.map((leaf, index) =>
        cloneElement(leaf, { key: leaf.key ?? `rule-${index}`, ruleIndex: index }),
      )}
    </>
  );

  const contextValue: FormFieldContextValue = {
    name,
    controlId,
    labelId,
    hintIds,
    errorId,
    invalid,
    error,
    errorLeaf,
    labelledBy: groupControl,
    required,
    requiredMarkPosition: markPosition,
    colon: colonOn,
  };

  const fieldClassName = formFieldVariants({
    labelPlacement: placement,
    labelAlign: align,
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
