import type { KeyboardEventHandler, PointerEventHandler } from 'react';

export interface TextareaClearButtonProps {
  onClear: () => void;
}

export interface TextareaResizeHandleProps {
  disabled?: boolean;
  onPointerDown: PointerEventHandler<HTMLButtonElement>;
  onKeyDown: KeyboardEventHandler<HTMLButtonElement>;
}
