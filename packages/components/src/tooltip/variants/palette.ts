/**
 * The hint-layer surface families — the six Button/DatePicker palette
 * names plus the light inverse (white, the white-900 ladder rung),
 * mapped onto the tooltip's surface. The classes live on the CONTENT
 * (the cva recipe target); the actual paint lives on the PANEL
 * (palette.scss): the custom properties --colox-tooltip-fill and
 * --colox-tooltip-text are declared at the panel level because the
 * content (both) AND its arrow sibling (the fill) resolve them (see
 * base.scss). Gray is the default neutral — the classless base.
 */
export const tooltipPaletteStyles = {
  gray: '',
  primary: 'colox-tooltip__content--primary',
  info: 'colox-tooltip__content--info',
  error: 'colox-tooltip__content--error',
  warning: 'colox-tooltip__content--warning',
  success: 'colox-tooltip__content--success',
  white: 'colox-tooltip__content--white',
} as const;
