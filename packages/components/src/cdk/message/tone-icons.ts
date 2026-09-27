import { IconError, IconInfo, IconSuccess, IconWarning } from '@colox/icons';
import type { MessageTone } from './types';

/**
 * The tone → icon map shared by the consumer faces (toast and notify
 * both tint the semantic icon with the palette tone color). The icon
 * glyph itself is monochrome; the color comes from the CSS via the
 * `--colox-color-text-*` tokens on `colox-message--{tone}`.
 */
export const TONE_ICONS: Record<MessageTone, typeof IconInfo> = {
  info: IconInfo,
  success: IconSuccess,
  warning: IconWarning,
  error: IconError,
};
