import { IconGrip } from '@colox/icons';
import { IconButton } from '../../icon-button';
import type { TextareaResizeHandleProps } from '../types';

/**
 * The footer drag handle rides the shared IconButton base (reset, hit
 * shape, focus ring, disabled semantics); this file keeps only the
 * textarea-specific surface: the `ns-resize` slot class, the native
 * corner-hatch grip glyph and the resize behavior wiring (see
 * `useTextareaResize`). `mousedown` is prevented so sizing never steals
 * focus from the textarea — keyboard focus (Tab) is the handle's
 * accessibility path, ArrowUp/ArrowDown step one row.
 */
export const TextareaResizeHandle = ({
  disabled,
  onPointerDown,
  onKeyDown,
}: TextareaResizeHandleProps) => (
  <IconButton
    size="4"
    variant="muted"
    className="colox-textarea__resize"
    aria-label="Resize textarea"
    disabled={disabled}
    onMouseDown={(event) => event.preventDefault()}
    onPointerDown={onPointerDown}
    onKeyDown={onKeyDown}
  >
    <IconGrip />
  </IconButton>
);

TextareaResizeHandle.displayName = 'TextareaResizeHandle';
