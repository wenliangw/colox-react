import type { CSSProperties, ReactNode } from 'react';
import clsx from 'clsx';
import type { MessageEntry } from './types';
import type { MessageStore } from './store';

/**
 * The shared message item shell: the presence/aria/hover wrapper every
 * consumer face's item visual lives inside. It owns what is common to
 * all messages — the role announcement, the exiting flag (drives the
 * CSS out-animation), the hover pause/resume of the countdown — while
 * the visual (the face's card) is injected as children.
 *
 * The enter animation plays on mount (CSS); the exit animation plays
 * while `--exiting` is set (the store keeps the entry mounted through
 * the exit window before removing it).
 */
export interface MessageItemShellProps {
  entry: MessageEntry;
  store: MessageStore;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function MessageItemShell({
  entry,
  store,
  className,
  style,
  children,
}: MessageItemShellProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        'colox-message',
        `colox-message--${entry.type}`,
        entry.status === 'exiting' && 'colox-message--exiting',
        className,
      )}
      style={style}
      onMouseEnter={() => store.pause(entry.id)}
      onMouseLeave={() => store.resume(entry.id)}
    >
      {children}
    </div>
  );
}
