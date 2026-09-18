import type { TextareaHTMLAttributes } from 'react';
import type { TextareaVariants } from '../variants';

export type TextareaSize = NonNullable<TextareaVariants['size']>;

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Visual size — the same font/padding tiers as Input (xs/sm/md/lg).
   * There is no tier height: the height is content-driven, so `size`
   * controls the font tier and inline padding only.
   * @default 'md'
   */
  size?: TextareaSize;
  /**
   * Marks the textarea as invalid (e.g. after server-side validation):
   * sets `aria-invalid` and the red border/ring styling, on the same
   * tokens and channel as Input/Checkbox/Radio.
   * @default false
   */
  invalid?: boolean;
  /**
   * Adds the built-in clear control to the footer's leading pill capsule:
   * a text button labelled `清除`, sitting next to the count with a
   * hairline divider when both are on. Clicking it clears the value
   * through the same `onChange` stream (`''`) while keeping focus. Hidden
   * when `disabled` or `readOnly`.
   * @default false
   */
  clearable?: boolean;
  /**
   * Shows the character count in the footer bar: `${length}` on its own,
   * or `${length} / ${maxLength}` when `maxLength` is set — UTF-16 code
   * units, the same measure the native `maxlength` attribute enforces.
   * Works in both modes; the uncontrolled path syncs from the live DOM
   * value (the DOM stays the single source of truth).
   * @default false
   */
  showCount?: boolean;
  /**
   * Owns the height growth. **Default: on** — omitting it is the same as
   * `true`: unbounded growth, never a scrollbar while typing. `{ minRows }`
   * raises the minimum baseline; `{ maxRows }` caps the growth and
   * scrolls inside (styled scrollbar, hugging the shell edge,
   * cross-platform consistent); `false` returns the fixed `rows` world
   * with native scrolling.
   *
   * The footer drag handle (manual sizing) is available in the unbounded
   * growth worlds (default / `true` / `{ minRows }`) and intentionally
   * absent once growth is capped (`{ maxRows }`) or switched off
   * (`false`) — the scrollbar is the overflow control there.
   *
   * The width is never auto-sized — it stays container-driven (`100%`);
   * native `resize` stays off either way (re-enabling the UA vertical
   * grip is a consumer CSS escape hatch on `.colox-textarea-control`).
   */
  autoSize?: boolean | TextareaAutosize;
}

export interface TextareaAutosize {
  /**
   * Minimum height in rows; defaults to the `rows` baseline.
   */
  minRows?: number;
  /**
   * Maximum height in rows; beyond it the textarea scrolls inside.
   */
  maxRows?: number;
}

export type TextareaRef = HTMLTextAreaElement;
