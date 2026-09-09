import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Eye,
  EyeOff,
  IconBase,
  Plus,
  Search,
  X,
} from '../src';
import { chevronPath } from '../src/icons/geometry/chevron';
import { eyeOutlinePath, eyeSlashPath } from '../src/icons/geometry/eye';

type Icon = typeof ChevronRight;

/**
 * The IconBase contract every icon must render (spec §1–2): 24 canvas,
 * stroke set (no fill), 1.5 round stroke, currentColor color and 1em
 * sizing so colors/sizes follow the host, decorative a11y defaults.
 */
const CONTRACT = [
  'viewBox="0 0 24 24"',
  'fill="none"',
  'stroke="currentColor"',
  'stroke-width="1.5"',
  'stroke-linecap="round"',
  'stroke-linejoin="round"',
  'width="1em"',
  'height="1em"',
  'focusable="false"',
  'aria-hidden="true"',
];

/**
 * Documented optical bounds per glyph, stroke bleed (±0.75) included as
 * [xMin, xMax, yMin, yMax]. Values are derived from the designed
 * drawing — every glyph must fit the [2, 22] content box (spec §4).
 * Changing a drawing that breaks them is a spec violation by design.
 */
const BOUNDS: Record<string, [number, number, number, number]> = {
  'chevron-right': [8.25, 17.75, 5.25, 18.75],
  'chevron-down': [5.25, 18.75, 8.25, 17.75],
  'chevron-left': [6.25, 15.75, 5.25, 18.75],
  'chevron-up': [5.25, 18.75, 6.25, 15.75],
  x: [5.25, 18.75, 5.25, 18.75],
  check: [3.25, 20.75, 5.25, 17.75],
  plus: [5.25, 18.75, 5.25, 18.75],
  'eye-off': [3.25, 20.75, 4.25, 19.75],
  eye: [3.25, 20.75, 4.25, 19.75],
  search: [3.25, 20.75, 3.25, 20.75],
};

interface IconSpec {
  name: string;
  component: Icon;
  /** Designed path drawings, in render order (spec: the geometry lock). */
  paths: string[];
  /** Designed circle primitives as cx,cy,r. */
  circle?: [number, number, number];
  /** Designed direction rotation; absent = base rotation. */
  transform?: string;
}

const ICONS: IconSpec[] = [
  { name: 'chevron-right', component: ChevronRight, paths: [chevronPath] },
  {
    name: 'chevron-down',
    component: ChevronDown,
    paths: [chevronPath],
    transform: 'rotate(90 12 12)',
  },
  {
    name: 'chevron-left',
    component: ChevronLeft,
    paths: [chevronPath],
    transform: 'rotate(180 12 12)',
  },
  {
    name: 'chevron-up',
    component: ChevronUp,
    paths: [chevronPath],
    transform: 'rotate(270 12 12)',
  },
  { name: 'x', component: X, paths: ['M6 6 L18 18 M18 6 L6 18'] },
  { name: 'check', component: Check, paths: ['M20 6 L9 17 L4 12'] },
  { name: 'plus', component: Plus, paths: ['M12 6 V18 M6 12 H18'] },
  {
    name: 'eye',
    component: Eye,
    paths: [eyeOutlinePath],
    circle: [12, 12, 3],
  },
  {
    name: 'eye-off',
    component: EyeOff,
    paths: [eyeOutlinePath, eyeSlashPath],
  },
  {
    name: 'search',
    component: Search,
    paths: ['M16 16 L20 20'],
    circle: [11, 11, 7],
  },
];

const renderIcon = (component: Icon): string => renderToStaticMarkup(createElement(component));

/** All numeric tokens in the geometry attributes (d / cx / cy / r / transform). */
const geometryNumbers = (html: string): number[] =>
  [...html.matchAll(/(?:d|cx|cy|r|transform)="([^"]*)"/g)].flatMap((match) =>
    [...(match[1].matchAll(/-?\d*\.?\d+/g) ?? [])].map(([token]) => Number(token)),
  );

/**
 * Explicit node coordinates of a path drawing (M/L endpoints, A end
 * points, H/V single coordinates) — the grid checker walks only these,
 * since interior arc control points stay under the drawing lock.
 */
const pathEndpoints = (d: string): [number, number][] => {
  const points: [number, number][] = [];
  let last: [number, number] = [0, 0];
  for (const segment of d.matchAll(/([MLHVA])(-?[\d.\s]+)(?=[MLHVA]|$)/g)) {
    const command = segment[1];
    const tokens = segment[2].trim().split(/\s+/).map(Number);
    if (command === 'Z') continue;
    if (command === 'M' || command === 'L') {
      last = [tokens[tokens.length - 2], tokens[tokens.length - 1]];
      points.push(last);
    } else if (command === 'H') {
      last = [tokens[tokens.length - 1], last[1]];
      points.push(last);
    } else if (command === 'V') {
      last = [last[0], tokens[tokens.length - 1]];
      points.push(last);
    } else {
      // A: rx ry x-axis-rotation large-arc sweep x y — the endpoint is the last pair
      last = [tokens[tokens.length - 2], tokens[tokens.length - 1]];
      points.push(last);
    }
  }
  return points;
};

