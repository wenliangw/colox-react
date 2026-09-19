import type { AutoCompleteSuggestionsProps } from '../../types';

/**
 * The AutoComplete.Suggestions structural region: renders nothing
 * itself. Its AutoComplete.Option leaves are compiled into the
 * suggestion rows of the popup listbox; the walk descends fragments
 * and pass-through wrappers (see utils/leaves), while non-element
 * nodes are ignored as JSX noise.
 */
export const AutoCompleteSuggestions = (_props: AutoCompleteSuggestionsProps) => null;

AutoCompleteSuggestions.displayName = 'AutoComplete.Suggestions';
