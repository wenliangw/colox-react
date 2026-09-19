/**
 * The compiled suggestion record the combobox kernel works on: plain
 * structural data, so any consumer compiles its option leaves into
 * this shape (Select compiles Select.Option, AutoComplete compiles
 * AutoComplete.Option) and shares filter semantics verbatim.
 */
export interface ComboboxOption {
  /** The committed value written back on pick. */
  value: string;
  /** The plain-text surface the matcher and rows read. */
  text: string;
  /** Excluded from keyboard roaming and picking, still visible. */
  disabled: boolean;
}
