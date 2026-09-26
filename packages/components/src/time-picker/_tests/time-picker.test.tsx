import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TimePicker } from '..';

const openPanel = () => {
  fireEvent.click(screen.getByRole('combobox'));
};

/**
 * Fakes the timers the glide and debounce need: the rAF frame clock
 * (16ms ticks under advanceTimersByTime) plus performance.now, which
 * the glide's easing reads. Date stays real — the clock tests below
 * use vi.setSystemTime.
 */
const useGlideTimers = () =>
  vi.useFakeTimers({
    toFake: [
      'setTimeout',
      'clearTimeout',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'performance',
    ],
  });

const COLUMN_NAMES = { hour: 'Hours', minute: 'Minutes', second: 'Seconds' } as const;
type Unit = keyof typeof COLUMN_NAMES;

const COUNTS = { hour: 24, minute: 60, second: 60 } as const;
/** The column stride: 28px option + 2px gap. */
const STRIDE = 30;
/** The focus slot's top offset inside the viewport (slot 3). */
const SLOT_PX = 90;

/** The scrollTop where `value` sits on the focus slot, in the middle lap. */
const canonicalTop = (unit: Unit, value: number) => (COUNTS[unit] + value) * STRIDE - SLOT_PX;

/**
 * The 8 visible option labels of a column. The track renders 22
 * options (10 lead + focus slot + 11 trail); the viewport shows the
 * middle 8 — window offsets [slot-3, slot+4].
 */
const columnLabels = (unit: Unit) => {
  const options = within(screen.getByRole('listbox', { name: COLUMN_NAMES[unit] }))
    .getAllByRole('option')
    .map((option) => option.textContent);
  return options.slice(7, 15);
};

/** The rendered listbox (the natively-scrolling viewport) of a column. */
const columnBox = (unit: Unit) => screen.getByRole('listbox', { name: COLUMN_NAMES[unit] });

/** Drives the viewport's scrollTop and fires the scroll event (jsdom does not scroll natively). */
const driveScroll = (unit: Unit, top: number) => {
  const box = columnBox(unit);
  box.scrollTop = top;
  fireEvent.scroll(box);
};

/** The option at a column's keyboard cursor (the tabIndex-0 node). */
const focusOption = (unit: Unit) =>
  within(columnBox(unit))
    .getAllByRole('option')
    .find((option) => option.getAttribute('tabindex') === '0')!;

/** The option wearing the selected (pending) wash of a column — the wash rides the VALUE. */
const selectedOption = (unit: Unit) =>
  within(columnBox(unit))
    .getAllByRole('option')
    .find((option) => option.className.includes('--selected'))!;

const confirmButton = () => screen.getByRole('button', { name: '确定' });

