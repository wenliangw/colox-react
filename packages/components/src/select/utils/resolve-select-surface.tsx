import type { ReactNode } from 'react';
import type { SelectOptionRecord } from '../types';

const stringPlaceholder = (placeholder: ReactNode): string | undefined =>
  typeof placeholder === 'string' ? placeholder : undefined;

export interface ResolveInputValueParams {
  isMultiple: boolean;
  isOpen: boolean;
  query: string;
  selectedText: string | undefined;
}

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

export interface ResolveControlLabelParams {
  ariaLabel: string | undefined;
  isMultiple: boolean;
  selectedRecord: SelectOptionRecord | undefined;
  currentSingle: string;
  placeholder: ReactNode;
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

export interface ResolveButtonDisplayParams {
  selectedRecord: SelectOptionRecord | undefined;
  currentSingle: string;
  placeholder: ReactNode;
}

/**
 * The closed single trigger content: the selected text, then the raw
 * value (a controlled value outside the members still reads
 * honestly), then the placeholder.
 */
export function resolveButtonDisplay({
  selectedRecord,
  currentSingle,
  placeholder,
}: ResolveButtonDisplayParams): ReactNode {
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
