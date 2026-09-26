import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { IconChevronDown, IconChevronUp } from '@colox/icons';
import { throttle } from '@colox/cdk/utils/throttle';
import type { TimePickerColumnProps } from '../types';
import {
  COLUMN_FOCUS_SLOT,
  COLUMN_OPTION_STRIDE,
  COLUMN_STEP,
  COLUMN_VISIBLE,
  mod,
} from '../utils/format';

/**
 * Rendered window: a flight margin around the focus slot's 3-up/4-down
 * window (10 lead + 12 trail = 22 options), positioned inside a
 * three-lap track by two spacer elements.
 */
const RANGE_LEAD = COLUMN_STEP + COLUMN_FOCUS_SLOT;
const RANGE_TRAIL = 1 + (COLUMN_VISIBLE - 1 - COLUMN_FOCUS_SLOT) + COLUMN_STEP;

/** The track repeats the option cycle on three laps so the wheel can roll through 23 → 00 seamlessly. */
const LAP_COUNT = 3;

/** The focus slot's top offset inside the viewport (the re-align target). */
const SLOT_OFFSET_PX = COLUMN_FOCUS_SLOT * COLUMN_OPTION_STRIDE;

/** The wheel maps one option per 50 px (a ~100 px notch = two options). */
const WHEEL_ITEM_PX = 50;
/** A line-mode delta unit equals three options (browser scroll lines). */
const WHEEL_LINE_ITEMS = 3;

/**
 * A scroll counts as running until it quiets for this long; the
 * listbox wears `--scrolling` and the cells' pointer events stay off,
 * so cells streaming under the cursor cannot flash their hover wash
 * mid-roll — the wash may only appear once the wheel really rests.
 */
const SCROLLING_QUIET_MS = 100;

/** The re-align glide's duration — also the chevron step's throttle window. */
const GLIDE_MS = 240;

/** Ease-out cubic: the glide's tempo (a snappier ride than the UA's slow easing). */
const EASE_OUT_CUBIC = (progress: number): number => 1 - Math.pow(1 - progress, 3);

/** The scrollTop where `value` sits on the focus slot, in the middle lap. */
const canonicalScrollTop = (count: number, value: number): number =>
  (count + value) * COLUMN_OPTION_STRIDE - SLOT_OFFSET_PX;

/**
 * Whether the motion gate is on: the theme zeroes the motion tokens
 * under `data-colox-motion="off"` / prefers-reduced-motion, and the
 * re-align glides degrade to instant jumps instead of keeping smooth
 * animations no one asked for.
 */
