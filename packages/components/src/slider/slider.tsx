import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import type { CSSProperties, ChangeEvent } from 'react';
import clsx from 'clsx';
import type { SliderProps, SliderRef } from './types';
import { resolveSliderMarks } from './utils/resolve-slider-marks';
import { sliderVariants } from './variants';

import './styles/index.scss';

/**
 * Single-thumb slider on a native `<input type="range">`: the control
 * IS the native input (the ref, keyboard, focus and form value all
 * land there); the traveled stripe and the thumb are drawn on top of
 * it via the engine pseudo-elements, and a marks row renders ticks
 * with labels below the strip. The onChange payload is the slider's
 * own event face — `{ event, value }` with the committed number
 * already parsed. Palette colors the traveled stripe (Button
 * families, brand by default); size tiers share the family row
 * heights (xs/sm/md/lg). Marks are a display layer: step stays
 * native.
 */
const SliderRoot = forwardRef<SliderRef, SliderProps>((props, ref) => {
  const {
    size,
    palette,
    invalid = false,
    value,
    defaultValue,
    min = 0,
    max = 100,
    step = 1,
    marks,
    disabled,
    className,
    style,
    onChange,
    ...rest
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const [innerValue, setInnerValue] = useState<number>(defaultValue ?? min);
  const current = value ?? innerValue;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.currentTarget.value);
    if (value === undefined) {
      setInnerValue(nextValue);
    }
    onChange?.({ event, value: nextValue });
  };

  const markItems = marks === undefined ? null : resolveSliderMarks({ marks, min, max });
  const span = max - min;
  const progress = span <= 0 ? 0 : ((current - min) / span) * 100;

  return (
    <div
      className={clsx(
        sliderVariants({ size, palette }),
        { 'colox-slider--invalid': invalid, 'colox-slider--disabled': disabled },
        className,
      )}
      style={style}
    >
      <input
        ref={inputRef}
        className="colox-slider__control"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onChange={handleChange}
        style={{ '--colox-slider-progress': `${progress}%` } as CSSProperties}
        {...rest}
      />
      {markItems !== null && markItems.length > 0 && (
        <div className="colox-slider__marks" aria-hidden="true">
          {markItems.map((item) => (
            <span
              key={item.value}
              className={clsx('colox-slider__mark', {
                'colox-slider__mark--first': item.edge === 'first',
                'colox-slider__mark--last': item.edge === 'last',
              })}
              style={{ left: item.position }}
            >
              <span className="colox-slider__mark-dot" />
              {item.label !== null && item.label !== false && item.label !== undefined && (
                <span className="colox-slider__mark-label">{item.label}</span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
});

SliderRoot.displayName = 'Slider';

export const Slider = SliderRoot;
