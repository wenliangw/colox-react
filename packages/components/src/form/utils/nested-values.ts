import type { FormErrors, FormValues } from '../types';

/**
 * Whether a value is an object literal (or a prototype-less object) —
 * the only shape the nested-name vocabulary expands. Arrays are field
 * values (a checkbox group's selection), and `Date` / class instances
 * are leaf values too; they never fan out into field names.
 */
const isPlainObject = (value: unknown): value is FormValues =>
  value !== null &&
  typeof value === 'object' &&
  (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);

/**
 * Flattens the nested (object-literal) entries of a values map into
 * dotted names: `{ user: { name } }` → `{ 'user.name': name }`. Flat
 * entries pass through untouched, so both spellings may share one map;
 * on a collision the nested form wins (the tree is the native shape).
 */
export function normalizeValues(values: FormValues): FormValues {
  const flat: FormValues = {};
  for (const [key, value] of Object.entries(values)) {
    if (!isPlainObject(value)) {
      flat[key] = value;
    }
  }
  const expand = (prefix: string, input: FormValues) => {
    for (const [key, value] of Object.entries(input)) {
      const name = prefix === '' ? key : `${prefix}.${key}`;
      if (isPlainObject(value)) {
        expand(name, value);
      } else {
        flat[name] = value;
      }
    }
  };
  for (const [key, value] of Object.entries(values)) {
    if (isPlainObject(value)) {
      expand(key, value);
    }
  }
  return flat;
}

/**
 * Rebuilds the nested tree behind the flattened dotted names:
 * `{ 'user.name': name }` → `{ user: { name } }`. Deeper paths are
 * written first, so when a leaf name and a subtree collide (a field
 * named `a` next to `a.b`), the leaf wins. Segments are object keys —
 * the dotted vocabulary never synthesizes arrays (`a.0` stays the `"0"`
 * property of `a`).
 */
function buildTree(flat: Record<string, unknown>): Record<string, unknown> {
  const tree: Record<string, unknown> = {};
  const names = Object.keys(flat).sort((a, b) => b.split('.').length - a.split('.').length);
  for (const name of names) {
    const segments = name.split('.');
    let node = tree;
    for (let index = 0; index < segments.length - 1; index += 1) {
      const segment = segments[index] as string;
      const next = node[segment];
      if (next === null || typeof next !== 'object' || Array.isArray(next)) {
        node[segment] = {};
      }
      node = node[segment] as Record<string, unknown>;
    }
    node[segments[segments.length - 1] as string] = flat[name];
  }
  return tree;
}

/** The nested tree behind the flattened dotted values. */
export const buildValuesTree = (values: FormValues): FormValues => buildTree(values);

/** The nested tree behind the flattened dotted errors. */
export const buildErrorsTree = (errors: FormErrors): FormErrors => buildTree(errors) as FormErrors;
