import type { ChangeEvent, FocusEvent, KeyboardEvent, ReactNode } from 'react';

/**
 * The structural host slot: exactly one component-typed child receives
 * the injected combobox contract (value/onChange/aria-*); the member
 * itself renders nothing.
 */
export interface AutoCompleteTargetProps {
  children: ReactNode;
}

/**
 * The injected host contract — the required-attribute bag the library
 * clones into the Target child. The host must render a text-editing
 * native input and forward this surface to it (the Input family does
 * by default).
 */
export interface AutoCompleteTargetRequiredProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onFocus: (event: FocusEvent<HTMLElement>) => void;
  onBlur: (event: FocusEvent<HTMLElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  role: 'combobox';
  'aria-expanded': boolean;
  'aria-controls': string;
  'aria-autocomplete': 'list';
  'aria-haspopup': 'listbox';
  'aria-activedescendant'?: string;
}

/**
 * The structural suggestion region: AutoComplete.Option leaves only —
 * any other content is a compile-time error. The region may stand
 * empty (no members — the degenerate free-text mode). Renders nothing
 * itself.
 */
export interface AutoCompleteSuggestionsProps {
  children?: ReactNode;
}
