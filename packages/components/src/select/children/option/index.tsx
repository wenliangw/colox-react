import type { SelectOptionProps } from '../../types';

/**
 * The Select.Option leaf: a compile-time-only member — it renders
 * nothing itself. The parent Select compiles its members into option
 * records (see utils/select-options) and renders the rows inside the
 * panel; `children` provide the optional rich row render, `text` stays
 * the plain-text surface for search/trigger/chips.
 */
export const SelectOption = (_props: SelectOptionProps) => null;

SelectOption.displayName = 'Select.Option';
