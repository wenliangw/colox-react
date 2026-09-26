import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { MouseEvent } from 'react';
import clsx from 'clsx';
import { IconClock } from '@colox/icons';
import { InputControl } from '@colox/cdk/input-control';
import { useCompactContext } from '../compact/compact-context';
import { Popup, useDismissible } from '@colox/cdk/floating';
import { TimePickerClearButton } from './controls/clear-button';
import { TimePickerPanel } from './controls/panel';
import { useTimePicker } from './hooks/use-time-picker';
import { TIME_DEFAULT_FORMAT } from './constants/time';
import type { TimePickerProps, TimePickerRef } from './types';
import { timePickerPaletteStyles } from './variants/palette';
import { timePickerVariants } from './variants';

import './styles/index.scss';

/**
 * Single-line time editor: a bare text input in the Input family
 * shell plus a self-drawn three-column panel — free wheel scroll,
 * click to pick, the confirm button commits (`{ event, value }`
 * payloads; `clearable` follows the Select interaction).
 */
const TimePickerRoot = forwardRef<TimePickerRef, TimePickerProps>((props, ref) => {
  const {
    size,
    invalid = false,
    palette,
    value,
    defaultValue,
    min,
    max,
    valueFormat: rawValueFormat,
    confirmText = '确定',
    clearable = false,
    open,
    defaultOpen,
    disabled,
    readOnly,
    className,
    style,
    onChange,
    onOpenChange,
    onBlur,
    onKeyDown,
    ...rest
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const valueFormat = rawValueFormat ?? TIME_DEFAULT_FORMAT;

  const editor = useTimePicker({
    inputRef,
    panelRef,
    value,
    defaultValue,
    min,
    max,
    valueFormat,
    open,
    defaultOpen,
    onChange,
    onOpenChange,
    onBlur,
    onKeyDown,
  });

  useDismissible({
    open: editor.open && !disabled && !readOnly,
    triggerRef: shellRef,
    panelRef,
    onDismiss: editor.closePanel,
  });

  const openable = !disabled && !readOnly;
  const compact = useCompactContext();
  const paletteClass = timePickerPaletteStyles[palette ?? compact?.palette ?? 'primary'];
  const showClear = openable && clearable && editor.current !== null;

  // Shell clicks open the panel — except clicks on built-in buttons
  // (the ✕ clear control keeps its own program; the Select shell
  // guards the same way).
  const handleShellClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof Element) || target.closest('button') !== null) {
      return;
    }
    if (openable && !editor.open) {
      editor.openPanel();
    }
  };

  const handleShellMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (!openable) {
      return;
    }
    const target = event.target;
    if (!(target instanceof Element) || target.closest('button, input') !== null) {
      return;
    }
    // The shell itself cannot take focus: an unprevented mousedown would
    // blur the active element and paint an empty focus window before the
    // click opens the panel — inside a Compact the unit ring would
    // flicker off. Keep the focus parked for the click.
    event.preventDefault();
  };

  return (
    <div
      ref={shellRef}
      className={clsx(
        timePickerVariants({ size: size ?? compact?.size, palette: palette ?? compact?.palette }),
        {
          'colox-time-picker--invalid': invalid,
          'colox-time-picker--disabled': disabled,
          'colox-time-picker--clearable': showClear,
          'colox-time-picker--open': editor.open,
        },
        className,
      )}
      style={style}
      onClick={handleShellClick}
      onMouseDown={handleShellMouseDown}
    >
      <InputControl
        ref={inputRef}
        className={clsx('colox-time-picker__control', {
          'colox-time-picker__control--pending': editor.preview,
        })}
        type="text"
        role="combobox"
        aria-expanded={editor.open}
        aria-haspopup="dialog"
        aria-invalid={invalid || undefined}
        placeholder={valueFormat}
        value={editor.display}
        onChange={editor.handleChange}
        onBlur={editor.handleBlur}
        onKeyDown={editor.handleKeyDown}
        disabled={disabled}
        readOnly={readOnly}
        {...rest}
      />
      <span className="colox-time-picker__trailing">
        <IconClock className="colox-time-picker__icon" />
        {showClear && <TimePickerClearButton onClear={editor.handleClear} />}
      </span>
      <Popup
        ref={panelRef}
        referenceRef={shellRef}
        open={editor.open}
        gap={4}
        matchWidth={false}
        className={clsx('colox-time-picker__popup', paletteClass)}
        onClick={(event) => event.stopPropagation()}
      >
        <TimePickerPanel
          hourValue={editor.hourValue}
          minuteValue={editor.minuteValue}
          secondValue={editor.secondValue}
          hourSelected={editor.hourSelected}
          minuteSelected={editor.minuteSelected}
          secondSelected={editor.secondSelected}
          confirmText={confirmText}
          confirmBlocked={editor.confirmBlocked}
          isDisabledOption={editor.isDisabledOption}
          onSelectOption={editor.handleSelectOption}
          onScrollColumn={editor.moveColumn}
          onColumnKeyDown={editor.handleColumnKeyDown}
          onConfirm={editor.handleConfirm}
        />
      </Popup>
    </div>
  );
});

TimePickerRoot.displayName = 'TimePicker';

export const TimePicker = TimePickerRoot;
