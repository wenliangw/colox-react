import type { ChangeEvent } from 'react';
import type { UseTextareaClearParams } from '../types';

/**
 * The `clearable` behavior: clearing flows through the consumer's onChange
 * without driving the DOM through the native event system — React's change
 * plugin reports stale values for controlled inputs on dispatched events
 * (and swallows them under dedupe), so the reliable path is a direct
 * event-shaped notification: the controlled DOM follows from the consumer's
 * re-render, and the uncontrolled DOM is written here because it has no
 * render owner. Same path as `useInputFilter#handleClear` (see
 * `.mesync/corrections/form-inputs.md`).
 */
export const useTextareaClear = ({ textareaRef, onChange, onCleared }: UseTextareaClearParams) => {
  const handleClear = () => {
    const textarea = textareaRef.current;
    if (textarea === null) {
      return;
    }
    textarea.value = '';
    onChange?.({
      target: textarea,
      currentTarget: textarea,
      type: 'change',
    } as ChangeEvent<HTMLTextAreaElement>);
    onCleared?.();
  };

  return { handleClear };
};