const motionGated = (): boolean =>
  document.documentElement.getAttribute('data-colox-motion') === 'off' ||
  (typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

export const TimePickerColumn = ({
  unit,
  label,
  count,
  value,
  selected,
  isDisabled,
  onSelect,
  onScroll,
  onKeyDown,
}: TimePickerColumnProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);

  const lapPx = count * COLUMN_OPTION_STRIDE;
  // The middle-lap band the scroll handler keeps the free wheel
  // inside. The rAF glide rides the SAME path — its per-frame writes
  // come pre-wrapped into the band, so this handler's re-anchor only
  // ever fires for the wheel.
  const low = canonicalScrollTop(count, 0);
  const high = low + lapPx;
  // The active re-align glide's frame id — a wheel cancels it (the
  // user's direct input wins over a programmatic ride).
  const animationRef = useRef<number | null>(null);

  // The virtual index currently under the focus slot; the rendered
  // window trails it by RANGE_LEAD/RANGE_TRAIL.
  const [slotIndex, setSlotIndex] = useState(count + value);
  // True while the wheel rolls: the listbox wears `--scrolling` and
  // pointer events stay off (no hover flash from cells racing under
  // the cursor, no stray clicks inside the momentum window).
  const [scrolling, setScrolling] = useState(false);
  const scrollingTimerRef = useRef<number | null>(null);
  // The last scrollTop the handler saw — the mount seat's own scroll
  // event (if a browser fires one) must not chase the window.
  const lastTopRef = useRef<number | null>(null);

  // Follow the pending value: an external move (click, chevron,
  // keyboard, typed re-seat, controlled value) glides the track until
  // the value rests on the focus slot — the auto re-align. The target
  // is the NEAREST seat of the value across the three laps (an arrow
  // step across the cycle seam keeps its direction: the down arrow
  // scrolls DOWN through 23 → 00). The glide writes scrollTop
  // DIRECTLY, one frame at a time, exactly like the wheel: every
  // write is pre-wrapped into the middle-lap band, and the scroll
  // handler chases the window per event — the offset and the window
  // can never disagree for a painted frame. No UA smooth animation
  // (any write would cancel it), no pre/post-shift wraps, no
  // mid-glide handler exemptions: the wheel's own motion path.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport === null) {
      return;
    }
    const top = viewport.scrollTop;
    const canonical = canonicalScrollTop(count, value);
    const candidates = [canonical - lapPx, canonical, canonical + lapPx];
    let target = candidates[0];
    for (const candidate of candidates) {
      if (Math.abs(candidate - top) < Math.abs(target - top)) {
        target = candidate;
      }
    }
    if (Math.abs(top - target) < 1) {
      return;
    }
    // The wrap applied to the VALUE itself — a seat one lap off the
    // band targets its in-band scene; the per-frame writes re-wrap on
    // the fly when the ride crosses the seam.
    const wrap = (position: number) =>
      position < low ? position + lapPx : position >= high ? position - lapPx : position;
    if (motionGated()) {
      viewport.scrollTop = wrap(target);
      return;
    }
    const travel = target - top;
    const start = performance.now();
    const frame = (now: number) => {
      const progress = Math.min(1, (now - start) / GLIDE_MS);
      viewport.scrollTop = wrap(top + travel * EASE_OUT_CUBIC(progress));
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(frame);
      } else {
        animationRef.current = null;
      }
    };
    animationRef.current = requestAnimationFrame(frame);
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [value, count, lapPx, low, high]);

  // Seat the track on the initial value before the first paint: the
  // re-align glide must never run at mount.
  const initialSeatRef = useRef(canonicalScrollTop(count, value));
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (viewport !== null) {
      viewport.scrollTop = initialSeatRef.current;
      lastTopRef.current = viewport.scrollTop;
    }
  }, []);

  // Arms (and re-arms) the quiet window: while scroll events keep
  // coming the column counts as scrolling.
  const markScrolling = () => {
    setScrolling(true);
    if (scrollingTimerRef.current !== null) {
      window.clearTimeout(scrollingTimerRef.current);
    }
    scrollingTimerRef.current = window.setTimeout(() => {
      setScrolling(false);
    }, SCROLLING_QUIET_MS);
  };

  // The natively-scrolling viewport: re-anchor the lap and chase the
  // rendered window — the wheel never selects, so there is nothing to
  // read or report here. The lap re-anchor also resyncs the window in
  // the same handler: a stale frame at the seam would flash blank
  // content while fast-scrolling across the cycle boundary. The rAF
  // glide rides the same path — its writes arrive pre-wrapped, so the
  // re-anchor below only ever fires for the wheel.
  const handleScroll = () => {
    const viewport = viewportRef.current;
    if (viewport === null) {
      return;
    }
    const top = viewport.scrollTop;
    const moved = top !== lastTopRef.current;
    lastTopRef.current = top;
    if (top < low) {
      const next = top + lapPx;
      viewport.scrollTop = next;
      setSlotIndex(Math.floor((next + SLOT_OFFSET_PX) / COLUMN_OPTION_STRIDE));
      return;
    }
    if (top >= high) {
      const next = top - lapPx;
      viewport.scrollTop = next;
      setSlotIndex(Math.floor((next + SLOT_OFFSET_PX) / COLUMN_OPTION_STRIDE));
      return;
    }
    if (!moved) {
      return;
    }
    setSlotIndex(Math.floor((top + SLOT_OFFSET_PX) / COLUMN_OPTION_STRIDE));
    markScrolling();
  };

  // The wheel listener is native and non-passive: the viewport
  // scrolls and the raw delta is rescaled to the spec's 50 px per
  // option (a line = three options) — free scrolling, nothing more.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport === null) {
      return;
    }
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      // A wheel while a glide runs: the user's direct input wins —
      // the ride stops and the free scroll takes over.
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      const px =
        event.deltaMode === 0
          ? (event.deltaY / WHEEL_ITEM_PX) * COLUMN_OPTION_STRIDE
          : event.deltaY * WHEEL_LINE_ITEMS * COLUMN_OPTION_STRIDE;
      viewport.scrollTop += px;
    };
    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener('wheel', handleWheel);
      if (scrollingTimerRef.current !== null) {
        window.clearTimeout(scrollingTimerRef.current);
        scrollingTimerRef.current = null;
      }
    };
  }, []);

  const unitLabel = `${unit}s`;
  const first = slotIndex - RANGE_LEAD;
  const last = first + RANGE_LEAD + RANGE_TRAIL - 1;
  const total = LAP_COUNT * count;
  const options = Array.from({ length: RANGE_LEAD + RANGE_TRAIL }, (_, index) => first + index);

  // The latest onScroll callback (the hook recreates it per render);
  // the throttled wrapper below is stable so its window survives
  // re-renders.
  const onScrollRef = useRef(onScroll);
  useEffect(() => {
    onScrollRef.current = onScroll;
  });
  // The chevron step is throttled by the glide's own duration: the
  // first click steps at once, every click inside the window is
  // dropped — a re-click only lands after the ride ends ("scroll
  // ends, then click again"). The same window drives the LOCKED look:
  // the steppers gray (the family's disabled-text idiom) exactly
  // while the gate stands, so an absorbed click looks like one. Under
  // the motion gate there is no ride to wait for — the step fires
  // straight through, no window, no gray.
  const stepByRef = useRef<null | ReturnType<typeof throttle<[number]>>>(null);
  const [locked, setLocked] = useState(false);
  const lockTimerRef = useRef<number | null>(null);
  if (stepByRef.current === null) {
    stepByRef.current = throttle((delta: number) => {
      onScrollRef.current(delta);
      setLocked(true);
      if (lockTimerRef.current !== null) {
        window.clearTimeout(lockTimerRef.current);
      }
      lockTimerRef.current = window.setTimeout(() => {
        lockTimerRef.current = null;
        setLocked(false);
      }, GLIDE_MS);
    }, GLIDE_MS);
  }
  const stepBy = stepByRef.current;
  useEffect(
    () => () => {
      stepBy.cancel();
      if (lockTimerRef.current !== null) {
        window.clearTimeout(lockTimerRef.current);
        lockTimerRef.current = null;
      }
    },
    [stepBy],
  );
  const issueStep = (delta: number) => {
    if (motionGated()) {
      onScrollRef.current(delta);
      return;
    }
    stepBy(delta);
  };

  return (
    <div className="colox-time-picker__column">
      <button
        type="button"
        tabIndex={-1}
        className={clsx('colox-time-picker__step', {
          'colox-time-picker__step--locked': locked,
        })}
        aria-label={`Previous ${unitLabel}`}
        aria-disabled={locked || undefined}
        onClick={() => issueStep(-COLUMN_STEP)}
      >
        <IconChevronUp />
      </button>
      <div
        ref={viewportRef}
        className={clsx('colox-time-picker__listbox', {
          'colox-time-picker__listbox--scrolling': scrolling,
        })}
        role="listbox"
        aria-label={label}
        data-unit={unit}
        onScroll={handleScroll}
      >
        <div className="colox-time-picker__track">
          {first > 0 && <div aria-hidden style={{ height: first * COLUMN_OPTION_STRIDE }} />}
          {options.map((item) => {
            const itemValue = mod(item, count);
            const disabled = isDisabled(itemValue);
            const isSelected = selected !== null && itemValue === selected && !disabled;
            // The keyboard focus rides the pending option; while the
            // panel is untouched (no selection yet) it rides the slot.
            const focused = selected !== null ? itemValue === selected : item === slotIndex;
            return (
              <button
                key={item}
                type="button"
                role="option"
                data-time={itemValue}
                tabIndex={focused ? 0 : -1}
                className={clsx('colox-time-picker__option', {
                  'colox-time-picker__option--selected': isSelected,
                  'colox-time-picker__option--disabled': disabled,
                })}
                aria-selected={isSelected}
                aria-disabled={disabled || undefined}
                disabled={disabled}
                onClick={() => onSelect(itemValue)}
                onKeyDown={onKeyDown}
              >
                {String(itemValue).padStart(2, '0')}
              </button>
            );
          })}
          {last < total - 1 && (
            <div aria-hidden style={{ height: (total - 1 - last) * COLUMN_OPTION_STRIDE }} />
          )}
        </div>
      </div>
      <button
        type="button"
        tabIndex={-1}
        className={clsx('colox-time-picker__step', {
          'colox-time-picker__step--locked': locked,
        })}
        aria-label={`Next ${unitLabel}`}
        aria-disabled={locked || undefined}
        onClick={() => issueStep(COLUMN_STEP)}
      >
        <IconChevronDown />
      </button>
    </div>
  );
};
