/**
 * The editor's internal value: a finite number or the empty (null)
 * state. Communicates with the public `value`/`defaultValue` word
 * form directly — no string round-trips outside the editor.
 */
export type NumberValue = number | null;
