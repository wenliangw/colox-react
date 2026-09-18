import { useCallback } from 'react';
import type { KeyboardEventHandler, PointerEventHandler } from 'react';
import { measureTextareaContent, readTextareaMetrics } from '../utils/measure-textarea-height';
import type { UseTextareaResizeParams } from '../types';

/**
 * The footer drag handle behavior: vertical-only manual sizing on top of
 * `autoSize`. The growth world keeps no scrollbar, so content must stay
 * visible: the floor is the natural content height and dragging only ever
 * makes the box taller (up to where it was committed). The dragged height
 * is written to the inline style directly; the autosize hook picks it up
 * as its manual minimum on the next measurement, so it outlives keystrokes.
 * The keyboard path steps one live line-height per ArrowUp/ArrowDown.
 */
export const useTextareaResize = ({ textareaRef, enabled }: UseTextareaResizeParams) => {
  const onPointerDown = useCallback<PointerEventHandler<HTMLButtonElement>>(
    (event) => {
      if (!enabled) return;
      const el = textareaRef.current;
      if (el === null) return;
      event.preventDefault();

      const startY = event.clientY;
      const startHeight = el.getBoundingClientRect().height;
      const metrics = readTextareaMetrics(el);
      const floor = measureTextareaContent(el, metrics, el.style.height);

      const onMove = (move: PointerEvent) => {
        const next = Math.max(startHeight + move.clientY - startY, floor);
        el.style.height = `${next}px`;
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    },
    [enabled, textareaRef],
  );

  const onKeyDown = useCallback<KeyboardEventHandler<HTMLButtonElement>>(
    (event) => {
      if (!enabled) return;
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
      const el = textareaRef.current;
      if (el === null) return;
      event.preventDefault();

      const metrics = readTextareaMetrics(el);
      const row = metrics.lineHeight;
      if (row === undefined) return;
      const startHeight = el.getBoundingClientRect().height;
      const floor = measureTextareaContent(el, metrics, el.style.height);
      const step = event.key === 'ArrowUp' ? -row : row;
      el.style.height = `${Math.max(startHeight + step, floor)}px`;
    },
    [enabled, textareaRef],
  );

  return { onPointerDown, onKeyDown };
};
