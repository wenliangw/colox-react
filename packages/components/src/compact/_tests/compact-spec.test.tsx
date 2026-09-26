import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// The seam contract, linted at the source level: the rules below encode
// the lessons the compact layer learned the hard way — (1) member shapes
// must be overridden at 0,3,0 so stylesheet order cannot re-round them,
// and (2) focus is the unit's business: the group rings as a whole while
// a member ring — or the input family's focus border change — inside the
// group can only draw a second layer over or under the ring.
const seam = readFileSync(resolve(process.cwd(), 'src/compact/styles/base.scss'), 'utf8');

describe('Compact seam contract', () => {
  it('squares every junction corner at class-plus-two-pseudos', () => {
    expect(seam).toContain('> *:not(:first-child):not(:last-child)');
    expect(seam).toContain('border-radius: 0');
  });

  it('keeps radii on the outer ends only, with inner corners zeroed', () => {
    for (const corner of [
      'border-start-end-radius: 0',
      'border-end-end-radius: 0',
      'border-start-start-radius: 0',
      'border-end-start-radius: 0',
    ]) {
      expect(seam).toContain(corner);
    }
  });

  it('rings the whole unit on focus — member rings stay silent', () => {
    expect(seam).toContain('&:focus-within {');
    expect(seam).toContain('box-shadow: 0 0 0 2px var(--colox-color-brand-muted)');
    expect(seam).toContain('&:focus-within:not(:disabled)');
    expect(seam).toContain('box-shadow: none;');
  });

  it('turns the unit ring red when the focused member is invalid', () => {
    expect(seam).toContain("&:has(> [aria-invalid='true']:focus-within)");
    expect(seam).toContain('box-shadow: 0 0 0 2px var(--colox-color-red-muted)');
  });

  it('lets an invalid member rise with its red border, ring-free', () => {
    expect(seam).toContain("&[aria-invalid='true']");
    expect(seam).toContain('z-index: 1');
  });

  it('keeps the focused input family border at the resting token, never a second layer', () => {
    for (const shell of [
      '.colox-input',
      '.colox-input-number',
      '.colox-select',
      '.colox-date-picker',
      '.colox-time-picker',
      '.colox-textarea',
      '.colox-autocomplete',
    ]) {
      expect(seam).toContain(shell);
    }
    expect(seam).toContain(':focus-within:not([aria-invalid');
    expect(seam).toContain('border-color: var(--colox-color-border-muted);');
  });
});
