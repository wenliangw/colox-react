// @vitest-environment jsdom
/**
 * 组合式 API 集成测试：dot parts 声明施加/重应用/last-write-wins、
 * Storage 恢复优先级、hook 值一致性、无 Provider 退化。
 */
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { resetMedia, setSystemPrefersDark, setViewportWidth } from '../../test/match-media';
import { ColoxTheme } from './ColoxTheme';
import { useColoxTheme } from './ColoxThemeContext';
import { _resetColoxThemeStateForTests } from './store';
import type { ColoxThemeValue } from './types';

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

describe('组合式 parts → <html> 三轴', () => {
  it('Theme/Palette declaration 施加到属性，hook 读到一致状态', () => {
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

  it('主题缺席 = 跟随系统，系统切换即生效（零配置）', () => {
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

  it('name="system" 显式跟随；hook setTheme 用同一套词', () => {
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

  it('part props 变化即重新应用', () => {
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

  it('同类 part 多实例 last-write-wins', () => {
    render(
      <ColoxTheme>
        <ColoxTheme.Palette name="first" />
        <ColoxTheme.Palette name="second" />
        <Probe />
      </ColoxTheme>,
    );
    expect(attr('data-colox-palette')).toBe('second');
  });

  it('Breakpoints part 覆盖阈值', () => {
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
  it('挂载时恢复覆盖 part 声明（storage > part > default）', () => {
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

  it('setTheme 写穿 localStorage', () => {
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

describe('无 Provider 退化', () => {
  it('hook 直读全局 store 默认状态', () => {
    render(<Probe />);
    expect(captured?.theme).toBe('system');
    expect(captured?.resolvedTheme).toBe('light');
    expect(attr('data-colox-theme')).toBe('light');
  });
});
