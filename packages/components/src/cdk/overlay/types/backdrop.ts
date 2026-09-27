import type { HTMLAttributes } from 'react';

/**
 * The Backdrop mask: a full-surface dim layer behind the panel. The
 * consumer wires the click (the mask close) — the mask never speaks
 * for the dialog.
 */
export type BackdropProps = HTMLAttributes<HTMLDivElement>;
