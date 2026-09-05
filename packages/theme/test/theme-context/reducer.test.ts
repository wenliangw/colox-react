import { describe, expect, it } from 'vitest';
import {
  createInitialThemeState,
  resolveTheme,
  themeReducer,
} from '@/components/theme-context/reducers/theme';

describe('theme reducer', () => {
  it('starts from the shipped defaults: follow system, base segment, storage off', () => {
    const state = createInitialThemeState();
    expect(state.theme).toBe('system');
    expect(state.palette).toBeUndefined();
    expect(state.breakpoint).toBe('base');
    expect(state.storageEnabled).toBe(false);
    expect(state.breakpointValues.md).toBe('768px');
  });

  it('returns the same object for identical transitions', () => {
    const state = createInitialThemeState();
    expect(themeReducer(state, { type: 'set-theme', theme: 'system' })).toBe(state);
    expect(themeReducer(state, { type: 'set-palette', palette: undefined })).toBe(state);
    expect(themeReducer(state, { type: 'set-storage-enabled', enabled: false })).toBe(state);
  });

  it('apply-config applies defined fields in one pass', () => {
    const state = themeReducer(createInitialThemeState(), {
      type: 'apply-config',
      patch: { theme: 'deep', palette: 'brand-2025', storage: true },
    });
    expect(state.theme).toBe('deep');
    expect(state.palette).toBe('brand-2025');
    expect(state.storageEnabled).toBe(true);
  });

  it('apply-config skips undefined fields without touching the state', () => {
    const initial = createInitialThemeState();
    const state = themeReducer(initial, { type: 'apply-config', patch: {} });
    expect(state).toBe(initial);
  });

  it('set-breakpoints merges overrides onto the token defaults', () => {
    const state = themeReducer(createInitialThemeState(), {
      type: 'set-breakpoints',
      values: { md: '900px' },
    });
    expect(state.breakpointValues.md).toBe('900px');
    expect(state.breakpointValues.sm).toBe('640px');
  });
});

describe('resolveTheme', () => {
  it('returns the system value while following and the manual value otherwise', () => {
    const following = createInitialThemeState();
    expect(resolveTheme(following)).toBe('light');

    const darkSystem = themeReducer(following, {
      type: 'set-system-theme',
      systemTheme: 'dark',
    });
    expect(resolveTheme(darkSystem)).toBe('dark');

    const manual = themeReducer(darkSystem, { type: 'set-theme', theme: 'deep' });
    expect(resolveTheme(manual)).toBe('deep');
  });
});
