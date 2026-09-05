// @vitest-environment jsdom
/**
 * Composable API integration tests: dot parts apply / re-apply /
 * last-write-wins, Storage restore priority, hook value consistency, and
 * the no-provider degradation.
 */
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { resetMedia, setSystemPrefersDark, setViewportWidth } from '../utils/match-media';
import { ColoxTheme } from '@/context';
import { useColoxTheme } from '@/hooks/use-colox-theme';
import { _resetColoxThemeStateForTests } from '@/stores/theme-store';
import type { ColoxThemeValue } from '@/context/types';

let captured: ColoxThemeValue | undefined;

function Probe() {
  const value = useColoxTheme();
  captured = value;
  return <div data-testid="probe">{value.resolvedTheme}</div>;
}

const root = () => document.documentElement;
const attr = (name: string) => root().getAttribute(name);

beforeEach(() => {
  _resetColoxThemeStateForTests();
  resetMedia();
  window.localStorage.clear();
  captured = undefined;
});
afterEach(cleanup);

describe('composable parts → the three <html> axes', () => {
  it('Theme/Palette declarations land on the attributes and the hook reads the same state', () => {
    render(
      <ColoxTheme>
        <ColoxTheme.Theme name="deep" />
        <ColoxTheme.Palette name="brand-2025" />
        <Probe />
      </ColoxTheme>,
    );
    expect(attr('data-colox-theme')).toBe('deep');
    expect(attr('data-colox-palette')).toBe('brand-2025');
    expect(captured?.theme).toBe('deep');
    expect(captured?.resolvedTheme).toBe('deep');
    expect(captured?.isFollowSystem).toBe(false);
    expect(captured?.palette).toBe('brand-2025');
  });

  it('theme part absent = follow the system; system flips take effect (zero-config)', () => {
    render(
      <ColoxTheme>
        <Probe />
      </ColoxTheme>,
    );
    expect(attr('data-colox-theme')).toBe('light');
    expect(captured?.isFollowSystem).toBe(true);
    expect(captured?.theme).toBe('system');

    act(() => setSystemPrefersDark(true));
    expect(attr('data-colox-theme')).toBe('dark');
    expect(captured?.resolvedTheme).toBe('dark');
    expect(captured?.isFollowSystem).toBe(true);
  });

  it('name="system" follows explicitly; the hook setTheme speaks the same vocabulary', () => {
    render(
      <ColoxTheme>
        <ColoxTheme.Theme name="system" />
        <Probe />
      </ColoxTheme>,
    );
    expect(captured?.theme).toBe('system');

    act(() => captured?.setTheme('deep'));
    expect(attr('data-colox-theme')).toBe('deep');
    expect(captured?.isFollowSystem).toBe(false);

    act(() => captured?.setTheme('system'));
    expect(attr('data-colox-theme')).toBe('light');
    expect(captured?.isFollowSystem).toBe(true);
  });

  it('part props changing re-applies the axis', () => {
    const { rerender } = render(
      <ColoxTheme>
        <ColoxTheme.Theme name="light" />
        <Probe />
      </ColoxTheme>,
    );
    expect(attr('data-colox-theme')).toBe('light');
    rerender(
      <ColoxTheme>
        <ColoxTheme.Theme name="deep" />
        <Probe />
      </ColoxTheme>,
    );
    expect(attr('data-colox-theme')).toBe('deep');
  });

  it('multiple parts of the same kind are last-write-wins', () => {
    render(
      <ColoxTheme>
        <ColoxTheme.Palette name="first" />
        <ColoxTheme.Palette name="second" />
        <Probe />
      </ColoxTheme>,
    );
    expect(attr('data-colox-palette')).toBe('second');
  });

  it('Breakpoints part overrides the thresholds', () => {
    render(
      <ColoxTheme>
        <ColoxTheme.Breakpoints values={{ md: '900px' }} />
        <Probe />
      </ColoxTheme>,
    );
    act(() => setViewportWidth(850));
    expect(attr('data-colox-breakpoint')).toBe('md');
    act(() => setViewportWidth(950));
    expect(attr('data-colox-breakpoint')).toBe('lg');
  });
});

describe('Storage part', () => {
  it('restores saved values at mount, beating part declarations (storage > part > default)', () => {
    window.localStorage.setItem('colox:theme', 'dark');
    window.localStorage.setItem('colox:palette', 'brand-2025');
    render(
      <ColoxTheme>
        <ColoxTheme.Storage />
        <ColoxTheme.Theme name="light" />
        <ColoxTheme.Palette name="other" />
        <Probe />
      </ColoxTheme>,
    );
    expect(attr('data-colox-theme')).toBe('dark');
    expect(attr('data-colox-palette')).toBe('brand-2025');
  });

  it('setTheme writes through to localStorage', () => {
    render(
      <ColoxTheme>
        <ColoxTheme.Storage />
        <Probe />
      </ColoxTheme>,
    );
    act(() => captured?.setTheme('dark'));
    expect(window.localStorage.getItem('colox:theme')).toBe('dark');
    act(() => captured?.setPalette('demo'));
    expect(window.localStorage.getItem('colox:palette')).toBe('demo');
  });
});

describe('no-provider degradation', () => {
  it('the hook reads the global store defaults directly', () => {
    render(<Probe />);
    expect(captured?.theme).toBe('system');
    expect(captured?.resolvedTheme).toBe('light');
    expect(attr('data-colox-theme')).toBe('light');
  });
});
