import type { AutoCompleteOptionProps } from '../../types';

/**
 * The AutoComplete.Option leaf: a compile-time-only member — it
 * renders nothing itself. The root compiles members into suggestion
 * records (see utils/leaves) and renders the rows inside the popup
 * listbox; `children` provide the optional rich row render, `text`
 * stays the plain-text surface for filtering and the row fallback.
 */
export const AutoCompleteOption = (_props: AutoCompleteOptionProps) => null;

AutoCompleteOption.displayName = 'AutoComplete.Option';
