import { Children, isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { FormFieldVerdict, FormHintProps, FormLabelProps, FormValidateProps } from '../types';
import { FormHint } from '../children/hint';
import { FormLabel } from '../children/label';
import { FormValidate } from '../children/validate';
import { runRules as runLeafRules } from './run-rules';

/** What a field's children resolve to: the members and the one control. */
export interface FormFieldLeaves {
  /** The field's label leaf, when declared. */
  label: ReactElement<FormLabelProps> | null;
  /** The single control the field injects into. */
  control: ReactElement;
  /** The hint leaves, in declaration order. */
  hints: ReactElement<FormHintProps>[];
  /** The rule leaves, in declaration order (the error-line order). */
  validators: ReactElement<FormValidateProps>[];
}

/**
 * A component-typed child is an acceptable control: only components can
 * honour the family change payload and the controlled value the field
 * injects. Host elements and fragments are wiring errors, like the
 * AutoComplete host slot.
 */
function isComponentTyped(element: ReactElement): boolean {
  const type = element.type;
  return typeof type === 'function' || typeof type === 'object';
}

function fail(message: string): never {
  throw new Error(message);
}

/**
 * Splits a `Form.Field`'s children into its members and its control by
 * component identity (the family walker precedent): `Form.Label` /
 * `Form.Hint` / `Form.Validate` are members, the remaining
 * component-typed element is the control. Zero or several controls,
 * several labels, fragments and non-element children are hard errors —
 * a field must know exactly which control it speaks through.
 */
export function walkFormLeaves(children: ReactNode): FormFieldLeaves {
  let label: ReactElement<FormLabelProps> | null = null;
  let control: ReactElement | null = null;
  const hints: ReactElement<FormHintProps>[] = [];
  const validators: ReactElement<FormValidateProps>[] = [];

  Children.forEach(children, (child) => {
    if (child === null || child === undefined || typeof child === 'boolean') {
      return;
    }
    if (typeof child === 'string' || typeof child === 'number') {
      return fail(
        'Form.Field children must be Form.Label, Form.Hint, Form.Validate and one control component.',
      );
    }
    if (!isValidElement(child)) {
      return fail('Form.Field children must be elements.');
    }
    if (child.type === FormLabel) {
      if (label !== null) {
        return fail('Form.Field accepts at most one Form.Label.');
      }
      label = child as ReactElement<FormLabelProps>;
      return;
    }
    if (child.type === FormHint) {
      hints.push(child as ReactElement<FormHintProps>);
      return;
    }
    if (child.type === FormValidate) {
      validators.push(child as ReactElement<FormValidateProps>);
      return;
    }
    if (!isComponentTyped(child)) {
      return fail(
        'Form.Field needs a component as its control (a host element or fragment cannot speak the form contract).',
      );
    }
    if (control !== null) {
      return fail('Form.Field accepts exactly one control child.');
    }
    control = child;
    return;
  });

  if (control === null) {
    fail('Form.Field requires exactly one control child.');
  }

  return { label, control, hints, validators };
}

/**
 * Folds a field's rule leaves into one runner: leaves run in order and
 * the first failing leaf's message wins, so the leaf that owns the
 * error is the leaf that renders the line. The runner also carries the
 * union of the leaves' `deps` for the store's dependency signal.
 */
export function buildRuleRunner(validators: readonly ReactElement<FormValidateProps>[]): {
  runRules: (value: unknown, values: Record<string, unknown>) => Promise<FormFieldVerdict>;
  deps: string[];
} {
  const deps = [...new Set(validators.flatMap((leaf) => [...(leaf.props.deps ?? [])]))];

  const runRules = async (
    value: unknown,
    values: Record<string, unknown>,
  ): Promise<FormFieldVerdict> => {
    for (let index = 0; index < validators.length; index += 1) {
      const leaf = validators[index];
      if (leaf === undefined) {
        continue;
      }
      const message = await runLeafRules(leaf.props, value, values);
      if (message !== undefined) {
        return { message, leaf: index };
      }
    }
    return { message: undefined, leaf: -1 };
  };

  return { runRules, deps };
}
