export type ClassValue = string | number | bigint | false | null | undefined;

/**
 * Join class names, ignoring falsy values.
 *
 * @example
 * cn('btn', isActive && 'btn--active', undefined) // 'btn btn--active'
 */
export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(' ');
}
