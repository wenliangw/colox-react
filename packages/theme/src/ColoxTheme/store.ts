/**
 * ColoxTheme 的全局存储层：theme / palette / breakpoint 三轴的唯一事实源。
 *
 * 状态写向 <html> 的 data-colox-* 属性（CSS 选择器读同一处）；React 侧
 * （useColoxTheme / parts）只是这个存储层的订阅者与配置入口。存储层是
 * 模块级单例（每个 JS realm 一份，天然对应一个 document），SSR 安全：
 * 浏览器 API 都在 subscribe（提交阶段）里惰性接线——纯渲染路径不碰
 * window/document，首次交互/提交前不会有副作用。
 *
 * 无 Provider 退化正是这个单例的副产品：useColoxTheme 不依赖 React
 * Context，任何地方调用都读到同一份 state。
 */
import { defaultBreakpoints } from '../styles/tokens/breakpoints';
import type {
  BreakpointKey,
  BreakpointName,
  BreakpointOverrides,
  ColoxThemeName,
  ColoxThemeValue,
} from './types';

type Listener = () => void;

const BREAKPOINT_KEYS: BreakpointKey[] = ['sm', 'md', 'lg', 'xl'];
const SYSTEM_QUERY = '(prefers-color-scheme: dark)';
const THEME_STORAGE_KEY = 'colox:theme';
const PALETTE_STORAGE_KEY = 'colox:palette';

interface StoreState {
  theme: ColoxThemeName;
  palette: string | undefined;
  breakpoint: BreakpointName;
  systemTheme: 'light' | 'dark';
}

let state: StoreState = {
  theme: 'system',
  palette: undefined,
  breakpoint: 'base',
  systemTheme: 'light',
};
let defaultTheme: 'light' | 'dark' = 'light';
let breakpointValues: Record<BreakpointKey, string> = { ...defaultBreakpoints };
let storageEnabled = false;
let wired = false;
let themeQuery: MediaQueryList | null = null;
let breakpointQueries: MediaQueryList[] = [];
const listeners = new Set<Listener>();
let snapshot: ColoxThemeValue = buildSnapshot();

function resolvedTheme(): string {
  return state.theme === 'system' ? state.systemTheme : state.theme;
}

function buildSnapshot(): ColoxThemeValue {
  return {
    theme: state.theme,
    resolvedTheme: resolvedTheme(),
    isFollowSystem: state.theme === 'system',
    palette: state.palette,
    breakpoint: state.breakpoint,
    setTheme: setColoxTheme,
    setPalette: setColoxPalette,
    setBreakpoints: setColoxBreakpoints,
  };
}

function emit() {
  snapshot = buildSnapshot();
  for (const listener of listeners) listener();
}

function applyAttributes() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-colox-theme', resolvedTheme());
  if (state.palette === undefined) root.removeAttribute('data-colox-palette');
  else root.setAttribute('data-colox-palette', state.palette);
  if (state.breakpoint === 'base') root.removeAttribute('data-colox-breakpoint');
  else root.setAttribute('data-colox-breakpoint', state.breakpoint);
}

function onSystemChange(event: MediaQueryListEvent) {
  state = { ...state, systemTheme: event.matches ? 'dark' : 'light' };
  applyAttributes();
  emit();
}

function computeBreakpoint(): BreakpointName {
  for (let i = 0; i < BREAKPOINT_KEYS.length; i += 1) {
    if (breakpointQueries[i].matches) return BREAKPOINT_KEYS[i];
  }
  return 'base';
}

function onBreakpointChange() {
  const next = computeBreakpoint();
  if (next === state.breakpoint) return;
  state = { ...state, breakpoint: next };
  applyAttributes();
  emit();
}

function rebindBreakpointQueries() {
  for (const mql of breakpointQueries) mql.removeEventListener('change', onBreakpointChange);
  breakpointQueries = BREAKPOINT_KEYS.map((key) =>
    window.matchMedia(`(max-width: ${breakpointValues[key]})`),
  );
  for (const mql of breakpointQueries) mql.addEventListener('change', onBreakpointChange);
  state = { ...state, breakpoint: computeBreakpoint() };
}

/** 惰性接线：每个 realm 只做一次（幂等），subscribe 提交阶段触发。 */
function wire() {
  if (wired) return;
  wired = true;
  if (typeof window === 'undefined') return;
  if (typeof window.matchMedia === 'function') {
    state = { ...state, systemTheme: window.matchMedia(SYSTEM_QUERY).matches ? 'dark' : 'light' };
    themeQuery = window.matchMedia(SYSTEM_QUERY);
    themeQuery.addEventListener('change', onSystemChange);
    rebindBreakpointQueries();
  } else {
    state = { ...state, systemTheme: defaultTheme };
  }
  applyAttributes();
  emit();
}

/* ---------------------------------------------------------------- */
/* 配置入口（parts / 高级用法）                                      */
/* ---------------------------------------------------------------- */

