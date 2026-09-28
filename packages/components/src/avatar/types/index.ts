import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react';
import type { AvatarVariants } from '../variants';

export type AvatarSize = NonNullable<AvatarVariants['size']>;
export type AvatarShape = NonNullable<AvatarVariants['shape']>;
export type AvatarVariant = NonNullable<AvatarVariants['variant']>;
export type AvatarPalette = NonNullable<AvatarVariants['palette']>;

/**
 * The portrait primitive — a round footprint that carries one of
 * three content forms, in priority order:
 *
 * 1. `children` — a rich content slot (an icon or any custom node),
 *    always wins when present;
 * 2. `src` — the picture avatar; on load failure it falls back to
 *    `fallback`, then to the `name` initials, then to the `alt`
 *    initials;
 * 3. `name` — a person name, automatically reduced to its initials
 *    (CJK first character, Latin first letters) by the library.
 *
 * `fallback` is the image-failure escape hatch only — a missing `src`
 * never consults it; `name` (then `alt`) initials are the standing
 * text fallback.
 *
 * Accessibility contract: a picture avatar reads through the inner
 * `img`'s `alt` (required — a missing alt warns and renders an empty
 * alt); the derived text avatar is `role="img"` with the accessible
 * name taken from `aria-label`, then the `name`, then the `alt`. An
 * author-supplied `children`/`fallback` node owns its own naming.
 */
export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Footprint size: a preset tier aligned with the form family
   * (xs 24 / sm 32 / md 40 / lg 48) or any theme size-token key —
   * `size="4"` renders a 16px avatar. The text tier follows the
   * footprint proportionally.
   * @default 'md'
   */
  size?: AvatarSize;
  /**
   * The footprint rounding: circle (default — the portrait reads as a
   * round head), rounded (the form-family lg radius), square (no
   * radius).
   * @default 'circle'
   */
  shape?: AvatarShape;
  /**
   * The surface strength of the text avatar (and of the failure
   * fallback). plain (default) is the quiet neutral portrait surface —
   * muted background, default text, palette-independent. subtle is the
   * palette tint fill, solid the full palette fill with inverse text,
   * outline a palette border on a transparent fill. A picture avatar
   * ignores the axis — the image is the content.
   * @default 'plain'
   */
  variant?: AvatarVariant;
  /**
   * Semantic palette — the color family for the subtle/solid/outline
   * surfaces. plain ignores it (the neutral portrait surface speaks at
   * the muted volume); the colored variants read it.
   * @default 'gray'
   */
  palette?: AvatarPalette;
  /**
   * Image source for the picture avatar. While it loads the image
   * wins; on failure the content falls back to `fallback`, then to
   * the `name` initials.
   */
  src?: string;
  /**
   * Alt text for the picture avatar. Required — a missing alt warns
   * and renders an empty alt. Also feeds the derived text avatar on
   * an image failure (the `alt` initials, after `name`).
   */
  alt?: string;
  /**
   * A person name reduced to its initials (CJK first character, Latin
   * first letters). Also feeds the accessible name of the derived
   * text avatar when no explicit `aria-label` is given.
   */
  name?: string;
  /**
   * Escape hatch rendered when the image fails to load — overrides the
   * automatic fallback to the `name` (then `alt`) initials. Consulted
   * only on an image failure; a missing `src` never shows it.
   */
  fallback?: ReactNode;
  /**
   * Extra attributes for the inner `<img>` (srcSet, sizes, loading,
   * …). The `onError` channel is owned by the component (the failure
   * detection) — listen through the `onError` prop instead.
   */
  imgProps?: ImgHTMLAttributes<HTMLImageElement>;
  /**
   * Fired once when the picture avatar's image fails to load.
   */
  onError?: () => void;
}

export type AvatarRef = HTMLSpanElement;
