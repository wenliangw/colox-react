import type { FormFieldValidator, FormValidateProps } from '../types';

/**
 * Whether a value counts as empty for `required`. The empty word is
 * domain-specific — `''` for text, `null` for number/date, `[]` for a
 * selection, `false` for a boolean — so the judgement accepts all of
 * them and the consumer writes one rule.
 */
export function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null || value === '') {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return value === false;
}

/** One rule's failure verdict: the message, or nothing when it passes. */
type RuleVerdict = string | undefined;

function runRequired(value: unknown, message: string | undefined): RuleVerdict {
  return isEmptyValue(value) ? (message ?? '此项为必填') : undefined;
}

function runPattern(value: unknown, pattern: RegExp, message: string | undefined): RuleVerdict {
  if (isEmptyValue(value)) {
    return undefined;
  }
  // A fresh regexp per run: a `g`/`y` flag would make `test` stateful
  // across runs (the same trap Input documents for `filterPattern`).
  const tester = new RegExp(pattern.source, pattern.flags);
  return tester.test(String(value)) ? undefined : (message ?? '格式不正确');
}

function runMin(value: unknown, min: number, message: string | undefined): RuleVerdict {
  if (isEmptyValue(value) || typeof value !== 'number') {
    return undefined;
  }
  return value < min ? (message ?? `不小于 ${min}`) : undefined;
}

function runMax(value: unknown, max: number, message: string | undefined): RuleVerdict {
  if (isEmptyValue(value) || typeof value !== 'number') {
    return undefined;
  }
  return value > max ? (message ?? `不大于 ${max}`) : undefined;
}

function runMinLength(value: unknown, minLength: number, message: string | undefined): RuleVerdict {
  if (isEmptyValue(value)) {
    return undefined;
  }
  const length = typeof value === 'string' ? value.length : Array.isArray(value) ? value.length : 0;
  return length < minLength ? (message ?? `至少 ${minLength} 个字符`) : undefined;
}

function runMaxLength(value: unknown, maxLength: number, message: string | undefined): RuleVerdict {
  if (isEmptyValue(value)) {
    return undefined;
  }
  const length = typeof value === 'string' ? value.length : Array.isArray(value) ? value.length : 0;
  return length > maxLength ? (message ?? `至多 ${maxLength} 个字符`) : undefined;
}

function readCustomVerdict(
  result: string | boolean | undefined,
  message: string | undefined,
): RuleVerdict {
  if (result === true || result === undefined) {
    return undefined;
  }
  if (result === false) {
    return message ?? '此项不符合要求';
  }
  return result;
}

/**
 * Runs one `Form.Validate` leaf's rules in a fixed order — required,
 * bounds, lengths, pattern, custom — and returns the first failure's
 * message. A leaf may carry several rules; spread them over leaves when
 * each deserves its own line. Async custom rules settle before the
 * verdict, with no pending state in v1.
 */
export async function runRules(
  leaf: Pick<
    FormValidateProps,
    'required' | 'pattern' | 'min' | 'max' | 'minLength' | 'maxLength' | 'validate' | 'message'
  >,
  value: unknown,
  values: Record<string, unknown>,
): Promise<string | undefined> {
  const { message } = leaf;

  if (leaf.required === true) {
    const verdict = runRequired(value, message);
    if (verdict !== undefined) {
      return verdict;
    }
  }
  if (leaf.min !== undefined) {
    const verdict = runMin(value, leaf.min, message);
    if (verdict !== undefined) {
      return verdict;
    }
  }
  if (leaf.max !== undefined) {
    const verdict = runMax(value, leaf.max, message);
    if (verdict !== undefined) {
      return verdict;
    }
  }
  if (leaf.minLength !== undefined) {
    const verdict = runMinLength(value, leaf.minLength, message);
    if (verdict !== undefined) {
      return verdict;
    }
  }
  if (leaf.maxLength !== undefined) {
    const verdict = runMaxLength(value, leaf.maxLength, message);
    if (verdict !== undefined) {
      return verdict;
    }
  }
  if (leaf.pattern !== undefined) {
    const verdict = runPattern(value, leaf.pattern, message);
    if (verdict !== undefined) {
      return verdict;
    }
  }
  if (leaf.validate !== undefined) {
    const validate: FormFieldValidator = leaf.validate;
    const result = await validate(value, values);
    return readCustomVerdict(result, message);
  }
  return undefined;
}
