import { sizeKeys, type SizeKey } from '@colox/theme';

/**
 * The label column width axis behind `labelPlacement="start"`: size
 * token keys, single-sourced from the design language like every other
 * token-keyed prop (`labelWidth="24"` reads the same grid the icon and
 * control footprints do — never a px value).
 */
export const formLabelWidthStyles = Object.fromEntries(
  sizeKeys.map((key) => [key, `colox-form-field--label-w-${key}`] as const),
) as Record<SizeKey, `colox-form-field--label-w-${SizeKey}`>;
