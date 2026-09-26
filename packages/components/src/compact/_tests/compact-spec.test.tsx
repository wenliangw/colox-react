import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// The seam contract, linted at the source level: the rules below encode
// the lessons the compact layer learned the hard way — (1) member shapes
// must be overridden at 0,3,0 so stylesheet order cannot re-round them,
// (2) focus is the unit's business: the group rings as a whole while a
// member ring — or the input family's focus border change — inside the
// group can only draw a second layer over or under the ring, (3) an
// invalid member invalidates the whole unit — the outline reddens and any
// focus inside rings red, and (4) width, elevation and press-scale
// belong to the whole unit.
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

  it('exempts shape-keeping members from the corner rules', () => {
    expect(seam).toContain('$compact-shape-keepers');
    expect(seam).toContain('.colox-switch');
    expect(seam).toContain('.colox-slider');
  });

  it('rings the whole unit when an input-family member is focused or its panel is open', () => {
    // The ring hugs the input family — a focused Button keeps its own
    // ring, the unit does not pretend to be a text control for it.
    expect(seam).toContain('&:focus-within:has(> :is(#{$compact-input-family}):focus-within),');
    expect(seam).toContain("&:has(> [class*='--open'])");
    expect(seam).toContain('box-shadow: 0 0 0 2px var(--colox-compact-palette-ring)');
    // Member rings stay silent — scoped to the same family.
    expect(seam).toContain(':is(#{$compact-input-family}):focus-within:not(:disabled)');
    expect(seam).toContain('box-shadow: none;');
  });

  it('channels the unit palette word into the ring, frame and dividers', () => {
    // Absent a palette word the channel resolves to today's look.
    expect(seam).toContain('--colox-compact-palette-ring: var(--colox-color-brand-muted);');
    expect(seam).toContain('--colox-compact-palette-border: var(--colox-color-border-muted);');
    expect(seam).toContain('--colox-compact-palette-divider: var(--colox-color-border-subtle);');
    // The six word classes ride the Switch/Slider wiring.
    for (const family of ['primary', 'gray', 'info', 'error', 'warning', 'success']) {
      expect(seam).toContain(`.colox-compact--palette-${family} {`);
    }
    expect(seam).toContain('--colox-compact-palette-ring: var(--colox-color-blue-muted);');
    expect(seam).toContain('--colox-compact-palette-border: var(--colox-color-orange-solid);');
    expect(seam).toContain('--colox-compact-palette-divider: var(--colox-color-green-muted);');
  });

  it('turns the ring red on any engagement inside an invalid unit', () => {
    expect(seam).toContain("&:has(> [class*='--invalid']) {");
    expect(seam).toContain('box-shadow: 0 0 0 2px var(--colox-color-red-muted)');
  });

  it('divides the unit with one frame and floating short dividers', () => {
    expect(seam).toContain('.colox-compact--divide {');
    // One frame around the unit — colored through the palette channel…
    expect(seam).toContain('border: 1px solid var(--colox-compact-palette-border);');
    expect(seam).toContain('border-radius: var(--colox-radius-lg);');
    // …no overlapping pulls…
    expect(seam).toContain('margin-inline-start: 0;');
    // …a short floating bar halves the segment height instead of a
    // full-height border that would weld into the frame (and would be
    // zeroed by the members' border strip)…
    expect(seam).toContain('> * + *::before {');
    expect(seam).toContain('inset-block: 25%;');
    expect(seam).toContain('inset-inline-start: 0;');
    expect(seam).toContain('background-color: var(--colox-compact-palette-divider);');
    expect(seam).not.toContain('border-inline-start: 1px solid');
    // …members drop their own borders…
    expect(seam).toContain('border: 0;');
    // …and an invalid member reddens the frame and the bars together.
    expect(seam).toContain('background-color: var(--colox-color-red-solid);');
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
    expect(seam).toContain(":focus-within:not([class*='--invalid'])");
    expect(seam).toContain('border-color: var(--colox-color-border-muted);');
  });

  it('invalidates the whole unit — outline reddens, no per-segment surgery', () => {
    expect(seam).toContain("&:has(> [class*='--invalid'])");
    expect(seam).toContain('.colox-compact__addon');
    expect(seam).toContain('border-color: var(--colox-color-red-solid);');
    expect(seam).toContain("[class*='--disabled']");
    // The family signals invalid via the `--invalid` class on the shell
    // root — aria-invalid lives on the inner control: keying the direct
    // child on the attribute never fires (the half-red-frame bug).
    expect(seam).not.toContain('aria-invalid=');
    expect(seam).not.toContain('border-inline-color: transparent');
    expect(seam).not.toContain('z-index');
  });

  it('shares the group width with the input family', () => {
    expect(seam).toContain('$compact-input-family');
    expect(seam).toContain('flex: 1 1 auto');
    expect(seam).toContain('min-width: 0');
  });

  it('quiets button elevation and press-scale inside the seam', () => {
    for (const tier of [
      'colox-button--shadow-sm',
      'colox-button--shadow-md',
      'colox-button--shadow-lg',
    ]) {
      expect(seam).toContain(tier);
    }
    expect(seam).toContain('transform: none');
  });
});
