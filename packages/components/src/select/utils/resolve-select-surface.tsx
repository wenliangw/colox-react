import type { ReactNode } from 'react';
import type {
  ResolveActiveDescendantIdParams,
  ResolveButtonDisplayParams,
  ResolveControlLabelParams,
  ResolveInputValueParams,
} from '../types';

const stringPlaceholder = (placeholder: ReactNode): string | undefined =>
  typeof placeholder === 'string' ? placeholder : undefined;

/**
 * The control's value face: the query stream whenever the panel is
 * open or the selection is multiple, the selected text while closed in
 * plain single mode.
 */
export function resolveInputValue({
  isMultiple,
  isOpen,
  query,
  selectedText,
}: ResolveInputValueParams): string {
  if (isMultiple || isOpen) {
    return query;
  }
  return selectedText ?? '';
}

/**
 * The combobox reachable name (a combobox is author-named, ARIA
 * nameFrom: author): the aria-label override, then the selected text,
 * then the raw value, then the placeholder. A multiple select names
 * from the placeholder alone — the query stream is its live name
 * while open.
 */
export function resolveControlLabel({
  ariaLabel,
  isMultiple,
  selectedRecord,
  currentSingle,
  placeholder,
}: ResolveControlLabelParams): string | undefined {
  if (ariaLabel !== undefined) {
    return ariaLabel;
  }
  if (isMultiple) {
    return stringPlaceholder(placeholder);
  }
  if (selectedRecord !== undefined) {
    return selectedRecord.text;
  }
  if (currentSingle !== '') {
    return currentSingle;
  }
  return stringPlaceholder(placeholder);
}

/**
 * The ARIA active-descendant pointer: present only while the panel is
 * open AND the keyboard walk sits on a row (multiple selects start
 * above the list, index -1).
 */
export function resolveActiveDescendantId({
  isOpen,
  activeIndex,
  optionIdPrefix,
}: ResolveActiveDescendantIdParams): string | undefined {
  if (!isOpen || activeIndex < 0) {
    return undefined;
  }
  return `${optionIdPrefix}-${activeIndex}`;
}

/**
 * The trigger button's display content: the selected text, then the
 * raw value (a controlled value outside the members still reads
 * honestly), then the placeholder — for single mode. A multiple
 * select's button shows the placeholder while empty and stays empty
 * once the chips carry the selection.
 */
export function resolveButtonDisplay({
  selectedRecord,
  currentSingle,
  isMultiple,
  hasMultipleValues,
  placeholder,
}: ResolveButtonDisplayParams): ReactNode {
  if (isMultiple) {
    if (hasMultipleValues) {
      return null;
    }
    return (
      <span className="colox-select__placeholder">
        {placeholder !== undefined ? placeholder : '\u00a0'}
      </span>
    );
  }
  if (selectedRecord !== undefined) {
    return selectedRecord.text;
  }
  if (currentSingle !== '') {
    return currentSingle;
  }
  return (
    <span className="colox-select__placeholder">
      {placeholder !== undefined ? placeholder : '\u00a0'}
    </span>
  );
}
