/**
 * The hint-layer surface families — the six Button/DatePicker palette
 * names mapped onto the tooltip's surface. The classes live on the
 * CONTENT (the cva recipe target); the actual paint lives on the
 * PANEL (palette.scss): the custom property --colox-tooltip-fill is
 * declared at the panel level because the content AND its arrow
 * sibling both resolve it (see base.scss). Gray is the default
 * neutral — the classless base, like `dark` was.
 */
export const tooltipPaletteStyles = {
  gray: '',
  primary: 'colox-tooltip__content--primary',
  info: 'colox-tooltip__content--info',
  error: 'colox-tooltip__content--error',
  warning: 'colox-tooltip__content--warning',
  success: 'colox-tooltip__content--success',
} as const;