export interface ColoxThemeConfigPatch {
  theme?: ColoxThemeName;
  defaultTheme?: 'light' | 'dark';
  palette?: string | undefined;
  breakpoints?: BreakpointOverrides;
  storage?: boolean;
}

export function setColoxTheme(theme: ColoxThemeName) {
  if (theme === state.theme) return;
  state = { ...state, theme };
  applyAttributes();
  persist();
  emit();
}

export function setColoxPalette(palette: string | undefined) {
  if (palette === state.palette) return;
  state = { ...state, palette };
  applyAttributes();
  persist();
  emit();
}

export function setColoxBreakpoints(values: BreakpointOverrides) {
  breakpointValues = { ...defaultBreakpoints, ...values };
  if (!wired) return;
  if (typeof window.matchMedia !== 'function') return;
  const before = state.breakpoint;
  rebindBreakpointQueries();
  applyAttributes();
  if (state.breakpoint !== before) emit();
}

export function setColoxDefaultTheme(value: 'light' | 'dark') {
  defaultTheme = value;
  // 只有系统传感器不可用时兜底值才进入状态；传感器在场时它只是 SSR 快照约定。
  if (wired && typeof window.matchMedia !== 'function') {
    state = { ...state, systemTheme: value };
    applyAttributes();
    emit();
  }
}

export function setColoxStorageEnabled(enabled: boolean) {
  if (storageEnabled === enabled) return;
  storageEnabled = enabled;
  // 挂在配置应用的最后一步：恢复值覆盖 part 声明（storage > part > default）。
  if (enabled) restoreFromStorage();
}

function restoreFromStorage() {
  if (typeof window === 'undefined' || !storageEnabled) return;
  let changed = false;
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const savedPalette = window.localStorage.getItem(PALETTE_STORAGE_KEY);
    if (savedTheme !== null && savedTheme !== state.theme) {
      state = { ...state, theme: savedTheme as ColoxThemeName };
      changed = true;
    }
    if (savedPalette !== null) {
      const palette = savedPalette === '' ? undefined : savedPalette;
      if (palette !== state.palette) {
        state = { ...state, palette };
        changed = true;
      }
    }
  } catch {
    // 私密模式等 storage 不可用场景：静默降级到 part/默认值。
  }
  if (changed) {
    applyAttributes();
    emit();
  }
}

function persist() {
  if (typeof window === 'undefined' || !storageEnabled) return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, state.theme);
    if (state.palette === undefined) window.localStorage.removeItem(PALETTE_STORAGE_KEY);
    else window.localStorage.setItem(PALETTE_STORAGE_KEY, state.palette);
  } catch {
    // storage 不可用：跳过，不影响内存态。
  }
}

/** parts 折叠后的统一配置应用入口。 */
export function applyColoxConfig(patch: ColoxThemeConfigPatch) {
  wire();
  if (patch.theme !== undefined) setColoxTheme(patch.theme);
  if (patch.defaultTheme !== undefined) setColoxDefaultTheme(patch.defaultTheme);
  if (patch.palette !== undefined) setColoxPalette(patch.palette);
  if (patch.breakpoints !== undefined) setColoxBreakpoints(patch.breakpoints);
  if (patch.storage !== undefined) setColoxStorageEnabled(patch.storage);
}

/* ---------------------------------------------------------------- */
/* 订阅面（useSyncExternalStore）                                    */
/* ---------------------------------------------------------------- */

export function subscribeColoxTheme(listener: Listener): () => void {
  const first = listeners.size === 0;
  listeners.add(listener);
  // React 在提交阶段调用 subscribe，此时接线安全（首帧前属性已就位）。
  if (first) wire();
  return () => {
    listeners.delete(listener);
  };
}

export function getColoxThemeSnapshot(): ColoxThemeValue {
  return snapshot;
}

const serverSnapshot: ColoxThemeValue = {
  theme: 'system',
  resolvedTheme: 'light',
  isFollowSystem: true,
  palette: undefined,
  breakpoint: 'base',
  setTheme: setColoxTheme,
  setPalette: setColoxPalette,
  setBreakpoints: setColoxBreakpoints,
};

export function getColoxThemeServerSnapshot(): ColoxThemeValue {
  return serverSnapshot;
}

/** 测试专用：把单例状态归零（不从 index 导出，不进入发布类型面）。 */
export function _resetColoxThemeStateForTests() {
  state = { theme: 'system', palette: undefined, breakpoint: 'base', systemTheme: 'light' };
  defaultTheme = 'light';
  breakpointValues = { ...defaultBreakpoints };
  storageEnabled = false;
  wired = false;
  themeQuery = null;
  breakpointQueries = [];
  listeners.clear();
  snapshot = buildSnapshot();
  if (typeof document !== 'undefined') {
    for (const name of ['data-colox-theme', 'data-colox-palette', 'data-colox-breakpoint']) {
      document.documentElement.removeAttribute(name);
    }
  }
}
