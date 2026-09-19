import type { AutoCompleteTargetProps } from '../../types';

/**
 * The AutoComplete.Target structural slot: renders nothing itself.
 * The root captures its single component child during compilation
 * (see utils/leaves) and injects the combobox contract into it —
 * `value`/`onChange`/`aria-*` come from the library, every static
 * prop (size/placeholder/invalid/…) stays the author's.
 */
export const AutoCompleteTarget = (_props: AutoCompleteTargetProps) => null;

AutoCompleteTarget.displayName = 'AutoComplete.Target';
