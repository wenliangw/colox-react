// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetMedia, setSystemPrefersDark, setViewportWidth } from '../utils/match-media';
import { ColoxTheme } from '@/components/theme-context';
import { useColoxTheme } from '@/components/theme-context/hooks/use-colox-theme';
import type { ColoxThemeValue } from '@/components/theme-context/types';

let captured: ColoxThemeValue | undefined;

function Probe() {
  const value = useColoxTheme();
  captured = value;
  return <div data-testid="probe">{value.resolvedTheme}</div>;
}

const root = () => document.documentElement;
const attr = (name: string) => root().getAttribute(name);
const removeAttrs = () => {
  for (const name of ['data-colox-theme', 'data-colox-palette', 'data-colox-breakpoint']) {
    root().removeAttribute(name);
  }
};

beforeEach(() => {
  resetMedia();
  window.localStorage.clear();
  captured = undefined;
  removeAttrs();
});
afterEach(cleanup);

describe('ColoxTheme props → the three <html> axes', () => {
  it('theme/palette props land on the attributes and the hook reads the same state', () => {
    render(
      <ColoxTheme theme="deep" palette="brand-2025">
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

  it('theme prop absent = follow the system; system flips take effect (zero-config)', () => {
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

  it('theme="system" follows explicitly; the hook setTheme speaks the same vocabulary', () => {
    render(
      <ColoxTheme theme="system">
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

  it('prop changes re-apply the axes on rerender', () => {
    const { rerender } = render(
      <ColoxTheme theme="light">
        <Probe />
      </ColoxTheme>,
    );
    expect(attr('data-colox-theme')).toBe('light');
    rerender(
      <ColoxTheme theme="deep">
        <Probe />
      </ColoxTheme>,
    );
    expect(attr('data-colox-theme')).toBe('deep');
  });
});

describe('Breakpoints subcomponent', () => {
  it('overrides the thresholds and multiple instances are last-write-wins', () => {
    render(
      <ColoxTheme>
        <ColoxTheme.Breakpoints values={{ md: '700px' }} />
        <ColoxTheme.Breakpoints values={{ md: '900px' }} />
        <Probe />
      </ColoxTheme>,
    );
    act(() => setViewportWidth(800));
    expect(captured?.breakpoint).toBe('md');
    act(() => setViewportWidth(950));
    expect(captured?.breakpoint).toBe('lg');
  });

  it('writes the current segment onto <html> and removes it at base', () => {
    render(
      <ColoxTheme>
        <ColoxTheme.Breakpoints values={{ md: '900px' }} />
        <Probe />
      </ColoxTheme>,
    );
    act(() => setViewportWidth(850));
    expect(attr('data-colox-breakpoint')).toBe('md');
    act(() => setViewportWidth(2000));
    expect(root().hasAttribute('data-colox-breakpoint')).toBe(false);
  });
});

describe('Storage subcomponent', () => {
  it('restores saved values at mount, beating props (storage > props > default)', () => {
    window.localStorage.setItem('colox:theme', 'dark');
    window.localStorage.setItem('colox:palette', 'brand-2025');
    render(
      <ColoxTheme theme="light" palette="other">
        <ColoxTheme.Storage />
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

describe('no-provider usage', () => {
  it('warns and serves static defaults; the imperative setters are no-ops', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<Probe />);
    expect(captured?.theme).toBe('system');
    expect(captured?.resolvedTheme).toBe('light');
    expect(captured?.isFollowSystem).toBe(true);
    expect(root().hasAttribute('data-colox-theme')).toBe(false);

    act(() => captured?.setTheme('dark'));
    expect(captured?.theme).toBe('system');
    expect(root().hasAttribute('data-colox-theme')).toBe(false);

    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it('subcomponents outside a root go through the same protected outlet', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<ColoxTheme.Storage />);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(root().hasAttribute('data-colox-theme')).toBe(false);
    warn.mockRestore();
  });
});
