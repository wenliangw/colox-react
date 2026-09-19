import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker } from '../date-picker';
import { todayIso } from '../utils/date-core';

const input = () => screen.getByRole('combobox') as HTMLInputElement;
const shell = () => input().closest('.colox-date-picker') as HTMLElement;
const dayCell = (iso: string) => screen.getByRole('gridcell', { name: iso });
const onChange = () => vi.fn();

describe('date-picker contract', () => {
  it('renders the combobox shell with the calendar glyph and closed panel', () => {
    render(<DatePicker data-testid="dp" />);
    expect(input()).toHaveValue('');
    expect(input()).toHaveAttribute('placeholder', 'yyyy-MM-dd');
    expect(input()).toHaveAttribute('aria-expanded', 'false');
    expect(input()).toHaveAttribute('data-testid', 'dp');
    expect(document.querySelector('.colox-date-picker__icon')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('applies the size tier classes', () => {
    const sizes: Array<['xs' | 'sm' | 'md' | 'lg', string]> = [
      ['xs', 'colox-date-picker--xs'],
      ['sm', 'colox-date-picker--sm'],
      ['md', 'colox-date-picker--md'],
      ['lg', 'colox-date-picker--lg'],
    ];
    for (const [size, expected] of sizes) {
      const { unmount } = render(<DatePicker size={size} />);
      expect(shell()).toHaveClass(expected);
      unmount();
    }
  });

  it('defaults to md size and primary palette', () => {
    render(<DatePicker />);
    expect(shell()).toHaveClass('colox-date-picker--md');
    expect(shell()).toHaveClass('colox-date-picker--primary');
  });

  // The panel renders inside a portal — the palette modifier class
  // must ride the popup root too, because the shell is not an
  // ancestor of the portaled panel (the palette CSS variables would
  // otherwise cascade into nothing and the selected/today paints
  // would be invisible).
  it('carries the palette class on the portaled panel root', () => {
    render(<DatePicker />);
    fireEvent.click(shell());
    expect(document.querySelector('.colox-date-picker__popup')).toHaveClass(
      'colox-date-picker--primary',
    );
  });

  it('maps the palette families onto the popup root', () => {
    render(<DatePicker palette="gray" />);
    fireEvent.click(shell());
    expect(document.querySelector('.colox-date-picker__popup')).toHaveClass(
      'colox-date-picker--gray',
    );
  });

  it('marks invalid fields with the class and aria-invalid', () => {
    render(<DatePicker invalid />);
    expect(shell()).toHaveClass('colox-date-picker--invalid');
    expect(input()).toHaveAttribute('aria-invalid', 'true');
  });

  it('disables the control and blocks panel opening', () => {
    render(<DatePicker disabled />);
    expect(input()).toBeDisabled();
    fireEvent.click(shell());
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('keeps readOnly fields from opening the panel', () => {
    render(<DatePicker readOnly />);
    expect(input()).toHaveAttribute('readonly');
    fireEvent.click(shell());
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });
});

describe('editor state machine', () => {
  it('commits a complete typed date immediately with the canonical value', () => {
    const handleChange = onChange();
    render(<DatePicker onChange={handleChange} />);
    fireEvent.change(input(), { target: { value: '2026-03-02' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange.mock.calls[0][0].value).toBe('2026-03-02');
  });

  it('accepts the lenient ISO grammar and keeps the typed display while focused', () => {
    const handleChange = onChange();
    render(<DatePicker onChange={handleChange} />);
    fireEvent.change(input(), { target: { value: '2026/3/2' } });
    expect(handleChange.mock.calls[0][0].value).toBe('2026-03-02');
    expect(input()).toHaveValue('2026/3/2');
  });

  it('normalizes the display through the format on blur', () => {
    render(<DatePicker />);
    fireEvent.change(input(), { target: { value: '2026/3/2' } });
    fireEvent.blur(input());
    expect(input()).toHaveValue('2026-03-02');
  });

  it('silences partial drafts', () => {
    const handleChange = onChange();
    render(<DatePicker onChange={handleChange} />);
    fireEvent.change(input(), { target: { value: '2026-0' } });
    expect(handleChange).not.toHaveBeenCalled();
    expect(input()).toHaveValue('2026-0');
  });

  it('rolls partial drafts back to the committed value on blur', () => {
    render(<DatePicker defaultValue="2026-03-15" />);
    fireEvent.change(input(), { target: { value: '2026-1' } });
    fireEvent.blur(input());
    expect(input()).toHaveValue('2026-03-15');
  });

  it('rejects impossible calendar dates and rolls an empty field back to blank', () => {
    const handleChange = onChange();
    render(<DatePicker onChange={handleChange} />);
    fireEvent.change(input(), { target: { value: '2026-02-30' } });
    expect(handleChange).not.toHaveBeenCalled();
    fireEvent.blur(input());
    expect(input()).toHaveValue('');
  });

  it('commits null when the field empties', () => {
    const handleChange = onChange();
    render(<DatePicker defaultValue="2026-03-15" onChange={handleChange} />);
    fireEvent.change(input(), { target: { value: '' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange.mock.calls[0][0].value).toBeNull();
  });

  it('holds out-of-bounds typed values silently and rolls back on blur', () => {
    const handleChange = onChange();
    render(<DatePicker min="2026-03-10" defaultValue="2026-03-15" onChange={handleChange} />);
    fireEvent.change(input(), { target: { value: '2026-02-05' } });
    expect(handleChange).not.toHaveBeenCalled();
    expect(input()).toHaveValue('2026-02-05');
    fireEvent.blur(input());
    expect(input()).toHaveValue('2026-03-15');
  });

  it('skips re-committing the already committed value', () => {
    const handleChange = onChange();
    render(<DatePicker defaultValue="2026-03-15" onChange={handleChange} />);
    fireEvent.change(input(), { target: { value: '2026-03-15' } });
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders a controlled value and resyncs display on external moves', () => {
    const { rerender } = render(<DatePicker value="2026-03-15" />);
    expect(input()).toHaveValue('2026-03-15');
    rerender(<DatePicker value="2026-04-20" />);
    expect(input()).toHaveValue('2026-04-20');
  });

  it('seeds an uncontrolled default value', () => {
    render(<DatePicker defaultValue="2026-03-15" />);
    expect(input()).toHaveValue('2026-03-15');
  });

  it('renders through a custom format', () => {
    render(<DatePicker value="2026-03-02" valueFormat="dd.MM.yyyy" />);
    expect(input()).toHaveValue('02.03.2026');
    expect(input()).toHaveAttribute('placeholder', 'dd.MM.yyyy');
  });

  it('renders weekday formats (display-only)', () => {
    render(<DatePicker value="2026-03-02" valueFormat="yyyy-MM-dd EEE" />);
    expect(input()).toHaveValue('2026-03-02 Mon');
  });

  it('parses typed text through the custom format into canonical ISO', () => {
    const handleChange = onChange();
    render(<DatePicker valueFormat="d.M.yyyy" onChange={handleChange} />);
    fireEvent.change(input(), { target: { value: '2.3.2026' } });
    expect(handleChange.mock.calls[0][0].value).toBe('2026-03-02');
  });
});

describe('calendar panel', () => {
  it('opens on shell click, seeded to the value month with the Chinese chrome defaults', () => {
    render(<DatePicker defaultValue="2026-03-15" />);
    fireEvent.click(shell());
    expect(
      (document.querySelector('.colox-date-picker__panel') as HTMLElement).textContent,
    ).toContain('2026年');
    expect(
      (document.querySelector('.colox-date-picker__panel') as HTMLElement).textContent,
    ).toContain('3月');
    const weekdayHeaders = Array.from(document.querySelectorAll('.colox-date-picker__weekday')).map(
      (node) => node.textContent,
    );
    expect(weekdayHeaders).toEqual(['一', '二', '三', '四', '五', '六', '日']);
  });

  it('split the day titles into a year and month button (antd-style drilling)', () => {
    render(<DatePicker defaultValue="2026-03-15" />);
    fireEvent.click(shell());
    expect(screen.getByRole('button', { name: '2026年' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3月' })).toBeInTheDocument();
  });

  it('localizes the panel chrome through the locale prop', () => {
    render(
      <DatePicker
        defaultValue="2026-03-15"
        locale={{
          months: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
          ],
          weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
          yearMonthFormat: '{month} {year}',
          yearFormat: '{year}',
        }}
      />,
    );
    fireEvent.click(shell());
    expect(screen.getByRole('button', { name: '2026' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'March' })).toBeInTheDocument();
    expect(document.querySelector('.colox-date-picker__weekday')?.textContent).toBe('Mo');
  });

  it('toggles aria-expanded with the panel', () => {
    render(<DatePicker />);
    fireEvent.click(shell());
    expect(input()).toHaveAttribute('aria-expanded', 'true');
    expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
  });

  it('selects a day: commit, close, refocus the field', () => {
    const handleChange = onChange();
    render(<DatePicker defaultValue="2026-03-15" onChange={handleChange} />);
    fireEvent.click(shell());
    fireEvent.click(dayCell('2026-03-16'));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange.mock.calls[0][0].value).toBe('2026-03-16');
    expect(input()).toHaveValue('2026-03-16');
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    expect(input()).toHaveFocus();
  });

  it('selects an adjacent-month day and closes', () => {
    const handleChange = onChange();
    render(<DatePicker defaultValue="2026-03-15" onChange={handleChange} />);
    fireEvent.click(shell());
    fireEvent.click(dayCell('2026-04-02'));
    expect(handleChange.mock.calls[0][0].value).toBe('2026-04-02');
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('navigates months with the chevrons', () => {
    render(<DatePicker defaultValue="2026-03-15" />);
    fireEvent.click(shell());
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByRole('button', { name: '2026年' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2月' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('button', { name: '2026年' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3月' })).toBeInTheDocument();
  });

  it('disables out-of-bound days on the grid', () => {
    render(<DatePicker min="2026-03-10" max="2026-03-20" defaultValue="2026-03-15" />);
    fireEvent.click(shell());
    expect(dayCell('2026-03-09')).toBeDisabled();
    expect(dayCell('2026-03-21')).toBeDisabled();
    expect(dayCell('2026-03-15')).not.toBeDisabled();
  });

  it('ignores clicks on disabled days', () => {
    const handleChange = onChange();
    render(<DatePicker min="2026-03-10" defaultValue="2026-03-15" onChange={handleChange} />);
    fireEvent.click(shell());
    fireEvent.click(dayCell('2026-03-09'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('marks the selected and today cells', () => {
    const today = todayIso();
    render(<DatePicker defaultValue={today} />);
    fireEvent.click(shell());
    expect(dayCell(today)).toHaveClass(
      'colox-date-picker__day--today',
      'colox-date-picker__day--selected',
    );
    expect(dayCell(today)).toHaveAttribute('aria-selected', 'true');
  });

  it('marks the current cell in every selection state (subtle is unconditional)', () => {
    const today = todayIso();
    // A different day of the current month (in-view, not the current cell).
    const other = `${today.slice(0, 8)}${today.slice(8) === '01' ? '02' : '01'}`;
    // The current cell keeps its class whether or not a value commits;
    // the paint layers (subtle vs. solid fill) resolve in CSS.
    const { unmount } = render(<DatePicker />);
    fireEvent.click(shell());
    expect(dayCell(today)).toHaveClass('colox-date-picker__day--today');
    unmount();
    render(<DatePicker defaultValue={other} />);
    fireEvent.click(shell());
    expect(dayCell(today)).toHaveClass('colox-date-picker__day--today');
    expect(dayCell(today)).not.toHaveClass('colox-date-picker__day--selected');
  });

  it('keeps both classes when the selection is the current cell', () => {
    const today = todayIso();
    render(<DatePicker defaultValue={today} />);
    fireEvent.click(shell());
    expect(dayCell(today)).toHaveClass('colox-date-picker__day--today');
    expect(dayCell(today)).toHaveClass('colox-date-picker__day--selected');
  });

  it('shows the trailing clear control when clearable and a value commits (Select parity)', () => {
    render(<DatePicker defaultValue="2026-03-15" clearable />);
    expect(screen.getByRole('button', { name: 'Clear date' })).toBeInTheDocument();
    expect(shell()).toHaveClass('colox-date-picker--clearable');
  });

  it('hides the clear control without a value or without the clearable flag', () => {
    const { unmount } = render(<DatePicker clearable />);
    expect(screen.queryByRole('button', { name: 'Clear date' })).not.toBeInTheDocument();
    unmount();
    render(<DatePicker defaultValue="2026-03-15" />);
    expect(screen.queryByRole('button', { name: 'Clear date' })).not.toBeInTheDocument();
  });

  it('clears to null from the trailing control without opening the panel', () => {
    const handleChange = onChange();
    render(<DatePicker defaultValue="2026-03-15" clearable onChange={handleChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear date' }));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange.mock.calls[0][0].value).toBeNull();
    expect(input()).toHaveValue('');
    expect(input()).toHaveFocus();
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('keeps clicking the clear control from toggling the panel', () => {
    const handleChange = onChange();
    render(<DatePicker defaultValue="2026-03-15" clearable onChange={handleChange} />);
    fireEvent.click(shell());
    expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear date' }));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange.mock.calls[0][0].value).toBeNull();
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('commits with a change-shaped event whose target is the field', () => {
    const handleChange = onChange();
    render(<DatePicker defaultValue="2026-03-15" onChange={handleChange} />);
    fireEvent.click(shell());
    fireEvent.click(dayCell('2026-03-16'));
    const payloadEvent = handleChange.mock.calls[0][0];
    expect(payloadEvent.event.type).toBe('change');
    expect(payloadEvent.event.target).toBe(input());
  });

  it('closes on outside pointerdown', () => {
    render(<DatePicker />);
    fireEvent.click(shell());
    fireEvent.pointerDown(document.body);
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });
});

describe('keyboard', () => {
  it('opens the panel with ArrowDown or Enter on the field', () => {
    render(<DatePicker />);
    fireEvent.keyDown(input(), { key: 'ArrowDown' });
    expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: 'Escape' });
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
  });

  it('does not open with other keys', () => {
    render(<DatePicker />);
    fireEvent.keyDown(input(), { key: 'a' });
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('rotates the grid focus with the arrow keys', () => {
    render(<DatePicker defaultValue="2026-03-15" />);
    fireEvent.click(shell());
    fireEvent.keyDown(dayCell('2026-03-15'), { key: 'ArrowRight' });
    expect(dayCell('2026-03-16')).toHaveFocus();
    fireEvent.keyDown(dayCell('2026-03-16'), { key: 'ArrowDown' });
    expect(dayCell('2026-03-23')).toHaveFocus();
  });

  it('jumps to the week start with Home', () => {
    render(<DatePicker defaultValue="2026-03-15" />);
    fireEvent.click(shell());
    fireEvent.keyDown(dayCell('2026-03-15'), { key: 'Home' });
    expect(dayCell('2026-03-09')).toHaveFocus();
  });

  it('flips the month view with PageDown and keeps the day', () => {
    render(<DatePicker defaultValue="2026-03-15" />);
    fireEvent.click(shell());
    fireEvent.keyDown(dayCell('2026-03-15'), { key: 'PageDown' });
    expect(screen.getByRole('button', { name: '2026年' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4月' })).toBeInTheDocument();
    expect(dayCell('2026-04-15')).toHaveFocus();
  });

  it('selects the focused day with Enter', () => {
    const handleChange = onChange();
    render(<DatePicker defaultValue="2026-03-15" onChange={handleChange} />);
    fireEvent.click(shell());
    fireEvent.keyDown(dayCell('2026-03-15'), { key: 'ArrowRight' });
    fireEvent.keyDown(dayCell('2026-03-16'), { key: 'Enter' });
    expect(handleChange.mock.calls[0][0].value).toBe('2026-03-16');
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('closes the panel on Escape', () => {
    render(<DatePicker />);
    fireEvent.click(shell());
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    expect(input()).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('month picker', () => {
  it('renders the 3×4 month grid under the Chinese year title with the month placeholder', () => {
    render(<DatePicker picker="month" />);
    expect(input()).toHaveAttribute('placeholder', 'yyyy-MM');
    fireEvent.click(shell());
    const year = Number(todayIso().slice(0, 4));
    expect(screen.getByText(`${year}年`)).toBeInTheDocument();
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(12);
    expect(cells[1]).toHaveAccessibleName(`${year}-02`);
    expect(cells[11]).toHaveAccessibleName(`${year}-12`);
  });

  it('commits the clicked month as canonical YYYY-MM and closes', () => {
    const handleChange = onChange();
    render(<DatePicker picker="month" onChange={handleChange} />);
    const year = Number(todayIso().slice(0, 4));
    fireEvent.click(shell());
    fireEvent.click(dayCell(`${year}-03`));
    expect(handleChange.mock.calls[0][0].value).toBe(`${year}-03`);
    expect(input()).toHaveValue(`${year}-03`);
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('types month grammars at month precision and rolls back partials', () => {
    const handleChange = onChange();
    render(<DatePicker picker="month" onChange={handleChange} />);
    fireEvent.change(input(), { target: { value: '2026/3' } });
    expect(handleChange.mock.calls[0][0].value).toBe('2026-03');
    // A full date truncates to the same month value — the same-value
    // guard swallows the echo (no extra notification; blur normalizes
    // the verbatim draft to the canonical display).
    fireEvent.change(input(), { target: { value: '2026-03-02' } });
    expect(input()).toHaveValue('2026-03-02');
    fireEvent.blur(input());
    expect(input()).toHaveValue('2026-03');
    expect(handleChange).toHaveBeenCalledTimes(1);
    // A bare year is below month precision — it never commits; blur
    // rolls back to the committed month.
    fireEvent.change(input(), { target: { value: '2026' } });
    fireEvent.blur(input());
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input()).toHaveValue('2026-03');
  });

  it('keys through the month grid across year edges', () => {
    render(<DatePicker picker="month" defaultValue="2026-12" />);
    fireEvent.click(shell());
    fireEvent.keyDown(dayCell('2026-12'), { key: 'ArrowRight' });
    expect(screen.getByText('2027年')).toBeInTheDocument();
    expect(dayCell('2027-01')).toHaveFocus();
  });

  it('disables months outside the bounds by prefix comparison', () => {
    render(<DatePicker picker="month" min="2026-03-10" max="2026-06-20" />);
    fireEvent.click(shell());
    expect(dayCell('2026-03')).toBeEnabled();
    expect(dayCell('2026-02')).toBeDisabled();
    expect(dayCell('2026-07')).toBeDisabled();
  });
});

describe('year picker', () => {
  it('renders the 3×4 decade window under the decade title with the year placeholder', () => {
    render(<DatePicker picker="year" />);
    expect(input()).toHaveAttribute('placeholder', 'yyyy');
    fireEvent.click(shell());
    const year = Number(todayIso().slice(0, 4));
    const decadeStart = Math.floor(year / 10) * 10;
    expect(screen.getByText(`${decadeStart}–${decadeStart + 11}年`)).toBeInTheDocument();
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(12);
    expect(cells[0]).toHaveAccessibleName(String(decadeStart));
    expect(cells[11]).toHaveAccessibleName(String(decadeStart + 11));
  });

  it('commits the clicked year and normalizes typed text to the year', () => {
    const handleChange = onChange();
    render(<DatePicker picker="year" onChange={handleChange} />);
    fireEvent.change(input(), { target: { value: '2026-03-02' } });
    expect(handleChange.mock.calls[0][0].value).toBe('2026');
    expect(input()).toHaveValue('2026-03-02');
    fireEvent.blur(input());
    expect(input()).toHaveValue('2026');
    fireEvent.click(shell());
    fireEvent.click(dayCell('2024'));
    expect(handleChange.mock.calls[1][0].value).toBe('2024');
  });

  it('shifts the decade by ten years at a time and keys across decade edges', () => {
    render(<DatePicker picker="year" defaultValue="2029" />);
    fireEvent.click(shell());
    expect(screen.getByText('2020–2031年')).toBeInTheDocument();
    fireEvent.keyDown(dayCell('2029'), { key: 'ArrowRight' });
    // 2030 belongs to the next decade window — the view follows.
    expect(screen.getByText('2030–2041年')).toBeInTheDocument();
    expect(dayCell('2030')).toHaveFocus();
  });

  it('disables years outside the bounds by prefix comparison', () => {
    render(<DatePicker picker="year" min="2026-10-01" max="2028-02-01" />);
    fireEvent.click(shell());
    expect(dayCell('2025')).toBeDisabled();
    expect(dayCell('2026')).toBeEnabled();
    expect(dayCell('2028')).toBeEnabled();
    expect(dayCell('2029')).toBeDisabled();
  });
});

describe('level drilling', () => {
  it('drills the day title into the month and decade grids and picks back down to a day', () => {
    const handleChange = onChange();
    render(<DatePicker defaultValue="2026-03-15" onChange={handleChange} />);
    fireEvent.click(shell());
    // The day grid's month segment climbs to the month grid.
    fireEvent.click(screen.getByRole('button', { name: '3月' }));
    expect(screen.getByRole('button', { name: '2026年' })).toBeInTheDocument();
    expect(screen.getAllByRole('gridcell')).toHaveLength(12);
    // The month grid's year title climbs to the decade grid.
    fireEvent.click(screen.getByRole('button', { name: '2026年' }));
    expect(screen.getByText('2020–2031年')).toBeInTheDocument();
    expect(screen.getAllByRole('gridcell')).toHaveLength(12);
    // Picking a year descends to that year's month grid — no commit.
    fireEvent.click(dayCell('2020'));
    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '2020年' })).toBeInTheDocument();
    expect(screen.getAllByRole('gridcell')).toHaveLength(12);
    // Picking a month descends to that month's day grid — no commit.
    fireEvent.click(dayCell('2020-05'));
    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '2020年' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5月' })).toBeInTheDocument();
    // Picking a day at the base level commits and closes.
    fireEvent.click(dayCell('2020-05-10'));
    expect(handleChange.mock.calls[0][0].value).toBe('2020-05-10');
    expect(input()).toHaveValue('2020-05-10');
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('jumps the year segment straight to the decade grid', () => {
    const handleChange = onChange();
    render(<DatePicker defaultValue="2026-03-15" onChange={handleChange} />);
    fireEvent.click(shell());
    fireEvent.click(screen.getByRole('button', { name: '2026年' }));
    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.getByText('2020–2031年')).toBeInTheDocument();
    expect(screen.getAllByRole('gridcell')).toHaveLength(12);
  });

  it('drills the month picker title to the decade and commits only the picked month', () => {
    const handleChange = onChange();
    render(<DatePicker picker="month" defaultValue="2026-05" onChange={handleChange} />);
    fireEvent.click(shell());
    fireEvent.click(screen.getByRole('button', { name: '2026年' }));
    expect(screen.getByText('2020–2031年')).toBeInTheDocument();
    fireEvent.click(dayCell('2020'));
    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '2020年' })).toBeInTheDocument();
    fireEvent.click(dayCell('2020-03'));
    expect(handleChange.mock.calls[0][0].value).toBe('2020-03');
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('keeps the year picker title terminal (a plain span with no higher level)', () => {
    render(<DatePicker picker="year" defaultValue="2026" />);
    fireEvent.click(shell());
    expect(screen.queryByRole('button', { name: '2020–2031年' })).not.toBeInTheDocument();
    expect(screen.getByText('2020–2031年').tagName).toBe('SPAN');
  });

  it('keys through the drill: the anchor follows the level and Enter descends without committing', () => {
    const handleChange = onChange();
    render(<DatePicker defaultValue="2026-03-15" onChange={handleChange} />);
    fireEvent.click(shell());
    // Drilling up lands the focus on the selection's month.
    fireEvent.click(screen.getByRole('button', { name: '3月' }));
    expect(screen.getByRole('button', { name: '2026年' })).toBeInTheDocument();
    expect(dayCell('2026-03')).toHaveFocus();
    // The single chevrons step a year at the month level.
    fireEvent.click(screen.getByRole('button', { name: 'Next year' }));
    expect(screen.getByRole('button', { name: '2027年' })).toBeInTheDocument();
    // Drilling the year title lands on the decade grid.
    fireEvent.click(screen.getByRole('button', { name: '2027年' }));
    expect(screen.getByText('2020–2031年')).toBeInTheDocument();
    // The year panel shows the double chevrons only, stepping a decade.
    expect(screen.queryByRole('button', { name: 'Next year' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next decade' }));
    expect(screen.getByText('2030–2041年')).toBeInTheDocument();
    // Enter on a year descends to its month grid and anchors its
    // home (no selection in 2031 → January).
    fireEvent.keyDown(dayCell('2031'), { key: 'Enter' });
    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '2031年' })).toBeInTheDocument();
    expect(dayCell('2031-01')).toHaveFocus();
    // Enter on a month descends to the day grid and anchors its 1st.
    fireEvent.keyDown(dayCell('2031-12'), { key: 'Enter' });
    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '2031年' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '12月' })).toBeInTheDocument();
    expect(dayCell('2031-12-01')).toHaveFocus();
  });

  it('steps the double chevrons by the parent granularity', () => {
    render(<DatePicker defaultValue="2026-03-15" />);
    fireEvent.click(shell());
    // The day grid: double = year, single = month.
    fireEvent.click(screen.getByRole('button', { name: 'Previous year' }));
    expect(screen.getByRole('button', { name: '2025年' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3月' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next year' }));
    expect(screen.getByRole('button', { name: '2026年' })).toBeInTheDocument();
    // The month grid: double = decade, single = year.
    fireEvent.click(screen.getByRole('button', { name: '3月' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous decade' }));
    expect(screen.getByRole('button', { name: '2016年' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next decade' }));
    expect(screen.getByRole('button', { name: '2026年' })).toBeInTheDocument();
  });
});
