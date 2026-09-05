import type { ReactNode } from 'react';

/**
 * ColoxTheme 运行时的类型面。
 *
 * 主题轴词汇：内置 light/dark + 'system'（跟随系统）+ 自由度尾巴——CLI
 * 编译出的自定义主题名（如 'deep'）也能过类型检查，内置名保留补全。
 */
export type ColoxThemeName = 'light' | 'dark' | 'system' | (string & {});

/** 响应式断点键名：与组件 CSS 的 [data-colox-breakpoint='…'] 属性选择器契约绑定。 */
export type BreakpointKey = 'sm' | 'md' | 'lg' | 'xl';

/** 当前断点：无任何 max-width 命中时为 'base'（属性摘除，桌面默认）。 */
export type BreakpointName = 'base' | BreakpointKey;

/** 断点覆盖：只允许覆盖值（键名即 CSS 契约）。 */
export type BreakpointOverrides = Partial<Record<BreakpointKey, string>>;

export interface ColoxThemeValue {
  /** 设定值：'system' 表示跟随系统。 */
  theme: ColoxThemeName;
  /** 实际生效主题（跟随中 = 系统实际值），永远具体。 */
  resolvedTheme: string;
  /** theme === 'system' 的推导；follow 状态由 context 全程内部控制。 */
  isFollowSystem: boolean;
  /** 色板轴名；undefined = 官方默认（属性摘除）。 */
  palette: string | undefined;
  /** 当前断点；'base' = 无命中（属性摘除）。 */
  breakpoint: BreakpointName;
  setTheme: (theme: ColoxThemeName) => void;
  setPalette: (palette: string | undefined) => void;
  setBreakpoints: (values: BreakpointOverrides) => void;
}

export interface ColoxThemeThemePartProps {
  name?: ColoxThemeName;
  /** 系统跟随不可用（无 matchMedia）时的兜底；默认 'light'。 */
  defaultTheme?: 'light' | 'dark';
}

export interface ColoxThemePalettePartProps {
  /** 色板轴名（即 colox.theme.json 编译产物的 output.name）；undefined = 默认。 */
  name?: string;
}

export interface ColoxThemeBreakpointsPartProps {
  values: BreakpointOverrides;
}

export interface ColoxThemeStoragePartProps {
  /** 占位：显隐即开关，无 props。 */
  children?: never;
}

export interface ColoxThemeProps {
  children?: ReactNode;
}

export type ColoxThemePartKind = 'theme' | 'palette' | 'breakpoints' | 'storage';

export interface ColoxThemeThemeEntry {
  id: string;
  kind: 'theme';
  payload: { name: ColoxThemeName; defaultTheme: 'light' | 'dark' };
}

export interface ColoxThemePaletteEntry {
  id: string;
  kind: 'palette';
  payload: { name: string | undefined };
}

export interface ColoxThemeBreakpointsEntry {
  id: string;
  kind: 'breakpoints';
  payload: { values: BreakpointOverrides };
}

export interface ColoxThemeStorageEntry {
  id: string;
  kind: 'storage';
  payload: { enabled: boolean };
}

export type ColoxThemeRegistryEntry =
  | ColoxThemeThemeEntry
  | ColoxThemePaletteEntry
  | ColoxThemeBreakpointsEntry
  | ColoxThemeStorageEntry;
