import { cloneElement, forwardRef, useCallback, useMemo } from 'react';
import type { ReactElement } from 'react';
import { AutoCompleteOption } from './children/option';
import { AutoCompleteSuggestions } from './children/suggestions';
import { AutoCompleteTarget } from './children/target';
import { AutoCompletePanel } from './controls/panel';
import { useAutoComplete } from './hooks/use-autocomplete';
import type { AutoCompleteProps, AutoCompleteRef, AutoCompleteTargetRequiredProps } from './types';
import { compileAutoCompleteLeaves } from './utils/leaves';
import { resolveActiveDescendantId } from './utils/resolve-autocomplete-surface';
import { autocompleteVariants } from './variants';

import './styles/index.scss';

/**
 * The free-text combobox with suggestions: a structural shell around
 * an injected host control (the Input family owns size/invalid/…,
 * AutoComplete owns the value and the mechanism). The members are
 * compiled from AutoComplete.Target (+ host), AutoComplete.Suggestions
 * and AutoComplete.Option leaves; the popup is a portal listbox
 * modeled as an ARIA 1.2 editable combobox — focus stays in the host
 * and arrows walk suggestions via aria-activedescendant. The value is
 * plain text, so every edit is a legal commit and the members are a
 * convenience, never a constraint.
 */
const AutoCompleteRoot = forwardRef<AutoCompleteRef, AutoCompleteProps>((props, ref) => {
  const {
    value: valueProp,
    defaultValue,
    open: openProp,
    defaultOpen,
    filterOption,
    onChange,
    onSelect,
    onOpenChange,
    className,
    children,
    ...rest
  } = props;

  const composed = useMemo(() => compileAutoCompleteLeaves(children), [children]);

  const {
    anchorRef,
    panelRef,
    listboxId,
    value,
    open,
    filtered,
    activeIndex,
    onTargetChange,
    onTargetFocus,
    onTargetBlur,
    onControlKeyDown,
    selectOption,
  } = useAutoComplete({
    options: composed.options,
    target: composed.target,
    value: valueProp,
    defaultValue,
    open: openProp,
    defaultOpen,
    filterOption,
    onChange,
    onSelect,
    onOpenChange,
  });
  const activeDescendantId = resolveActiveDescendantId({ open, activeIndex, listboxId });

  // The root shell doubles as the popup reference: both the forwarded
  // ref and the internal anchor watch the same div.
  const setAnchorRef = useCallback(
    (node: HTMLDivElement | null) => {
      anchorRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref !== null) {
        ref.current = node;
      }
    },
    [anchorRef, ref],
  );

  return (
    <div ref={setAnchorRef} className={autocompleteVariants({ className })} {...rest}>
      {cloneElement(composed.target as ReactElement<AutoCompleteTargetRequiredProps>, {
        value,
        onChange: onTargetChange,
        onFocus: onTargetFocus,
        onBlur: onTargetBlur,
        onKeyDown: onControlKeyDown,
        role: 'combobox',
        'aria-expanded': open,
        'aria-controls': listboxId,
        'aria-autocomplete': 'list',
        'aria-haspopup': 'listbox',
        'aria-activedescendant': activeDescendantId,
      })}
      <AutoCompletePanel
        ref={panelRef}
        open={open}
        listboxId={listboxId}
        referenceRef={anchorRef}
        options={filtered}
        activeIndex={activeIndex}
        onOptionClick={selectOption}
      />
    </div>
  );
});

AutoCompleteRoot.displayName = 'AutoComplete';

export const AutoComplete = Object.assign(AutoCompleteRoot, {
  Target: AutoCompleteTarget,
  Suggestions: AutoCompleteSuggestions,
  Option: AutoCompleteOption,
});
