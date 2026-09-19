import type { TextareaMetrics } from '../types';

const toPx = (value: string | undefined) => {
  const parsed = Number.parseFloat(value ?? '');
  return Number.isNaN(parsed) ? undefined : parsed;
};

/** Reads the live computed metrics both height behaviors measure against. */
export const readTextareaMetrics = (el: HTMLTextAreaElement): TextareaMetrics => {
  const computed = window.getComputedStyle(el);
  const paddingTop = toPx(computed.paddingTop) ?? 0;
  const paddingBottom = toPx(computed.paddingBottom) ?? 0;
  const borderTop = toPx(computed.borderTopWidth) ?? 0;
  const borderBottom = toPx(computed.borderBottomWidth) ?? 0;
  return {
    lineHeight: toPx(computed.lineHeight),
    paddingBlock: paddingTop + paddingBottom,
    borderBlock: borderTop + borderBottom,
    borderBox: computed.boxSizing === 'border-box',
  };
};

/**
 * The natural content height in box-size terms, measured by temporarily
 * restoring the rows-based natural height (`height: ''`) — the previous
 * inline height must never leak into the measurement, or the box can
 * only ever grow. The caller's previous inline height is written back
 * afterwards (`''` for the growth measurement, the settled px for the
 * drag floor).
 */
export const measureTextareaContent = (
  el: HTMLTextAreaElement,
  metrics: TextareaMetrics,
  restore: string,
): number => {
  el.style.height = '';
  const content =
    el.scrollHeight +
    (metrics.borderBox ? metrics.borderBlock : metrics.paddingBlock + metrics.borderBlock);
  el.style.height = restore;
  return content;
};
