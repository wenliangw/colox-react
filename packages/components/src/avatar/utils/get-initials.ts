/**
 * The CJK ideograph ranges — any Han ideograph (incl. extension A and
 * compatibility ideographs) is treated as a CJK character, so a
 * Chinese name keeps its first character (the surname) as the avatar
 * text.
 */
const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;

/**
 * Derive the avatar text from a person's name.
 *
 * - A CJK-leading name takes its first character: 「张伟」→「张」.
 * - A Latin name takes the first letters of the first two words,
 *   uppercased: `"john doe"` → `"JD"`, `"alice"` → `"A"`.
 * - Whitespace-only input yields `''`.
 */
export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';

  const first = trimmed[0];
  if (CJK.test(first)) return first;

  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}
