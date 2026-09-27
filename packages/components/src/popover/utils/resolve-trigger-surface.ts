import type { CSSProperties, SyntheticEvent } from 'react';
import clsx from 'clsx';
import type { ClassValue } from 'clsx';
import type { ResolvePopoverTriggerSurfaceParams } from '../types';

/** Chains the library handler before the surviving author handler. */
function chainHandlers<E extends SyntheticEvent>(
  library: ((event: E) => void) | undefined,
  author: unknown,
): ((event: E) => void) | undefined {
  if (!library) {
    return undefined;
  }
  if (typeof author !== 'function') {
    return library;
  }
  return (event: E) => {
    library(event);
    (author as (event: E) => void)(event);
  };
}

/**
 * The zero-container surface: the root renders no wrapper — every root
 * word merges into the trigger it clones. The trigger's own words win
 * over the root passthrough; `className` concatenates, `style` spreads
 * with the author's keys on top, the injected handlers run before the
 * author's, and the dialog wiring (`aria-haspopup`, the live
 * `aria-expanded` and the panel id appended to an existing
 * `aria-controls`) lands on the trigger while open.
 */
export function resolvePopoverTriggerSurface(
  params: ResolvePopoverTriggerSurfaceParams,
): Record<string, unknown> {
  const { trigger, setTriggerRef, panelId, visible, handlers, className, style, rest } = params;
  const own = trigger.props as Record<string, unknown>;

  // The spread already picked the surviving author surface (trigger
  // own over the root passthrough); the merged keys are rebuilt below.
  const surface: Record<string, unknown> = { ...(rest as Record<string, unknown>), ...own };

  surface.className = clsx(own.className as ClassValue, className) || undefined;
  surface.style = {
    ...(style as CSSProperties | undefined),
    ...(own.style as CSSProperties | undefined),
  };

  surface['aria-haspopup'] = 'dialog';
  surface['aria-expanded'] = visible;
  const ownControls = typeof own['aria-controls'] === 'string' ? own['aria-controls'] : undefined;
  surface['aria-controls'] =
    (visible ? [ownControls, panelId].filter((value) => Boolean(value)).join(' ') : ownControls) ||
    undefined;

  surface.onPointerEnter = chainHandlers(handlers.onPointerEnter, surface.onPointerEnter);
  surface.onPointerLeave = chainHandlers(handlers.onPointerLeave, surface.onPointerLeave);
  surface.onFocus = chainHandlers(handlers.onFocus, surface.onFocus);
  surface.onBlur = chainHandlers(handlers.onBlur, surface.onBlur);
  surface.onClick = chainHandlers(handlers.onClick, surface.onClick);

  surface.ref = setTriggerRef;

  return surface;
}