describe('icon spec', () => {
  it.each(ICONS)('$name renders the IconBase contract', ({ component }) => {
    const html = renderIcon(component);
    for (const attr of CONTRACT) {
      expect(html).toContain(attr);
    }
  });

  it.each(ICONS)(
    '$name renders exactly the designed drawing',
    ({ component, paths, transform }) => {
      const html = renderIcon(component);
      for (const d of paths) {
        expect(html).toContain(`d="${d}"`);
      }
      expect([...html.matchAll(/<path /g)]).toHaveLength(paths.length);
      if (transform === undefined) {
        expect(html).not.toContain('transform="');
      } else {
        expect(html).toContain(`transform="${transform}"`);
      }
    },
  );

  it.each(ICONS)('$name renders the designed circles', ({ component, circle }) => {
    const html = renderIcon(component);
    expect([...html.matchAll(/<circle /g)]).toHaveLength(circle === undefined ? 0 : 1);
    if (circle !== undefined) {
      const [cx, cy, r] = circle;
      expect(html).toContain(`<circle cx="${cx}" cy="${cy}" r="${r}"`);
    }
  });

  it.each(ICONS)('$name draws every geometry number on the integer grid', ({ component }) => {
    const numbers = geometryNumbers(renderIcon(component));
    expect(numbers.length).toBeGreaterThan(0);
    expect(numbers.every(Number.isInteger)).toBe(true);
  });

  it.each(ICONS)(
    '$name keeps every explicit node inside the [2, 22] content box',
    ({ component, circle }) => {
      const html = renderIcon(component);
      const values = (): number[][] =>
        [...html.matchAll(/d="([^"]*)"/g)].flatMap((match) => pathEndpoints(match[1]));
      for (const [x, y] of values()) {
        expect(x).toBeGreaterThanOrEqual(2);
        expect(x).toBeLessThanOrEqual(22);
        expect(y).toBeGreaterThanOrEqual(2);
        expect(y).toBeLessThanOrEqual(22);
      }
      if (circle !== undefined) {
        const [cx, cy, r] = circle;
        for (const value of [cx - r, cx + r, cy - r, cy + r]) {
          expect(value).toBeGreaterThanOrEqual(2);
          expect(value).toBeLessThanOrEqual(22);
        }
      }
    },
  );

  it.each(ICONS)('$name documented bounds stay inside the content box', ({ name }) => {
    const [xMin, xMax, yMin, yMax] = BOUNDS[name];
    expect(xMin).toBeGreaterThanOrEqual(2);
    expect(xMax).toBeLessThanOrEqual(22);
    expect(yMin).toBeGreaterThanOrEqual(2);
    expect(yMax).toBeLessThanOrEqual(22);
  });

  it('chevron directions share one geometry, rotated around the canvas center', () => {
    const dirs = ICONS.filter(({ name }) => name.startsWith('chevron'));
    const directions = new Map(dirs.map(({ name, component }) => [name, renderIcon(component)]));
    const right = directions.get('chevron-right') ?? '';
    for (const dir of dirs) {
      expect(directions.get(dir.name ?? '')).toContain(`d="${chevronPath}"`);
    }
    expect(right).not.toContain('transform="');
    expect(directions.get('chevron-down')).toContain('transform="rotate(90 12 12)"');
    expect(directions.get('chevron-left')).toContain('transform="rotate(180 12 12)"');
    expect(directions.get('chevron-up')).toContain('transform="rotate(270 12 12)"');
  });

  it('eye-off derives from eye: shared outline, pupil swapped for the slash', () => {
    const eye = renderIcon(Eye);
    const off = renderIcon(EyeOff);
    expect(off).toContain(`d="${eyeOutlinePath}"`);
    expect(off).toContain(`d="${eyeSlashPath}"`);
    expect(off).not.toContain('<circle');
    expect(eye).toContain('<circle cx="12" cy="12" r="3"');
    expect(eye).not.toContain(`d="${eyeSlashPath}"`);
  });

  it('consumers keep the fork channel: explicit attributes override the defaults', () => {
    const html = renderToStaticMarkup(
      createElement(IconBase, {
        strokeWidth: 3,
        'aria-hidden': false,
        children: createElement('path', { d: chevronPath }),
      }),
    );
    expect(html).toContain('stroke-width="3"');
    expect(html).toContain('aria-hidden="false"');
  });
});
