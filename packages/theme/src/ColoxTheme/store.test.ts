// @vitest-environment jsdom
/**
 * 存储层单测：三轴属性写入、系统跟随/手动覆盖、断点观察、持久化恢复。
 * 单例状态在每条测试前归零（_resetColoxThemeStateForTests 只存在于
 * store 内部导出，不进发布类型面）。
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { resetMedia, setSystemPrefersDark, setViewportWidth } from '../../test/match-media';
import {
  _resetColoxThemeStateForTests,
  getColoxThemeSnapshot,
  setColoxBreakpoints,
  setColoxPalette,
  setColoxStorageEnabled,
  setColoxTheme,
  subscribeColoxTheme,
} from './store';

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

describe('system follow（跟随系统，零配置内建）', () => {
  it('缺省即跟随：属性 = 系统实际值，isFollowSystem 恒 true', () => {
    attach();
    expect(attr('data-colox-theme')).toBe('light');
    expect(getColoxThemeSnapshot().isFollowSystem).toBe(true);

    setSystemPrefersDark(true);
    expect(attr('data-colox-theme')).toBe('dark');
    expect(getColoxThemeSnapshot().resolvedTheme).toBe('dark');
    expect(getColoxThemeSnapshot().theme).toBe('system');
  });

  it("setTheme('deep') 脱离跟随；setTheme('system') 回到跟随", () => {
    attach();
    setColoxTheme('deep');
    expect(attr('data-colox-theme')).toBe('deep');
    expect(getColoxThemeSnapshot().isFollowSystem).toBe(false);

    // 手动模式下系统切换不再影响属性
    setSystemPrefersDark(true);
    expect(attr('data-colox-theme')).toBe('deep');
    expect(getColoxThemeSnapshot().resolvedTheme).toBe('deep');

    setColoxTheme('system');
    expect(attr('data-colox-theme')).toBe('dark');
    expect(getColoxThemeSnapshot().isFollowSystem).toBe(true);
  });
});

describe('palette axis', () => {
  it('写/摘 color-palette 属性', () => {
    attach();
    setColoxPalette('brand-2025');
    expect(attr('data-colox-palette')).toBe('brand-2025');

    setColoxPalette(undefined);
    expect(root().hasAttribute('data-colox-palette')).toBe(false);
  });
});

describe('breakpoints', () => {
  it('matchMedia 命中写属性：最小命中档胜出', () => {
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

  it('值覆盖阈值，键名契约不变', () => {
    attach();
    setColoxBreakpoints({ md: '900px' });
    setViewportWidth(850);
    expect(attr('data-colox-breakpoint')).toBe('md');
    setViewportWidth(950);
    expect(attr('data-colox-breakpoint')).toBe('lg');
  });
});

describe('persistence', () => {
  it('storage 开启后 set 自动写回', () => {
    attach();
    setColoxStorageEnabled(true);
    setColoxTheme('dark');
    setColoxPalette('demo');
    expect(window.localStorage.getItem('colox:theme')).toBe('dark');
    expect(window.localStorage.getItem('colox:palette')).toBe('demo');
  });

  it('开启 storage 即恢复（storage > default）', () => {
    window.localStorage.setItem('colox:theme', 'dark');
    window.localStorage.setItem('colox:palette', 'demo');
    attach();
    setColoxStorageEnabled(true);
    expect(attr('data-colox-theme')).toBe('dark');
    expect(attr('data-colox-palette')).toBe('demo');
    expect(getColoxThemeSnapshot().theme).toBe('dark');
  });
});
