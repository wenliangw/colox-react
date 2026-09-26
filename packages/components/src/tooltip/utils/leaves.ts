import { Fragment, isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { TooltipContent } from '../children/content';
import { TooltipTrigger } from '../children/trigger';
import type { TooltipContentProps, TooltipTriggerProps } from '../types';

/** The compiled channels: what the root clones and what it mounts aside. */
export interface CompiledTooltipLeaves {
  /** The element the root clones: the Trigger's host (composed) or the single child (props). */
  trigger: ReactElement | null;
  /** The composed Content part; rendered by the root inside the provider. */
  content: ReactElement<TooltipContentProps> | null;
  /** True once any declaration part is present. */
  composed: boolean;
}

/** Collects the top-level elements, fragments transparent. */
function collectTopLevelElements(node: ReactNode, out: ReactElement[]): void {
  if (Array.isArray(node)) {
    node.forEach((child) => collectTopLevelElements(child, out));
    return;
  }
  if (!isValidElement(node)) {
    return;
  }
  if (node.type === Fragment) {
    collectTopLevelElements((node.props as { children?: ReactNode }).children, out);
    return;
  }
  out.push(node);
}

/**
 * The structural compilation over the tooltip children — one walk
 * decides the channel:
 *
 * - composed (any declaration part present): exactly one Trigger
 *   (its single child — component or DOM host — becomes the trigger),
 *   at most one Content (absent = the tooltip never mounts);
 * - props mode (no parts): exactly one element child becomes the
 *   trigger and the `content` prop supplies the body.
 *
 * The rules are hard errors, fail fast on the authoring mistake:
 * both channels given, a composed mode without Trigger, duplicated
 * parts, or multiple props-mode children. Fragments and pass-through
 * wrappers stay structurally reachable.
 */
export function compileTooltipLeaves(
  children: ReactNode,
  hasContentProp: boolean,
): CompiledTooltipLeaves {
  let trigger: ReactElement | null = null;
  let content: ReactElement<TooltipContentProps> | null = null;

  const visit = (node: ReactNode): void => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!isValidElement(node)) {
      return;
    }
    if (node.type === TooltipTrigger) {
      if (trigger !== null) {
        throw new Error('Tooltip accepts exactly one <Tooltip.Trigger>.');
      }
      const host = (node as ReactElement<TooltipTriggerProps>).props.children;
      if (!isValidElement(host)) {
        throw new Error('<Tooltip.Trigger> requires exactly one element child.');
      }
      trigger = host;
      return;
    }
    if (node.type === TooltipContent) {
      if (content !== null) {
        throw new Error('Tooltip accepts at most one <Tooltip.Content>.');
      }
      content = node as ReactElement<TooltipContentProps>;
      return;
    }
    visit((node.props as { children?: ReactNode }).children);
  };

  visit(children);

  if (trigger !== null || content !== null) {
    if (trigger === null) {
      throw new Error('The composed Tooltip channels require a <Tooltip.Trigger>.');
    }
    if (hasContentProp) {
      throw new Error('Provide either the `content` prop or a <Tooltip.Content>, not both.');
    }
    return { trigger, content, composed: true };
  }

  const elements: ReactElement[] = [];
  collectTopLevelElements(children, elements);
  if (elements.length > 1) {
    throw new Error(
      'Tooltip accepts exactly one trigger element child (compose with <Tooltip.Trigger> for the composed channels).',
    );
  }
  return { trigger: elements[0] ?? null, content: null, composed: false };
}
