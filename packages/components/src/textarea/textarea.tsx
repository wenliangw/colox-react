import { forwardRef, useImperativeHandle, useRef } from 'react';
import clsx from 'clsx';
import type { TextareaProps, TextareaRef } from './types';
import { useTextareaAutosize } from './hooks/use-textarea-autosize';
import { useTextareaClear } from './hooks/use-textarea-clear';
import { useTextareaCount } from './hooks/use-textarea-count';
import { useTextareaResize } from './hooks/use-textarea-resize';
import { formatTextareaCount } from './utils/format-textarea-count';
import { resolveTextareaAutosize } from './utils/resolve-textarea-autosize';
import { resolveTextareaSlots } from './utils/resolve-textarea-slots';
import { TextareaClearButton } from './controls/clear-button';
import { TextareaResizeHandle } from './controls/resize-handle';
import { textareaVariants } from './variants';

import './styles/index.scss';

/**
 * Multi-line text input wrapped in a shell, same contract as Input: the
 * shell carries the visual contract (border, focus ring, size, disabled/
 * invalid state), the inner control stays a bare native textarea — the
 * ref and all native textarea attributes/events land there.
 *
 * The height is content-driven by default: `rows` stays the minimum
 * baseline and the box grows with every line (`autoSize`, no scrollbar
 * while typing — `maxRows` caps it and scrolls inside with a styled
 * scrollbar; `autoSize={false}` returns the fixed-rows world). A footer
 * bar inside the shell hosts the chrome in the flow — the leading pill
 * capsule packs the character count and the `清除` text clear
 * control, the trailing end holds the drag handle — so nothing floats
 * over the text. The width stays container-driven and native resize
 * stays off.
 */
export const Textarea = forwardRef<TextareaRef, TextareaProps>((props, ref) => {
  const {
    size,
    invalid = false,
    clearable = false,
    showCount = false,
    autoSize,
    maxLength,
    value,
    defaultValue,
    className,
    style,
    disabled,
    readOnly,
    onChange,
    ...rest
  } = props;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

  const autosize = resolveTextareaAutosize({ autoSize });
  const { adjust } = useTextareaAutosize({ textareaRef, config: autosize, value });
  const count = useTextareaCount({
    textareaRef,
    value,
    controlled: value !== undefined,
    active: showCount,
  });
  const { handleClear } = useTextareaClear({
    textareaRef,
    onChange,
    onCleared: () => {
      adjust();
      count.refresh();
    },
  });
  const resize = useTextareaResize({ textareaRef, enabled: autosize.resizable });
  const slots = resolveTextareaSlots({ clearable, disabled, readOnly });

  const hasFooter = showCount || slots.showClear || autosize.resizable;

  return (
    <div
      className={clsx(
        textareaVariants({ size }),
        { 'colox-textarea--invalid': invalid, 'colox-textarea--disabled': disabled },
        className,
      )}
      style={style}
    >
      <textarea
        ref={textareaRef}
        className="colox-textarea-control"
        aria-invalid={invalid || undefined}
        value={value}
        defaultValue={defaultValue}
        onChange={(event) => onChange?.({ event, value: event.target.value })}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        {...rest}
      />
      {hasFooter && (
        <div className="colox-textarea__footer">
          {(showCount || slots.showClear) && (
            <div className="colox-textarea__pill">
              {showCount && (
                <span className="colox-textarea__count">
                  {formatTextareaCount(count.length, maxLength)}
                </span>
              )}
              {showCount && slots.showClear && (
                <span className="colox-textarea__separator" aria-hidden="true" />
              )}
              {slots.showClear && <TextareaClearButton onClear={handleClear} />}
            </div>
          )}
          <span className="colox-textarea__spacer" />
          {autosize.resizable && (
            <TextareaResizeHandle
              disabled={disabled}
              onPointerDown={resize.onPointerDown}
              onKeyDown={resize.onKeyDown}
            />
          )}
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
