import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TimePicker } from '..';

const openPanel = () => {
  fireEvent.click(screen.getByRole('combobox'));
};

/** The 8 rendered option labels of a column (render order). */
const columnLabels = (unit: 'hour' | 'minute') =>
  within(screen.getByRole('listbox', { name: unit === 'hour' ? 'Hours' : 'Minutes' }))
    .getAllByRole('option')
    .map((option) => option.textContent);

describe('TimePicker', () => {
  it('renders the Input family shell with the HH:mm placeholder', () => {
    render(<TimePicker aria-label="time" />);
    const input = screen.getByLabelText('time');
    expect(input).toBeInstanceOf(HTMLInputElement);
    expect(input.getAttribute('placeholder')).toBe('HH:mm');
    expect(input.getAttribute('role')).toBe('combobox');
  });

  it('commits a complete typed word through the change payload', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="time" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('time'), { target: { value: '08:30' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].value).toBe('08:30');
  });

  it('takes the lenient grammar (8:30, 8:3) into the canonical word', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="time" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('time'), { target: { value: '8:30' } });
    expect(onChange.mock.calls[0][0].value).toBe('08:30');
    fireEvent.change(screen.getByLabelText('time'), { target: { value: '8:3' } });
    expect(onChange.mock.calls[1][0].value).toBe('08:03');
  });

  it('renders typed commits through the valueFormat (display only, payload canonical)', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="time" valueFormat="H.mm" onChange={onChange} />);
    const input = screen.getByLabelText('time');
    fireEvent.change(input, { target: { value: '8.30' } });
    expect(onChange.mock.calls[0][0].value).toBe('08:30');
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
    render(<TimePicker aria-label="time" defaultValue="08:30" onChange={onChange} />);
    const input = screen.getByLabelText('time');
    fireEvent.change(input, { target: { value: '25:00' } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('08:30');
  });

  it('opens the panel on shell click and dismisses on outside pointerdown', async () => {
    render(<TimePicker aria-label="time" />);
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByLabelText('time'));
    expect(screen.getByRole('dialog', { name: 'Choose time' })).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('seats the committed option at the 4th slot (3 above, 4 below)', () => {
    render(<TimePicker aria-label="time" defaultValue="08:30" />);
    openPanel();
    expect(columnLabels('hour')).toEqual(['05', '06', '07', '08', '09', '10', '11', '12']);
    expect(columnLabels('minute')).toEqual(['27', '28', '29', '30', '31', '32', '33', '34']);
    // the committed options wear the selection and the keyboard cursor
    const hourBox = screen.getByRole('listbox', { name: 'Hours' });
    expect(within(hourBox).getByRole('option', { name: '08' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(within(hourBox).getByRole('option', { name: '08' })).toHaveAttribute('tabindex', '0');
  });

  it('anchors the empty value at the system clock', () => {
    render(<TimePicker aria-label="time" />);
    const now = new Date();
    openPanel();
    expect(columnLabels('hour')).toEqual(
      Array.from({ length: 8 }, (_, index) => {
        const value = now.getHours() - 3 + index;
        return String(((value % 24) + 24) % 24).padStart(2, '0');
      }),
    );
  });

  it('scrolls a column by the 7-option step per chevron click', () => {
    render(<TimePicker aria-label="time" defaultValue="08:30" />);
    openPanel();
    expect(columnLabels('hour')).toEqual(['05', '06', '07', '08', '09', '10', '11', '12']);
    fireEvent.click(screen.getByRole('button', { name: 'Next hours' }));
    expect(columnLabels('hour')).toEqual(['12', '13', '14', '15', '16', '17', '18', '19']);
    fireEvent.click(screen.getByRole('button', { name: 'Previous hours' }));
    expect(columnLabels('hour')).toEqual(['05', '06', '07', '08', '09', '10', '11', '12']);
  });

  it('cycles the column windows across the wrap edges', () => {
    render(<TimePicker aria-label="time" defaultValue="23:30" />);
    openPanel();
    // anchor 20 → window 20..27 renders mod 24 with the wrap inside
    expect(columnLabels('hour')).toEqual(['20', '21', '22', '23', '00', '01', '02', '03']);
    fireEvent.click(screen.getByRole('button', { name: 'Next hours' }));
    expect(columnLabels('hour')).toEqual(['03', '04', '05', '06', '07', '08', '09', '10']);
  });

  it('merges a picked option into the value, commits and closes', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="time" defaultValue="08:30" onChange={onChange} />);
    openPanel();
    // the opening window seats 08 at slot 3 (05..12) — step once to bring 14 in
    fireEvent.click(screen.getByRole('button', { name: 'Next hours' }));
    const hourBox = screen.getByRole('listbox', { name: 'Hours' });
    fireEvent.click(within(hourBox).getByRole('option', { name: '14' }));
    expect(onChange.mock.calls[0][0].value).toBe('14:30');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('picks a minute against the empty value as 00:xx', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="time" onChange={onChange} />);
    openPanel();
    const minuteBox = screen.getByRole('listbox', { name: 'Minutes' });
    // the empty window seats the system clock — step the 7-option window
    // until 45 falls inside (10 overlapping windows cover the 60-cycle)
    const nextMinutes = screen.getByRole('button', { name: 'Next minutes' });
    for (let clicks = 0; within(minuteBox).queryByRole('option', { name: '45' }) === null;) {
      fireEvent.click(nextMinutes);
      clicks += 1;
      expect(clicks).toBeLessThanOrEqual(9);
    }
    fireEvent.click(within(minuteBox).getByRole('option', { name: '45' }));
    expect(onChange.mock.calls[0][0].value).toBe('00:45');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders typed commits in the valueFormat verbatim and normalizes on blur', () => {
    render(<TimePicker aria-label="time" valueFormat="H.mm" />);
    const input = screen.getByLabelText('time');
    fireEvent.change(input, { target: { value: '8.30' } });
    expect(input).toHaveValue('8.30');
    fireEvent.blur(input);
    expect(input).toHaveValue('8.30');
  });

  it('disables out-of-bounds options and rolls a typed word back', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="time" min="14:00" max="18:30" onChange={onChange} />);
    openPanel();
    const hourBox = screen.getByRole('listbox', { name: 'Hours' });
    expect(within(hourBox).getByRole('option', { name: '13' })).toBeDisabled();
    // bounds compare fixed-width canonicals — word 12:00 < min and 19:00 > max
    const input = screen.getByLabelText('time');
    fireEvent.change(input, { target: { value: '13:00' } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(input).toHaveValue('');
  });

  it('disables an hour option whose merge falls out of bounds', () => {
    render(<TimePicker aria-label="time" min="14:50" defaultValue="15:30" />);
    openPanel();
    const hourBox = screen.getByRole('listbox', { name: 'Hours' });
    // 14:30 (the merge against the committed minute 30) sits below min
    // — disabled; 15:30 is in range.
    expect(within(hourBox).getByRole('option', { name: '14' })).toBeDisabled();
    expect(within(hourBox).getByRole('option', { name: '15' })).toBeEnabled();
  });

  it('clearable swaps in the clear control and commits null', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="time" defaultValue="08:30" clearable onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear time' }));
    expect(onChange.mock.calls[0][0].value).toBeNull();
  });

  it('opens via ArrowDown and commits via the option Enter path', () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="time" defaultValue="08:30" onChange={onChange} />);
    const input = screen.getByLabelText('time');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const hourBox = screen.getByRole('listbox', { name: 'Hours' });
    // the cursor moves one step without a window shift
    fireEvent.keyDown(within(hourBox).getByRole('option', { name: '08' }), { key: 'ArrowDown' });
    expect(within(hourBox).getByRole('option', { name: '09' })).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(within(hourBox).getByRole('option', { name: '09' }), { key: 'Enter' });
    expect(onChange.mock.calls[0][0].value).toBe('09:30');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('fires onOpenChange for controlled and internal panel state', () => {
    const onOpenChange = vi.fn();
    render(<TimePicker aria-label="time" onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByLabelText('time'));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    fireEvent.click(
      within(screen.getByRole('listbox', { name: 'Hours' })).getByRole('option', { name: '08' }),
    );
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});
