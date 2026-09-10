import { useCallback, useState } from 'react';
import type { InputHTMLAttributes } from 'react';

interface UsePasswordVisibilityArgs {
  /** The input's declared type; the toggle only acts on `password`. */
  type: InputHTMLAttributes<HTMLInputElement>['type'];
  /** The opt-in switch: the whole capability is off while false. */
  allowTogglePassword: boolean;
}

export interface PasswordVisibilityState {
  /** Whether the visibility toggle is active (opt-in met and type matches). */
  active: boolean;
  /** The type the inner control actually renders. */
  resolvedType: InputHTMLAttributes<HTMLInputElement>['type'];
  /** Whether the password is currently revealed as plain text. Pure visual
   *  state — the value itself never changes. */
  revealed: boolean;
  toggle: () => void;
}

/**
 * Owns the password visibility concern: activation (opt-in + password
 * type), the visual `revealed` state and the resolved control type. The
 * revealed flag mirrors "what the user can currently see", which is also
 * the state-indicating icon contract of `VisibilityToggle`.
 */
export const usePasswordVisibility = ({
  type,
  allowTogglePassword,
}: UsePasswordVisibilityArgs): PasswordVisibilityState => {
  const [revealed, setRevealed] = useState(false);
  const active = allowTogglePassword && type === 'password';

  return {
    active,
    resolvedType: active && revealed ? 'text' : type,
    revealed,
    toggle: useCallback(() => setRevealed((current) => !current), []),
  };
};
