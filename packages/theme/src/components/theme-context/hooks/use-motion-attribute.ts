import { useInsertionEffect } from 'react';
import { MOTION_ATTRIBUTE, MOTION_OFF_VALUE, MOTION_ON_VALUE } from '../constants/theme';
import type { MotionPreference } from '../types';

/**
 * Writes the motion axis onto <html>. Unlike theme/palette, motion has a
 * CSS-native "system" mode: when the preference is 'system' (or absent)
 * the attribute is removed and the prefers-reduced-motion media query in
 * the motion.css gate follows the OS live — no JS sensor needed.
 */
export function useMotionAttribute(motion: MotionPreference | undefined) {
  useInsertionEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const root = document.documentElement;
    root.removeAttribute(MOTION_ATTRIBUTE);
    if (motion === true) {
      root.setAttribute(MOTION_ATTRIBUTE, MOTION_ON_VALUE);
    } else if (motion === false) {
      root.setAttribute(MOTION_ATTRIBUTE, MOTION_OFF_VALUE);
    }
  }, [motion]);
}
