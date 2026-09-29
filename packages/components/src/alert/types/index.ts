import type { HTMLAttributes, ReactNode } from 'react';
import type { AlertVariants } from '../variants';

export type AlertType = 'info' | 'success' | 'warning' | 'error';
export type AlertPalette = NonNullable<AlertVariants['palette']>;
export type AlertVariant = NonNullable<AlertVariants['variant']>;

/**
 * The inline status message — a persistent, in-flow, declarative status
 * block (the flow-in sibling of the transient Toast/Notify message
 * system: it lives in the page, the parent decides whether it shows,
 * and the words are JSX, not a call).
 *
 * Axes: `type` (info/success/warning/error, default info) picks the
 * semantic icon glyph and the default palette family; `palette` (the
 * six design-language families, defaulting to the type's family) picks
 * the color; `variant` (plain/subtle/solid/outline, default subtle —
 * an inline status block reads as a tinted block, unlike a transient
 * pill) picks the surface strength. `message` is the primary line,
 * `description` the optional secondary line — both ReactNode, so
 * arbitrary rich content fits directly (no dot-part: content simple
 * enough for props). `showIcon` gates the semantic icon (default on),
 * `action` is the trailing CTA slot (a persistent inline block is the
 * proper host for a status + CTA, unlike a 3s transient hint), and
 * `closeable` + `onClose` is the controlled close — the ✕ only fires
 * the callback, the parent decides visibility (no internal hidden
 * state).
 *
 * The live region follows the type: error/warning announce assertively
 * (`role="alert"`), info/success politely (`role="status"`).
 */
export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The semantic status: picks the icon glyph and the default palette
   * family. error/warning also flip the live region to `role="alert"`.
   * @default 'info'
   */
  type?: AlertType;
  /**
   * The color family. Defaults to the type's own family.
   * @default follows type
   */
  palette?: AlertPalette;
  /**
   * The surface strength: subtle (default) the palette tint, solid the
   * full palette fill, outline a palette ring, plain the quiet neutral
   * surface (palette-independent).
   * @default 'subtle'
   */
  variant?: AlertVariant;
  /**
   * The primary line — any ReactNode (an icon, inline JSX, ...).
   */
  message: ReactNode;
  /**
   * The optional secondary detail line.
   */
  description?: ReactNode;
  /**
   * Show the semantic icon.
   * @default true
   */
  showIcon?: boolean;
  /**
   * Render the trailing CTA slot (e.g. a Button). A persistent inline
   * block is the proper host for a status + CTA.
   */
  action?: ReactNode;
  /**
   * Show the corner ✕. The close is controlled: clicking the ✕ fires
   * `onClose` and does not hide the alert itself — the parent decides
   * visibility (the alert lives in the page flow).
   * @default false
   */
  closeable?: boolean;
  /**
   * Fired when the ✕ is clicked (only when `closeable`). The parent
   * conditionally renders the alert away.
   */
  onClose?: () => void;
}

export type AlertRef = HTMLDivElement;
export type { AlertVariants };
