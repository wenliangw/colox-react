// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { resetMedia, setSystemPrefersDark, setViewportWidth } from '../utils/match-media';
import {
  _resetColoxThemeStateForTests,
  getColoxThemeSnapshot,
  setColoxBreakpoints,
  setColoxPalette,
  setColoxStorageEnabled,
  setColoxTheme,
  subscribeColoxTheme,
} from '@/components/theme-context/stores/theme-store';

const root = () => document.documentElement;
const attr = (name: string) => root().getAttribute(name);

function attach() {
  return subscribeColoxTheme(() => undefined);
}

beforeEach(() => {
  _resetColoxThemeStateForTests();
  resetMedia();
  window.localStorage.clear();
});

describe('follow-system (built in, zero-config)', () => {
  it('defaults to following: the attribute is the system value, isFollowSystem stays true', () => {
    attach();
    expect(attr('data-colox-theme')).toBe('light');
    expect(getColoxThemeSnapshot().isFollowSystem).toBe(true);

    setSystemPrefersDark(true);
    expect(attr('data-colox-theme')).toBe('dark');
    expect(getColoxThemeSnapshot().resolvedTheme).toBe('dark');
    expect(getColoxThemeSnapshot().theme).toBe('system');
  });

  it("setTheme('deep') leaves follow; setTheme('system') returns to it", () => {
    attach();
    setColoxTheme('deep');
    expect(attr('data-colox-theme')).toBe('deep');
    expect(getColoxThemeSnapshot().isFollowSystem).toBe(false);

    // In manual mode the system flips no longer touch the attribute
    setSystemPrefersDark(true);
    expect(attr('data-colox-theme')).toBe('deep');
    expect(getColoxThemeSnapshot().resolvedTheme).toBe('deep');

    setColoxTheme('system');
    expect(attr('data-colox-theme')).toBe('dark');
    expect(getColoxThemeSnapshot().isFollowSystem).toBe(true);
  });
});

describe('palette axis', () => {
  it('writes / removes the data-colox-palette attribute', () => {
    attach();
    setColoxPalette('brand-2025');
    expect(attr('data-colox-palette')).toBe('brand-2025');

    setColoxPalette(undefined);
    expect(root().hasAttribute('data-colox-palette')).toBe(false);
  });
});

describe('breakpoints', () => {
  it('writes the attribute when matchMedia matches: the smallest matching segment wins', () => {
    attach();
    expect(root().hasAttribute('data-colox-breakpoint')).toBe(false);
    expect(getColoxThemeSnapshot().breakpoint).toBe('base');

    setViewportWidth(1199);
    expect(attr('data-colox-breakpoint')).toBe('xl');

    setViewportWidth(700);
    expect(attr('data-colox-breakpoint')).toBe('md');

    setViewportWidth(2000);
    expect(root().hasAttribute('data-colox-breakpoint')).toBe(false);
  });

  it('overrides threshold values, keeping the contract keys fixed', () => {
    attach();
    setColoxBreakpoints({ md: '900px' });
    setViewportWidth(850);
    expect(attr('data-colox-breakpoint')).toBe('md');
    setViewportWidth(950);
    expect(attr('data-colox-breakpoint')).toBe('lg');
  });
});

describe('persistence', () => {
  it('writes through to localStorage once storage is enabled', () => {
    attach();
    setColoxStorageEnabled(true);
    setColoxTheme('dark');
    setColoxPalette('demo');
    expect(window.localStorage.getItem('colox:theme')).toBe('dark');
    expect(window.localStorage.getItem('colox:palette')).toBe('demo');
  });

  it('restores saved values the moment storage is enabled (storage > default)', () => {
    window.localStorage.setItem('colox:theme', 'dark');
    window.localStorage.setItem('colox:palette', 'demo');
    attach();
    setColoxStorageEnabled(true);
    expect(attr('data-colox-theme')).toBe('dark');
    expect(attr('data-colox-palette')).toBe('demo');
    expect(getColoxThemeSnapshot().theme).toBe('dark');
  });
});
