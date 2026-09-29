import type { HTMLAttributes, ReactNode } from 'react';

/** The host element of `Empty`. */
export type EmptyRef = HTMLDivElement;

/**
 * The empty-state scene — picks the built-in figure: `empty` (the
 * folder with floating data pages — files, folders, data), `search`
 * (the magnifier over floating documents, no matches), `error` (the
 * ringed planet with its moon — a signal lost in space, the service
 * anomaly read far from reality). Each scene carries its own ambient
 * hue palette (blue/orange, green/blue, red/orange); the semantic
 * color of the message still belongs to the prose and any action.
 */
export type EmptyType = 'empty' | 'search' | 'error';

/**
 * Empty — the empty-state block: a centered figure, a title and a
 * description (plus an optional action) that tell the reader a region
 * has nothing to show and what to do about it. Static display: no
 * events, no state, not closable — a page-level state, not a transient
 * message (Toast/Notify) nor an inline status (Alert). `title` drops
 * the native `<div title>` tooltip to make room for the rich heading
 * slot (the native attribute is not surfaced on a state block).
 */
export interface EmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * The built-in scene figure — a decorative, multi-color atmospheric
   * illustration. Static ambient painting: no labels, no interaction.
   * @default 'empty'
   */
  type?: EmptyType;
  /**
   * The custom figure — a ReactNode (an SVG, an image, ...) that
   * replaces the built-in scene figure entirely.
   */
  figure?: ReactNode;
  /** The primary line. */
  title?: ReactNode;
  /** The optional secondary detail line. */
  description?: ReactNode;
  /** The optional bottom action (a button, a link, ...). */
  action?: ReactNode;
}
