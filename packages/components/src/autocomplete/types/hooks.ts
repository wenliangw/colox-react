import type {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  RefObject,
} from 'react';
import type {
  AutoCompleteChangePayload,
  AutoCompleteFilterFn,
  AutoCompleteSelectPayload,
} from './component';
import type { AutoCompleteOptionRecord } from './utils';

/**
 * The change payload's event union, read off the component contract.
 */
export type AutoCompleteChangeEvent = Parameters<
  NonNullable<UseAutoCompleteParams['onChange']>
>[0]['event'];

/**
 * The slice of the host element's props the injection chains into.
 */
export interface TargetHandlers {
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

/**
 * The hook input: the compiled tree plus the root contract.
 */
export interface UseAutoCompleteParams {
  /**
   * The compiled AutoComplete.Option leaves.
   */
  options: readonly AutoCompleteOptionRecord[];
  /**
   * The captured host element from <AutoComplete.Target> (the compile walk guarantees one).
   */
  target: ReactElement;
  value?: string;
  defaultValue?: string;
  open?: boolean;
  defaultOpen?: boolean;
  filterOption?: AutoCompleteFilterFn;
  onChange?: (payload: AutoCompleteChangePayload) => void;
  onSelect?: (payload: AutoCompleteSelectPayload) => void;
  onOpenChange?: (open: boolean) => void;
}

/**
 * The hook output: state, refs and the host injection surface.
 */
export interface UseAutoCompleteResult {
  /**
   * The root shell Popup anchors against.
   */
  anchorRef: RefObject<HTMLDivElement | null>;
  /**
   * The Popup panel (dismissible containment).
   */
  panelRef: RefObject<HTMLDivElement | null>;
  listboxId: string;
  /**
   * The committed text (controlled prop or internal state).
   */
  value: string;
  open: boolean;
  filtered: readonly AutoCompleteOptionRecord[];
  activeIndex: number;
  onTargetChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onTargetFocus: (event: FocusEvent<HTMLElement>) => void;
  onTargetBlur: (event: FocusEvent<HTMLElement>) => void;
  onControlKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  selectOption: (
    option: AutoCompleteOptionRecord,
    event: KeyboardEvent<HTMLElement> | MouseEvent<HTMLElement>,
  ) => void;
}
