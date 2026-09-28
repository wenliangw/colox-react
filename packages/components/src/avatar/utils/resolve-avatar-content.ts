import type { ReactNode } from 'react';
import { getInitials } from './get-initials';

/**
 * The resolved avatar content — a discriminated union of the four
 * shapes the footprint can carry.
 */
export type AvatarContent =
  | { kind: 'image'; src: string }
  | { kind: 'text'; text: string }
  | { kind: 'node'; node: ReactNode }
  | { kind: 'empty' };

interface ResolveAvatarContentParams {
  children?: ReactNode;
  src?: string;
  alt?: string;
  name?: string;
  fallback?: ReactNode;
  imageFailed: boolean;
}

/**
 * Resolve the avatar content by the priority ladder: the rich
 * `children` slot wins, then the picture avatar (while it loads), then
 * on an image failure the `fallback` escape hatch, then the `name`
 * initials, then the `alt` initials, then empty. `fallback` is the
 * image-failure escape hatch only — a missing `src` never consults it;
 * the `name` (then `alt`) initials are the standing text fallback.
 */
export function resolveAvatarContent({
  children,
  src,
  alt,
  name,
  fallback,
  imageFailed,
}: ResolveAvatarContentParams): AvatarContent {
  if (children != null) {
    return { kind: 'node', node: children };
  }
  if (src != null && !imageFailed) {
    return { kind: 'image', src };
  }
  if (src == null) {
    const text = getInitials(name ?? '');
    if (text) {
      return { kind: 'text', text };
    }
    return { kind: 'empty' };
  }
  // The image failed: the failure ladder is fallback → name initials →
  // alt initials.
  if (fallback != null) {
    return { kind: 'node', node: fallback };
  }
  const text = getInitials(name ?? '') || getInitials(alt ?? '');
  if (text) {
    return { kind: 'text', text };
  }
  return { kind: 'empty' };
}
