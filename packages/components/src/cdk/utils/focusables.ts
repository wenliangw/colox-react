const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

/**
 * The keyboard-focusable harvest inside a root: the elements a Tab
 * cycle can land on, in DOM order. Disabled controls and elements the
 * browser itself refuses to focus (display:none / visibility:hidden —
 * a focus() call on them is a no-op) stay out: the trap must only
 * walk what the user can actually reach. The check reads computed
 * styles, not geometry (getBoundingClientRect reads 0×0 in jsdom and
 * would blind the suite).
 */
export function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => {
    const styles = window.getComputedStyle(element);
    return styles.display !== 'none' && styles.visibility !== 'hidden';
  });
}
