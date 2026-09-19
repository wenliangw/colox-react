import type {
  ChangeEvent,
  CSSProperties,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from 'react';
import type { AutoCompleteOptionRecord } from './utils';

/**
 * The self-made change payload: every component-layer onChange fires
 * the uniform `{ event, value }` shape (family-wide rule since the
 * AutoComplete design round).
 */
export interface AutoCompleteChangePayload {
  /** The originating interaction: a typed edit or a keyboard/mouse pick. */
  event: ChangeEvent<HTMLInputElement> | KeyboardEvent<HTMLElement> | MouseEvent<HTMLElement>;
  /** The committed free text. */
  value: string;
}

/** The pick notification: which suggestion row was chosen, alongside the committed value. */
export interface AutoCompleteSelectPayload {
  event: KeyboardEvent<HTMLElement> | MouseEvent<HTMLElement>;
  value: string;
  option: AutoCompleteOptionRecord;
}

/**
 * The option surface the filter contract reads. Defined inline (not
 * extended from the cdk kernel record) so the public d.ts stays
 * self-contained while remaining structurally interchangeable with
 * the kernel matcher.
 */
export interface AutoCompleteFilterOption {
  value: string;
  text: string;
  disabled: boolean;
}

/** Decides whether an option stays visible for a query; the default is the contains matcher. */
export type AutoCompleteFilterFn = (query: string, option: AutoCompleteFilterOption) => boolean;

/**
 * The AutoComplete.Option leaf contract: the family option shape,
 * `value` is the free text written on pick.
 */
export interface AutoCompleteOptionProps {
  /** The committed value written into the host on pick. */
  value: string;
  /** The plain-text surface the matcher reads and the row falls back to. */
  text: string;
  /** Excluded from roaming and picking, still visible. */
  disabled?: boolean;
  /** Optional rich row render; falls back to `text`. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * The combobox host contract: root props own the value, the suggestion
 * mechanism and the control words a form layer injects (`id`, `name`,
 * `invalid`, `disabled`, `readOnly` and the describedby/labelledby/
 * required aria channel) — those forward to the injected host control,
 * which also keeps its static words (size/placeholder/clearable/…).
 * Everything else lands on the root anchor.
 */
export interface AutoCompleteProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'onSelect'
> {
  /** Controlled text; the empty string renders an empty control. */
  value?: string;
  /** Uncontrolled starting text; the empty string renders an empty control. */
  defaultValue?: string;
  /** Forced panel visibility; the internal focus/filter policy runs otherwise. */
  open?: boolean;
  /** Initial panel visibility for the uncontrolled open state. */
  defaultOpen?: boolean;
  /** Overrides the default substring matcher (text or value, case-insensitive). */
  filterOption?: AutoCompleteFilterFn;
  /**
   * The control's id, forwarded to the host input: a `<label for>`
   * must point at the focusable control, so the id does not stay on
   * the root anchor.
   */
  id?: string;
  /** The native form name, forwarded to the host control. */
  name?: string;
  /**
   * Marks the field invalid, forwarded to the host control (the Input
   * family paints the red channel and sets `aria-invalid`).
   * @default false
   */
  invalid?: boolean;
  /**
   * Disables the field: forwarded to the host control, so the panel
   * stays shut and picks are off (the host-level flag keeps working
   * too; the root wins when both are set).
   */
  disabled?: boolean;
  /**
   * Read-only field: forwarded to the host control (focusable and
   * readable, no edits). The host-level flag keeps working too; the
   * root wins when both are set.
   */
  readOnly?: boolean;
  /** The field's description/error wiring, forwarded to the host control. */
  'aria-describedby'?: string;
  /** The field's label wiring, forwarded to the host control. */
  'aria-labelledby'?: string;
  /** The announced requirement state, forwarded to the host control. */
  'aria-required'?: boolean;
  /** Fires on every committed text change (typing and picks). */
  onChange?: (payload: AutoCompleteChangePayload) => void;
  /** Fires when a suggestion row is picked (keyboard or mouse). */
  onSelect?: (payload: AutoCompleteSelectPayload) => void;
  /** Fires whenever the panel visibility changes (auto policy or forced). */
  onOpenChange?: (open: boolean) => void;
  /** AutoComplete.Target, AutoComplete.Suggestions and AutoComplete.Option members. */
  children: ReactNode;
}

/** The anchor element the popup positions against. */
export type AutoCompleteRef = HTMLDivElement;
