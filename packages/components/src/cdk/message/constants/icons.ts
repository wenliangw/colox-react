import { IconError, IconInfo, IconSuccess, IconWarning } from '@colox/icons';
import type { MessageMode } from '../types';

/**
 * The mode → icon map shared by the consumer kinds (toast and notify
 * both tint the semantic icon with the palette color). The icon
 * glyph itself is monochrome; the color comes from the CSS via the
 * `--colox-color-text-*` tokens on `colox-message--{mode}`.
 */
export const MODE_ICONS: Record<MessageMode, typeof IconInfo> = {
  info: IconInfo,
  success: IconSuccess,
  warning: IconWarning,
  error: IconError,
};
