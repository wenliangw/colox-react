import type { ReactElement } from 'react';
import type { CSSProperties } from 'react';
import type { PopoverContentProps, PopoverTitleProps } from './children';
import type { PopoverTriggerHandlers } from './hooks';

/** The compiled channels: what the root clones and what it mounts aside. */
export interface CompiledPopoverLeaves {
  /** The element the root clones: the Trigger's host (composed) or the single child (props). */
  trigger: ReactElement | null;
  /** The composed Content part: rendered by the root inside the provider. */
  content: ReactElement<PopoverContentProps> | null;
  /** The composed Title declaration — its children become the panel header. */
  title: ReactElement<PopoverTitleProps> | null;
  /** True once any declaration part is present. */
  composed: boolean;
}

export interface ResolvePopoverTriggerSurfaceParams {
  /** The compiled trigger element — its own words stay below the injection. */
  trigger: ReactElement;
  /** The merged ref callback (the trigger's DOM node). */
  setTriggerRef: (node: HTMLElement | null) => void;
  /** The panel id: joins the author's aria-controls while open. */
  panelId: string;
  /** The live visibility — drives aria-expanded and the aria-controls presence. */
  visible: boolean;
  /** The mode-built interaction surfaces (empty for manual). */
  handlers: PopoverTriggerHandlers;
  /** The root className, concatenated with the trigger's own. */
  className?: string;
  /** The root style, spread under the trigger's own keys. */
  style?: CSSProperties;
  /** The remaining root props — the trigger's own words win. */
  rest: Record<string, unknown>;
}
