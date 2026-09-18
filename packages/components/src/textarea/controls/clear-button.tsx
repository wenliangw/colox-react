import type { TextareaClearButtonProps } from '../types';

/**
 * The built-in `clearable` control is a plain text button — the label
 * `清除` — living inside the footer's leading pill capsule (never
 * floating over the text). `mousedown` is prevented so clicking it never
 * steals focus from the textarea; clearing itself flows through the
 * textarea's onChange stream (see `useTextareaClear#handleClear`).
 */
export const TextareaClearButton = ({ onClear }: TextareaClearButtonProps) => (
  <button
    type="button"
    className="colox-textarea__clear"
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClear}
  >
    清除
  </button>
);

TextareaClearButton.displayName = 'TextareaClearButton';
