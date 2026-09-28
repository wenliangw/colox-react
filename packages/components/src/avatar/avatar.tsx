import { forwardRef, useEffect, useState } from 'react';
import clsx from 'clsx';
import type { AvatarProps, AvatarRef } from './types';
import { resolveAvatarContent } from './utils/resolve-avatar-content';
import { avatarVariants } from './variants';

import './styles/index.scss';

/**
 * A missing `alt` on a picture avatar is a silent accessibility hole —
 * warn once per session so the mistake surfaces without spamming the
 * console across a list of avatars.
 */
let warnedMissingAlt = false;

export const Avatar = forwardRef<AvatarRef, AvatarProps>((props, ref) => {
  const {
    size,
    shape,
    variant,
    palette,
    src,
    alt,
    name,
    fallback,
    imgProps,
    'aria-label': ariaLabel,
    className,
    children,
    onError,
    ...rest
  } = props;

  const [imageFailed, setImageFailed] = useState(false);

  // A new `src` starts a fresh load — clear the failure so the new
  // picture wins over the stale fallback.
  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const content = resolveAvatarContent({
    children,
    src,
    alt,
    name,
    fallback,
    imageFailed,
  });

  useEffect(() => {
    if (content.kind === 'image' && !alt && !imgProps?.alt && !warnedMissingAlt) {
      warnedMissingAlt = true;
      console.warn(
        '[Colox Avatar] A picture avatar needs an accessible name: pass `alt` (or `imgProps.alt`). Rendering with an empty alt.',
      );
    }
  }, [content.kind, alt, imgProps?.alt]);

  return (
    <span
      ref={ref}
      className={clsx(avatarVariants({ size, shape, variant, palette }), className)}
      role={content.kind === 'text' ? 'img' : undefined}
      aria-label={content.kind === 'text' ? (ariaLabel ?? name ?? alt) : undefined}
      {...rest}
    >
      {content.kind === 'image' && (
        <img
          draggable={false}
          {...imgProps}
          className={clsx('colox-avatar__img', imgProps?.className)}
          src={content.src}
          alt={alt || imgProps?.alt || ''}
          onError={() => {
            setImageFailed(true);
            onError?.();
          }}
        />
      )}
      {content.kind === 'text' && content.text}
      {content.kind === 'node' && content.node}
    </span>
  );
});