describe('TimePicker', () => {
  it('renders the Input family shell with the HH:mm:ss placeholder', () => {
    render(<TimePicker aria-label="time" />);
    const input = screen.getByLabelText('time');
    expect(input).toBeInstanceOf(HTMLInputElement);
    expect(input.getAttribute('placeholder')).toBe('HH:mm:ss');
    expect(input.getAttribute('role')).toBe('combobox');
  });

  it('commits a complete typed word through the change payload', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="time" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('time'), { target: { value: '08:30:05' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].value).toBe('08:30:05');
  });

  it('takes the lenient grammar (8:30, 8:3) into the canonical word', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="time" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('time'), { target: { value: '8:30' } });
    expect(onChange.mock.calls[0][0].value).toBe('08:30:00');
    fireEvent.change(screen.getByLabelText('time'), { target: { value: '8:3' } });
    expect(onChange.mock.calls[1][0].value).toBe('08:03:00');
  });

  it('renders typed commits through the valueFormat (display only, payload canonical)', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="time" valueFormat="H.mm" onChange={onChange} />);
    const input = screen.getByLabelText('time');
    fireEvent.change(input, { target: { value: '8.30' } });
    expect(onChange.mock.calls[0][0].value).toBe('08:30:00');
    expect(input).toHaveValue('8.30');
    fireEvent.blur(input);
    expect(input).toHaveValue('8.30');
  });

  it('keeps partial drafts silent and rolls them back on blur', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="time" onChange={onChange} />);
    const input = screen.getByLabelText('time');
    fireEvent.change(input, { target: { value: '8' } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('');
  });

  it('rolls an out-of-range typed word back on blur without committing', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="time" defaultValue="08:30:05" onChange={onChange} />);
    const input = screen.getByLabelText('time');
    fireEvent.change(input, { target: { value: '25:00:00' } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('08:30:05');
  });

  it('opens the panel on shell click and dismisses on outside pointerdown', async () => {
    render(<TimePicker aria-label="time" />);
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByLabelText('time'));
    expect(screen.getByRole('dialog', { name: 'Choose time' })).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('holds three natively-scrolling columns seated on the committed components', () => {
    render(<TimePicker aria-label="time" defaultValue="08:30:45" />);
    openPanel();
    // The viewport seats instantly at the canonical scrollTop: the
    // committed components sit on the focus slot, 3 above and 4 below.
    expect(columnBox('hour').scrollTop).toBe(canonicalTop('hour', 8));
    expect(columnBox('minute').scrollTop).toBe(canonicalTop('minute', 30));
    expect(columnBox('second').scrollTop).toBe(canonicalTop('second', 45));
    expect(columnLabels('hour')).toEqual(['05', '06', '07', '08', '09', '10', '11', '12']);
    expect(columnLabels('minute')).toEqual(['27', '28', '29', '30', '31', '32', '33', '34']);
    expect(columnLabels('second')).toEqual(['42', '43', '44', '45', '46', '47', '48', '49']);
    // The committed options wear the selection and the keyboard cursor.
    const hourBox = columnBox('hour');
    expect(within(hourBox).getByRole('option', { name: '08' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(within(hourBox).getByRole('option', { name: '08' })).toHaveAttribute('tabindex', '0');
    const secondBox = columnBox('second');
    expect(within(secondBox).getByRole('option', { name: '45' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('anchors the empty value at the system clock', () => {
    render(<TimePicker aria-label="time" />);
    openPanel();
    const nowHour = String(new Date().getHours()).padStart(2, '0');
    expect(columnBox('hour').scrollTop).toBe(canonicalTop('hour', new Date().getHours()));
    expect(columnLabels('hour')).toEqual(
      Array.from({ length: 8 }, (_, index) => {
        const value = new Date().getHours() - 3 + index;
        return String(((value % 24) + 24) % 24).padStart(2, '0');
      }),
    );
    // The empty open pre-selects the system clock — the wash rides it.
    expect(within(columnBox('hour')).getByRole('option', { selected: true })).toHaveTextContent(
      nowHour,
    );
  });

  it('pre-selects the system clock on the empty open and commits it on Confirm', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 4, 15, 14, 30, 45));
    try {
      const onChange = vi.fn();
      render(<TimePicker aria-label="time" onChange={onChange} />);
      openPanel();
      // The three columns wear the subtle preselection on the clock.
      expect(selectedOption('hour')).toHaveTextContent('14');
      expect(selectedOption('minute')).toHaveTextContent('30');
      expect(selectedOption('second')).toHaveTextContent('45');
      // Confirm commits the pre-selected clock straight away.
      fireEvent.click(confirmButton());
      expect(onChange.mock.calls[0][0].value).toBe('14:30:45');
      expect(screen.getByLabelText('time')).toHaveValue('14:30:45');
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps the confirm disabled when the pre-selected system clock is out of bounds', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 4, 15, 14, 30, 45));
    try {
      render(<TimePicker aria-label="time" min="15:00:00" max="21:00:00" />);
      openPanel();
      // 14:30:45 < min — the honest gate blocks the commit path.
      expect(confirmButton()).toBeDisabled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('skips the glide, the gate and the gray under the motion gate — steps land instantly', () => {
    render(<TimePicker aria-label="time" defaultValue="08:30:45" />);
    openPanel();
    document.documentElement.setAttribute('data-colox-motion', 'off');
    try {
      const nextHours = screen.getByRole('button', { name: 'Next hours' });
      fireEvent.click(nextHours);
      expect(screen.getByLabelText('time')).toHaveValue('15:30:45');
      // Instant jump, no ride: the track lands in-band at once…
      expect(columnBox('hour').scrollTop).toBe(canonicalTop('hour', 15));
      // …and no window ever engaged — no gray, and a second click
      // lands immediately.
      expect(nextHours).not.toHaveAttribute('aria-disabled');
      fireEvent.click(nextHours);
      expect(screen.getByLabelText('time')).toHaveValue('22:30:45');
      expect(columnBox('hour').scrollTop).toBe(canonicalTop('hour', 22));
    } finally {
      document.documentElement.removeAttribute('data-colox-motion');
    }
  });

  it('rides a chevron click as a direct-write glide toward the pending value', () => {
    useGlideTimers();
    try {
      render(<TimePicker aria-label="time" defaultValue="08:30:45" />);
      openPanel();
      fireEvent.click(screen.getByRole('button', { name: 'Next hours' }));
      // The pending word lands immediately; the track rides to it over
      // the wheel's own motion path (no UA smooth animation).
      expect(screen.getByLabelText('time')).toHaveValue('15:30:45');
      expect(columnBox('hour').scrollTop).toBe(canonicalTop('hour', 8));
      act(() => {
        vi.advanceTimersByTime(240);
      });
      expect(columnBox('hour').scrollTop).toBe(canonicalTop('hour', 15));
      expect(within(columnBox('hour')).getByRole('option', { name: '15' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('throttles chained chevron clicks — the steppers gray while the glide runs, a re-click only lands after it ends', () => {
    useGlideTimers();
    try {
      render(<TimePicker aria-label="time" defaultValue="08:30:45" />);
      openPanel();
      const nextHours = screen.getByRole('button', { name: 'Next hours' });
      const previousHours = screen.getByRole('button', { name: 'Previous hours' });
      fireEvent.click(nextHours);
      expect(screen.getByLabelText('time')).toHaveValue('15:30:45');
      // The throttle window doubles as the LOCKED look: both steppers
      // gray exactly while the gate stands.
      expect(nextHours).toHaveAttribute('aria-disabled', 'true');
      expect(previousHours).toHaveAttribute('aria-disabled', 'true');
      expect(nextHours.className).toContain('colox-time-picker__step--locked');
      // The glide runs 240ms — a mid-ride click is dropped outright.
      act(() => {
        vi.advanceTimersByTime(120);
      });
      fireEvent.click(nextHours);
      expect(screen.getByLabelText('time')).toHaveValue('15:30:45');
      expect(nextHours).toHaveAttribute('aria-disabled', 'true');
      // Once the ride (and the window) lapses, the gray clears and a
      // click lands again.
      act(() => {
        vi.advanceTimersByTime(120);
      });
      expect(nextHours).not.toHaveAttribute('aria-disabled');
      expect(nextHours.className).not.toContain('colox-time-picker__step--locked');
      fireEvent.click(nextHours);
      expect(screen.getByLabelText('time')).toHaveValue('22:30:45');
      expect(nextHours).toHaveAttribute('aria-disabled', 'true');
      act(() => {
        vi.advanceTimersByTime(240);
      });
      expect(columnBox('hour').scrollTop).toBe(canonicalTop('hour', 22));
      expect(nextHours).not.toHaveAttribute('aria-disabled');
    } finally {
      vi.useRealTimers();
    }
  });

  it('glides the down chevron DOWN across the 23 → 00 seam', () => {
    useGlideTimers();
    try {
      render(<TimePicker aria-label="time" defaultValue="23:30:45" />);
      openPanel();
      fireEvent.click(screen.getByRole('button', { name: 'Next hours' }));
      expect(screen.getByLabelText('time')).toHaveValue('06:30:45');
      // The ride crosses the seam with the wrap folded into every
      // frame (each write stays in-band) and lands on the wrap seat —
      // content-identical, on the wheel's own re-anchor path.
      act(() => {
        vi.advanceTimersByTime(240);
      });
      expect(columnBox('hour').scrollTop).toBe(canonicalTop('hour', 6));
      // The window chases the scroll events the browser emits per
      // frame; jsdom doesn't — drive the landing event and read the
      // resynced window (slot 30 → lead spacer covers first = 20).
      driveScroll('hour', canonicalTop('hour', 6));
      const lead = columnBox('hour').querySelector('[aria-hidden]') as HTMLElement;
      expect(lead.style.height).toBe(`${20 * STRIDE}px`);
      expect(selectedOption('hour')).toHaveTextContent('06');
    } finally {
      vi.useRealTimers();
    }
  });

  it('glides the up chevron UP across the 00 → 23 seam', () => {
    useGlideTimers();
    try {
      render(<TimePicker aria-label="time" defaultValue="02:30:45" />);
      openPanel();
      fireEvent.click(screen.getByRole('button', { name: 'Previous hours' }));
      expect(screen.getByLabelText('time')).toHaveValue('19:30:45');
      // The wrap seat one lap up: the ride writes in-band values all
      // the way and lands at the canonical seat.
      act(() => {
        vi.advanceTimersByTime(240);
      });
      expect(columnBox('hour').scrollTop).toBe(canonicalTop('hour', 19));
      driveScroll('hour', canonicalTop('hour', 19));
      const lead = columnBox('hour').querySelector('[aria-hidden]') as HTMLElement;
      expect(lead.style.height).toBe(`${33 * STRIDE}px`);
      expect(selectedOption('hour')).toHaveTextContent('19');
    } finally {
      vi.useRealTimers();
    }
  });

  it('wraps every glide frame into the middle band — no off-band write can flash the column', () => {
    useGlideTimers();
    try {
      render(<TimePicker aria-label="time" defaultValue="23:30:45" />);
      openPanel();
      const hourBox = columnBox('hour');
      const writes: number[] = [];
      const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop');
      Object.defineProperty(hourBox, 'scrollTop', {
        configurable: true,
        get: () => descriptor!.get!.call(hourBox),
        set: (value: number) => {
          writes.push(value);
          descriptor!.set!.call(hourBox, value);
        },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Next hours' }));
      act(() => {
        vi.advanceTimersByTime(240);
      });
      // Frame after frame wrote a valid in-band offset — the seam
      // crossing is a content-identical wrap inside the writes, never
      // an out-of-band position the stale window could paint blank.
      expect(writes.length).toBeGreaterThan(2);
      const low = 24 * STRIDE - SLOT_PX;
      for (const write of writes) {
        expect(write).toBeGreaterThanOrEqual(low);
        expect(write).toBeLessThan(low + 24 * STRIDE);
      }
      expect(writes[writes.length - 1]).toBe(canonicalTop('hour', 6));
    } finally {
      vi.useRealTimers();
    }
  });

  it('cycles the columns across the wrap edges', () => {
    useGlideTimers();
    try {
      render(<TimePicker aria-label="time" defaultValue="23:30:45" />);
      openPanel();
      expect(columnLabels('hour')).toEqual(['20', '21', '22', '23', '00', '01', '02', '03']);
      fireEvent.click(screen.getByRole('button', { name: 'Next hours' }));
      expect(screen.getByLabelText('time')).toHaveValue('06:30:45');
      // The ride keeps the clicked direction through the seam and
      // lands on the wrap seat (canonical(6) — the band's in-scene).
      act(() => {
        vi.advanceTimersByTime(240);
      });
      expect(columnBox('hour').scrollTop).toBe(canonicalTop('hour', 6));
      expect(columnLabels('minute')).toEqual(['27', '28', '29', '30', '31', '32', '33', '34']);
      expect(columnLabels('second')).toEqual(['42', '43', '44', '45', '46', '47', '48', '49']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('picks preview into the field in gray and commits only on Confirm', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="time" defaultValue="08:30:45" onChange={onChange} />);
    openPanel();
    const input = screen.getByLabelText('time');
    fireEvent.click(within(columnBox('hour')).getByRole('option', { name: '14' }));
    // Preview, not commit: the panel stays open, nothing notified.
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Choose time' })).toBeInTheDocument();
    // The tentative word wears the gray preview styling in the value slot.
    expect(input).toHaveValue('14:30:45');
    expect(input.className).toContain('colox-time-picker__control--pending');
    // The selection wash rides the VALUE — it jumps to the picked
    // option the moment the click lands, no scroll needed.
    expect(selectedOption('hour')).toHaveTextContent('14');
    fireEvent.click(confirmButton());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].value).toBe('14:30:45');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(input).toHaveValue('14:30:45');
    expect(input.className).not.toContain('colox-time-picker__control--pending');
    expect(document.activeElement).toBe(input);
  });

  it('customizes the footer confirm text (确定 by default)', () => {
    const onChange = vi.fn();
    render(
      <TimePicker aria-label="time" defaultValue="08:30:45" onChange={onChange} confirmText="OK" />,
    );
    openPanel();
    fireEvent.click(within(columnBox('hour')).getByRole('option', { name: '14' }));
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(onChange.mock.calls[0][0].value).toBe('14:30:45');
  });

  it('picks a second through the seconds column', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="time" defaultValue="08:30:45" onChange={onChange} />);
    openPanel();
    fireEvent.click(within(columnBox('second')).getByRole('option', { name: '48' }));
    const input = screen.getByLabelText('time');
    expect(input).toHaveValue('08:30:48');
    fireEvent.click(confirmButton());
    expect(onChange.mock.calls[0][0].value).toBe('08:30:48');
  });

  it('discards the pending pick on outside dismiss', async () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="time" defaultValue="08:30:45" onChange={onChange} />);
    openPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Next hours' }));
    fireEvent.click(within(columnBox('hour')).getByRole('option', { name: '14' }));
    const input = screen.getByLabelText('time');
    expect(input).toHaveValue('14:30:45');
    fireEvent.pointerDown(document.body);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('08:30:45');
  });

  it('discards the pending pick on Escape', async () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="time" defaultValue="08:30:45" onChange={onChange} />);
    openPanel();
    fireEvent.click(within(columnBox('hour')).getByRole('option', { name: '06' }));
    const input = screen.getByLabelText('time');
    expect(input).toHaveValue('06:30:45');
    fireEvent.keyDown(document.body, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('08:30:45');
  });

  it('previews picks through the valueFormat (commit payload stays canonical)', () => {
    const onChange = vi.fn();
    render(
      <TimePicker
        aria-label="time"
        defaultValue="09:30:45"
        valueFormat="H.mm"
        onChange={onChange}
      />,
    );
    openPanel();
    const input = screen.getByLabelText('time');
    fireEvent.click(within(columnBox('hour')).getByRole('option', { name: '12' }));
    expect(input).toHaveValue('12.30');
    fireEvent.click(confirmButton());
    expect(onChange.mock.calls[0][0].value).toBe('12:30:45');
    expect(input).toHaveValue('12.30');
  });

  it('merges picks against the empty value as 00:00:00 via keyboard bounds', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="time" onChange={onChange} />);
    openPanel();
    // The empty seat starts at the system clock — Home lands each
    // column's bound (0), and each land merges into the pending word.
    fireEvent.keyDown(focusOption('hour'), { key: 'Home' });
    fireEvent.keyDown(focusOption('minute'), { key: 'Home' });
    fireEvent.keyDown(focusOption('second'), { key: 'Home' });
    const input = screen.getByLabelText('time');
    expect(input).toHaveValue('00:00:00');
    fireEvent.click(confirmButton());
    expect(onChange).toBeCalledTimes(1);
    expect(onChange.mock.calls[0][0].value).toBe('00:00:00');
  });

  it('disables out-of-bounds options and rolls a typed word back', async () => {
    const onChange = vi.fn();
    render(
      <TimePicker
        aria-label="time"
        min="14:00:00"
        max="18:30:30"
        defaultValue="15:00:00"
        onChange={onChange}
      />,
    );
    openPanel();
    const hourBox = columnBox('hour');
    // Hour 13 and 19 merge out of bounds at the committed minute/second.
    expect(within(hourBox).getByRole('option', { name: '13' })).toBeDisabled();
    expect(within(hourBox).getByRole('option', { name: '14' })).toBeEnabled();
    expect(within(hourBox).getByRole('option', { name: '19' })).toBeDisabled();
    // Dismiss before typing: blurs that hop INTO the open panel skip
    // normalization by design (the Confirm hop must not commit the
    // preview) — the closed-field blur is the rollback channel.
    fireEvent.pointerDown(document.body);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    const input = screen.getByLabelText('time');
    fireEvent.change(input, { target: { value: '13:00:00' } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(input).toHaveValue('15:00:00');
  });

  it('disables an option whose pending merge falls out of bounds', () => {
    render(<TimePicker aria-label="time" min="14:50:30" defaultValue="15:30:45" />);
    openPanel();
    const hourBox = columnBox('hour');
    // 14:30:45 (the merge against the committed minute/second) sits
    // below min — disabled; 14:50:45+ is fine.
    expect(within(hourBox).getByRole('option', { name: '14' })).toBeDisabled();
    expect(within(hourBox).getByRole('option', { name: '15' })).toBeEnabled();
  });

  it('clearable swaps in the clear control and commits null', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="time" defaultValue="08:30:45" clearable onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear time' }));
    expect(onChange.mock.calls[0][0].value).toBeNull();
  });

  it('opens via ArrowDown and steps through the columns with the keyboard', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="time" defaultValue="08:30:45" onChange={onChange} />);
    const input = screen.getByLabelText('time');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const hourBox = columnBox('hour');
    // The ↑/↓ step rides the pending value: the track scrolls to follow.
    fireEvent.keyDown(focusOption('hour'), { key: 'ArrowDown' });
    expect(input).toHaveValue('09:30:45');
    expect(within(hourBox).getByRole('option', { name: '09' })).toHaveAttribute('tabindex', '0');
    // Enter no longer commits — the Confirm button owns that.
    fireEvent.keyDown(within(hourBox).getByRole('option', { name: '09' }), { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Choose time' })).toBeInTheDocument();
    expect(input).toHaveValue('09:30:45');
    fireEvent.click(confirmButton());
    expect(onChange.mock.calls[0][0].value).toBe('09:30:45');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('fires onOpenChange for the open and the confirm close', () => {
    const onOpenChange = vi.fn();
    render(<TimePicker aria-label="time" onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByLabelText('time'));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    fireEvent.click(confirmButton());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('closes on Confirm without notifying when nothing changed', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="time" defaultValue="08:30:45" onChange={onChange} />);
    openPanel();
    fireEvent.click(confirmButton());
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('disables the Confirm button while the pending word sits out of bounds', () => {
    render(<TimePicker aria-label="time" min="14:50:30" max="21:30:00" defaultValue="15:00:00" />);
    openPanel();
    const hourBox = columnBox('hour');
    // Home lands hour 0 → 00:00:00 < min → the commit path blocks.
    fireEvent.keyDown(focusOption('hour'), { key: 'Home' });
    expect(confirmButton()).toBeDisabled();
    // Clicking an in-bounds option (16:00:00) re-opens the commit path.
    fireEvent.click(within(hourBox).getByRole('option', { name: '16' }));
    expect(confirmButton()).toBeEnabled();
  });

  it('scrolls freely with the wheel without touching the selection', () => {
    render(<TimePicker aria-label="time" defaultValue="08:30:45" />);
    openPanel();
    expect(columnLabels('hour')).toEqual(['05', '06', '07', '08', '09', '10', '11', '12']);
    const hourListbox = columnBox('hour');
    const input = screen.getByLabelText('time');
    expect(hourListbox.scrollTop).toBe(canonicalTop('hour', 8));
    // 100 px = two options — the wheel adds the scaled delta straight
    // to scrollTop (free scrolling, nothing more).
    fireEvent.wheel(hourListbox, { deltaY: 100, deltaMode: 0 });
    expect(hourListbox.scrollTop).toBe(canonicalTop('hour', 8) + 60);
    fireEvent.scroll(hourListbox);
    expect(columnLabels('hour')).toEqual(['07', '08', '09', '10', '11', '12', '13', '14']);
    // Free scroll selects nothing — not even a preselection: the
    // pending word, aria-selected and the subtle wash all stay on 08.
    expect(input).toHaveValue('08:30:45');
    expect(within(hourListbox).getByRole('option', { name: '08' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(selectedOption('hour')).toHaveTextContent('08');
    // A fractional rest is legal: 25 px buys 15 px — free positions
    // are the point (alignment is the click's job, not the wheel's).
    fireEvent.wheel(hourListbox, { deltaY: 25, deltaMode: 0 });
    expect(hourListbox.scrollTop).toBe(canonicalTop('hour', 8) + 75);
    fireEvent.scroll(hourListbox);
    expect(input).toHaveValue('08:30:45');
    expect(selectedOption('hour')).toHaveTextContent('08');
  });

  it('re-aligns the picked option onto the focus slot on click', () => {
    useGlideTimers();
    try {
      render(<TimePicker aria-label="time" defaultValue="08:30:45" />);
      openPanel();
      const hourBox = columnBox('hour');
      const input = screen.getByLabelText('time');
      // Free the wheel off the grid first (15 px over one option) —
      // the view may rest where it wants.
      fireEvent.wheel(hourBox, { deltaY: 125, deltaMode: 0 });
      expect(hourBox.scrollTop).toBe(canonicalTop('hour', 8) + 75);
      fireEvent.scroll(hourBox);
      // The click is the auto re-align: the picked option rides onto
      // the focus slot over the direct-write glide.
      fireEvent.click(within(hourBox).getByRole('option', { name: '06' }));
      act(() => {
        vi.advanceTimersByTime(240);
      });
      expect(hourBox.scrollTop).toBe(canonicalTop('hour', 6));
      expect(input).toHaveValue('06:30:45');
      expect(within(hourBox).getByRole('option', { name: '06' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(selectedOption('hour')).toHaveTextContent('06');
    } finally {
      vi.useRealTimers();
    }
  });

  it('re-anchors the lap when the free scroll crosses the cycle seam and resyncs the window in the same frame', () => {
    render(<TimePicker aria-label="time" defaultValue="08:30:45" />);
    openPanel();
    const hourBox = columnBox('hour');
    // Below the middle lap's slot band (low = canonical(0) = 630px):
    // the handler shifts scrollTop one lap up — the three laps are
    // identical, so the jump is invisible.
    driveScroll('hour', 500);
    expect(hourBox.scrollTop).toBe(500 + 24 * STRIDE);
    // And the rendered window already covers the re-anchored position
    // (no stale frame at the seam): slot 43 → visible values 16–23.
    expect(columnLabels('hour')).toEqual(['16', '17', '18', '19', '20', '21', '22', '23']);
  });

  it('keeps the window in sync when a fast roll crosses the seam from above', () => {
    render(<TimePicker aria-label="time" defaultValue="08:30:45" />);
    openPanel();
    // One event lands past the high seam (1350px) — a fast notch spin
    // does exactly this: the re-anchor rewinds a full lap and the
    // window updates synchronously, so no blank flash can paint.
    driveScroll('hour', 1400);
    expect(columnBox('hour').scrollTop).toBe(680);
    expect(columnLabels('hour')).toEqual(['22', '23', '00', '01', '02', '03', '04', '05']);
  });

  it('turns pointer events off while the wheel rolls and restores them once it settles', () => {
    vi.useFakeTimers();
    try {
      render(<TimePicker aria-label="time" defaultValue="08:30:45" />);
      openPanel();
      const hourBox = columnBox('hour');
      expect(hourBox.className).not.toContain('colox-time-picker__listbox--scrolling');
      // Rolling: cells racing under the cursor must not flash their
      // hover wash (antd's trick — pointer-events: none in flight).
      fireEvent.wheel(hourBox, { deltaY: 100, deltaMode: 0 });
      fireEvent.scroll(hourBox);
      expect(hourBox.className).toContain('colox-time-picker__listbox--scrolling');
      // A second roll inside the quiet window re-arms it — and the wheel
      // keeps scrolling while the cells are suppressed (the listener
      // lives on the viewport; the cells' pointer-events off must not
      // strand further wheel input at the page).
      act(() => {
        vi.advanceTimersByTime(50);
      });
      fireEvent.wheel(hourBox, { deltaY: 50, deltaMode: 0 });
      expect(hourBox.scrollTop).toBe(canonicalTop('hour', 11));
      fireEvent.scroll(hourBox);
      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(hourBox.className).toContain('colox-time-picker__listbox--scrolling');
      // A quiet moment after the last scroll event restores hover.
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(hourBox.className).not.toContain('colox-time-picker__listbox--scrolling');
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps the selection wash riding the picked value on every column', () => {
    render(<TimePicker aria-label="time" defaultValue="08:30:45" />);
    openPanel();
    // The wash rides the VALUE (not the slot): each column's selected
    // option reads its own pending component at the seat.
    expect(selectedOption('hour')).toHaveTextContent('08');
    expect(selectedOption('minute')).toHaveTextContent('30');
    expect(selectedOption('second')).toHaveTextContent('45');
  });
});

describe('time-picker shell pointer continuity', () => {
  it('parks the focus through a shell press and signals the open state on the root', () => {
    render(<TimePicker aria-label="time" />);
    const shellEl = screen.getByRole('combobox').closest('.colox-time-picker') as HTMLElement;
    const icon = document.querySelector('.colox-time-picker__icon') as HTMLElement;
    // Same contract as the Select and the DatePicker: the unfocusable shell
    // must not blur the active element before the click opens the panel.
    expect(fireEvent.mouseDown(icon)).toBe(false);
    expect(fireEvent.mouseDown(screen.getByRole('combobox'))).toBe(true);

    fireEvent.click(icon);
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
    expect(shellEl).toHaveClass('colox-time-picker--open');
  });
});
