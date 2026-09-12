import type { SelectTemplateProps } from '../../types';

/**
 * The Select.Template leaf: a compile-time-only template slot — it
 * renders nothing itself. The parent Select captures its single
 * component child during compilation (see utils/select-options) and
 * the tags unit clones it per selected member, injecting the slot
 * contract `{ props, option, onRemove }`:
 *
 * - `props` — the required-attribute bag (the fold channel: past the
 *   visual slice it carries `aria-hidden` + the hidden style); the
 *   author contract is `{...props}` first on the root element;
 * - `option` — the member's compiled record (unknown values
 *   synthesize `{ value, text: value, disabled: false }`);
 * - `onRemove` — the internal removal channel: fires the standard
 *   `onChange` payload, stops propagation so the panel stays shut.
 */
export const SelectTemplate = (_props: SelectTemplateProps) => null;

SelectTemplate.displayName = 'Select.Template';
