import type { ReactElement } from 'react';
import type { CSSProperties } from 'react';
import type { TooltipContentProps } from './children';
import type { TooltipTriggerHandlers } from './hooks';

/** The compiled channels: what the root clones and what it mounts aside. */
export interface CompiledTooltipLeaves {
  /** The element the root clones: the Trigger's host (composed) or the single child (props). */
  trigger: ReactElement | null;
  /** The composed Content part; rendered by the root inside the provider. */
  content: ReactElement<TooltipContentProps> | null;
  /** True once any declaration part is present. */
  composed: boolean;
}

export interface ResolveTooltipTriggerSurfaceParams {
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
  rest: Record<string, unknown>;
}
