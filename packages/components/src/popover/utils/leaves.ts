import { Fragment, isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { PopoverContent } from '../children/content';
import { PopoverTitle } from '../children/title';
import { PopoverTrigger } from '../children/trigger';
import type {
  CompiledPopoverLeaves,
  PopoverContentProps,
  PopoverTitleProps,
  PopoverTriggerProps,
} from '../types';

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
 * The structural compilation over the popover children — one walk
 * decides the channel:
 *
 * - composed (any declaration part present): exactly one Trigger (its
 *   single child — component or DOM host — becomes the trigger), at
 *   most one Title (its children become the panel header), at most
 *   one Content (absent = the panel never mounts);
 * - props mode (no parts): exactly one element child becomes the
 *   trigger and the `title`/`content` props supply the words.
 *
 * The rules are hard errors, fail fast on the authoring mistake:
 * both channels given, a composed mode without Trigger, duplicated
 * parts, or multiple props-mode children. Fragments and pass-through
 * wrappers stay structurally reachable.
 */
export function compilePopoverLeaves(
  children: ReactNode,
  hasContentProp: boolean,
  hasTitleProp: boolean,
): CompiledPopoverLeaves {
  let trigger: ReactElement | null = null;
  let content: ReactElement<PopoverContentProps> | null = null;
  let title: ReactElement<PopoverTitleProps> | null = null;

  const visit = (node: ReactNode): void => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!isValidElement(node)) {
      return;
    }
    if (node.type === PopoverTrigger) {
      if (trigger !== null) {
        throw new Error('Popover accepts exactly one <Popover.Trigger>.');
      }
      const host = (node as ReactElement<PopoverTriggerProps>).props.children;
      if (!isValidElement(host)) {
        throw new Error('<Popover.Trigger> requires exactly one element child.');
      }
      trigger = host;
      return;
    }
    if (node.type === PopoverTitle) {
      if (title !== null) {
        throw new Error('Popover accepts at most one <Popover.Title>.');
      }
      title = node as ReactElement<PopoverTitleProps>;
      return;
    }
    if (node.type === PopoverContent) {
      if (content !== null) {
        throw new Error('Popover accepts at most one <Popover.Content>.');
      }
      content = node as ReactElement<PopoverContentProps>;
      return;
    }
    visit((node.props as { children?: ReactNode }).children);
  };

  visit(children);

  if (trigger !== null || content !== null || title !== null) {
    if (trigger === null) {
      throw new Error('The composed Popover channels require a <Popover.Trigger>.');
    }
    if (hasContentProp) {
      throw new Error('Provide either the `content` prop or a <Popover.Content>, not both.');
    }
    if (hasTitleProp) {
      throw new Error('Provide either the `title` prop or a <Popover.Title>, not both.');
    }
    return { trigger, content, title, composed: true };
  }

  const elements: ReactElement[] = [];
  collectTopLevelElements(children, elements);
  if (elements.length > 1) {
    throw new Error(
      'Popover accepts exactly one trigger element child (compose with <Popover.Trigger> for the composed channels).',
    );
  }
  return { trigger: elements[0] ?? null, content: null, title: null, composed: false };
}
