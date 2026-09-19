import { isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { AutoCompleteOption } from '../children/option';
import { AutoCompleteSuggestions } from '../children/suggestions';
import { AutoCompleteTarget } from '../children/target';
import type {
  AutoCompleteOptionProps,
  AutoCompleteOptionRecord,
  AutoCompleteTargetProps,
} from '../types';

/**
 * The structural compilation: one walk discovers the host (Target)
 * and the suggestion leaves (Option under Suggestions). The rules are
 * hard errors — fail fast on the authoring mistake instead of
 * silently switching channel:
 *
 * - exactly one Target; exactly one component-typed child inside it
 *   (a host element would receive the injected contract as DOM props);
 * - at most one Suggestions region;
 * - Option members only inside Suggestions.
 *
 * Fragments and pass-through wrappers stay structurally reachable;
 * a component that creates members internally is not visible — the
 * member never renders itself, its element props are the data.
 */
export function compileAutoCompleteLeaves(children: ReactNode): {
  target: ReactElement;
  options: AutoCompleteOptionRecord[];
} {
  let target: ReactElement | null = null;
  let suggestions = 0;
  const options: AutoCompleteOptionRecord[] = [];

  const visit = (node: ReactNode, insideSuggestions: boolean): void => {
    if (Array.isArray(node)) {
      node.forEach((child) => visit(child, insideSuggestions));
      return;
    }
    if (!isValidElement(node)) {
      return;
    }
    if (node.type === AutoCompleteTarget) {
      if (target !== null) {
        throw new Error('AutoComplete accepts exactly one <AutoComplete.Target>.');
      }
      const child = (node as ReactElement<AutoCompleteTargetProps>).props.children;
      if (!isValidElement(child)) {
        throw new Error('<AutoComplete.Target> requires exactly one component child.');
      }
      const childType = child.type;
      if (typeof childType === 'string' || typeof childType === 'symbol') {
        throw new Error(
          '<AutoComplete.Target> child must be a component (function/class), not a host element or a fragment.',
        );
      }
      target = child;
      return;
    }
    if (node.type === AutoCompleteSuggestions) {
      suggestions += 1;
      if (suggestions > 1) {
        throw new Error('AutoComplete accepts at most one <AutoComplete.Suggestions>.');
      }
      visit((node.props as { children?: ReactNode }).children, true);
      return;
    }
    if (node.type === AutoCompleteOption) {
      if (!insideSuggestions) {
        throw new Error(
          '<AutoComplete.Option> members must live inside <AutoComplete.Suggestions>.',
        );
      }
      const member = (node as ReactElement<AutoCompleteOptionProps>).props;
      options.push({
        value: member.value,
        text: member.text,
        disabled: member.disabled ?? false,
        key: node.key ?? member.value,
        content: member.children ?? member.text,
        className: member.className,
        style: member.style,
      });
      return;
    }
    visit((node.props as { children?: ReactNode }).children, insideSuggestions);
  };

  visit(children, false);
  if (target === null) {
    throw new Error('AutoComplete requires exactly one <AutoComplete.Target>.');
  }
  return { target, options };
}
