import { useCallback, useLayoutEffect, useState } from 'react';
import type { TextareaValue, UseTextareaCountParams } from '../types';

const normalize = (value: TextareaValue): string => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.join('\n');
  if (value === null || value === undefined) return '';
  return String(value);
};

/**
 * The `showCount` display state. The controlled path derives straight
 * from the `value` prop (no state); the uncontrolled path keeps the DOM
 * the single source of truth — a native `input` listener mirrors only the
 * length into display state (never the value itself), so typing, IME and
 * the footer clear all stay visible. `refresh` re-reads the DOM for
 * programmatic writes that skip the input event (the uncontrolled clear).
 */
export const useTextareaCount = ({
  textareaRef,
  value,
  controlled,
  active,
}: UseTextareaCountParams) => {
  const [innerLength, setInnerLength] = useState(0);

  const refresh = useCallback(() => {
    if (!active || controlled) return;
    const el = textareaRef.current;
    setInnerLength(el === null ? 0 : normalize(el.value).length);
  }, [active, controlled, textareaRef]);

  useLayoutEffect(() => {
    if (!active || controlled) return;
    const el = textareaRef.current;
    if (el === null) return;
    refresh();
    el.addEventListener('input', refresh);
    return () => {
      el.removeEventListener('input', refresh);
    };
  }, [active, controlled, refresh, textareaRef]);

  return {
    length: controlled && active ? normalize(value).length : innerLength,
    refresh,
  };
};
