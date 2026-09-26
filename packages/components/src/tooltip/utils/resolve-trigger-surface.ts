import clsx from 'clsx';
import type { ClassValue } from 'clsx';
import type { CSSProperties, ReactElement, SyntheticEvent } from 'react';
import type { TooltipTriggerHandlers } from '../types';

export interface ResolveTriggerSurfaceParams {
  /** The compiled trigger element — its own words stay below the injection. */
  trigger: ReactElement;
  /** The merged ref callback (the trigger's DOM node). */
  setTriggerRef: (node: HTMLElement | null) => void;
  /** The final describedby wording: the author's words plus the panel id. */
  describedBy?: string;
  /** The mode-built interaction surfaces (empty for manual). */
  handlers: TooltipTriggerHandlers;
  /** The root className, concatenated with the trigger's own. */
  className?: string;
  /** The root style, spread under the trigger's own keys. */
  style?: CSSProperties;
  /** The remaining root props — the trigger's own words win. */
  rest: object;
}

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
 * author's, and `aria-describedby` appends the panel id to whatever
 * the author already declared.
 */
export function resolveTooltipTriggerSurface(
  params: ResolveTriggerSurfaceParams,
): Record<string, unknown> {
  const { trigger, setTriggerRef, describedBy, handlers, className, style, rest } = params;
  const own = trigger.props as Record<string, unknown>;

  // The spread already picked the surviving author surface (trigger
  // own over the root passthrough); the merged keys are rebuilt below.
  const surface: Record<string, unknown> = { ...(rest as Record<string, unknown>), ...own };

  surface.className = clsx(own.className as ClassValue, className) || undefined;
  surface.style = {
    ...(style as CSSProperties | undefined),
    ...(own.style as CSSProperties | undefined),
  };

  const ownDescribedBy =
    typeof own['aria-describedby'] === 'string' ? own['aria-describedby'] : undefined;
  surface['aria-describedby'] =
    [ownDescribedBy, describedBy].filter((value) => Boolean(value)).join(' ') || undefined;

  surface.onPointerEnter = chainHandlers(handlers.onPointerEnter, surface.onPointerEnter);
  surface.onPointerLeave = chainHandlers(handlers.onPointerLeave, surface.onPointerLeave);
  surface.onFocus = chainHandlers(handlers.onFocus, surface.onFocus);
  surface.onBlur = chainHandlers(handlers.onBlur, surface.onBlur);
  surface.onClick = chainHandlers(handlers.onClick, surface.onClick);

  surface.ref = setTriggerRef;

  return surface;
}
