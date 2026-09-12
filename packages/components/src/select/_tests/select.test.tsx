import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Select } from '../select';
import type { SelectOption } from '../types';

const fruitOptions: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
  { value: 'date', label: 'Date' },
];

const renderFruits = (props: object = {}) =>
  render(<Select options={fruitOptions} placeholder="Pick a fruit" {...props} />);

describe('Select size', () => {
  it.each([
    ['xs', 'colox-select--xs'],
    ['sm', 'colox-select--sm'],
    ['md', 'colox-select--md'],
    ['lg', 'colox-select--lg'],
  ] as const)('applies %s on the root shell', (size, expectedClass) => {
    renderFruits({ size });
    expect(screen.getByRole('combobox').closest('.colox-select')).toHaveClass(expectedClass);
  });

  it('defaults to md', () => {
    renderFruits();
    expect(screen.getByRole('combobox').closest('.colox-select')).toHaveClass('colox-select--md');
  });
});

describe('Select trigger', () => {
  it('shows the placeholder while unselected', () => {
    renderFruits();
    expect(screen.getByRole('combobox', { name: 'Pick a fruit' })).toBeInTheDocument();
  });

  it('shows the selected option label', () => {
    renderFruits({ value: 'banana' });
    expect(screen.getByRole('combobox', { name: 'Banana' })).toBeInTheDocument();
  });

  it('shows the raw value when it is not in the option list', () => {
    renderFruits({ value: 'lychee' });
    expect(screen.getByRole('combobox', { name: 'lychee' })).toBeInTheDocument();
  });

  it('applies the shell className and spreads rest props to the shell', () => {
    const { container } = renderFruits({ className: 'picky', 'data-testid': 'fruit-select' });
    const shell = screen.getByTestId('fruit-select');
    expect(shell).toHaveClass('colox-select', 'picky');
    expect(container.querySelector('.colox-select__control')).toBeNull();
  });
});

describe('Select open/close', () => {
  it('opens on trigger click with panel aria wiring', () => {
    renderFruits();
    fireEvent.click(screen.getByRole('combobox'));
    const listbox = screen.getByRole('listbox');
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('aria-expanded', 'true');
    expect(combobox).toHaveAttribute('aria-controls', listbox.id);
  });

  it('opens on ArrowDown and highlights the first enabled option', () => {
    renderFruits();
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    // Initial highlight: current single in focus — reopening starts on
    // the selected option; unselected starts at the first enabled one.
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveClass(
      'colox-select__option--active',
    );
  });

  it('closes on Escape', () => {
    renderFruits();
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on outside pointerdown but not on inside panel clicks', () => {
    renderFruits();
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.pointerDown(screen.getByRole('option', { name: 'Apple' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('fires onOpenChange on open and close', () => {
    const onOpenChange = vi.fn();
    renderFruits({ onOpenChange });
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('stays closed under controlled open=false', () => {
    renderFruits({ open: false });
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('renders open under controlled open=true', () => {
    renderFruits({ open: true });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});

describe('Select keyboard navigation', () => {
  it('walks with ArrowDown/Up, wraps around and skips disabled options', () => {
    renderFruits();
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    const apple = screen.getByRole('option', { name: 'Apple' });
    expect(combobox).toHaveAttribute('aria-activedescendant', apple.id);

    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    const banana = screen.getByRole('option', { name: 'Banana' });
    expect(combobox).toHaveAttribute('aria-activedescendant', banana.id);

    // cherry is disabled — the walk skips it
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    expect(combobox).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Date' }).id,
    );

    // wrap from the last enabled option back to the first
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    expect(combobox).toHaveAttribute('aria-activedescendant', apple.id);

    // wrap backwards to the last
    fireEvent.keyDown(combobox, { key: 'ArrowUp' });
    expect(combobox).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Date' }).id,
    );
  });

  it('jumps with Home/End', () => {
    renderFruits();
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    fireEvent.keyDown(combobox, { key: 'End' });
    expect(combobox).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Date' }).id,
    );
    fireEvent.keyDown(combobox, { key: 'Home' });
    expect(combobox).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Apple' }).id,
    );
  });

  it('Activating Enter selects the highlighted option and closes with the right payload', () => {
    const onChange = vi.fn();
    renderFruits({ onChange });
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    fireEvent.keyDown(combobox, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledTimes(1);
    const [payload] = onChange.mock.calls[0];
    expect(payload).toMatchObject({
      value: 'banana',
      option: { value: 'banana', label: 'Banana' },
    });
    // React synthesizes the native keydown — carry the key through.
    expect(payload.event.key).toBe('Enter');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.getByRole('combobox', { name: 'Banana' })).toBeInTheDocument();
  });

  it('Enter with no active option does not fire onChange', () => {
    const onChange = vi.fn();
    renderFruits({ onChange });
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'Enter' }); // opens only
    fireEvent.keyDown(combobox, { key: 'Enter' }); // nothing highlighted
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('Select mouse selection', () => {
  it('selects on option click with the option in the payload', () => {
    const onChange = vi.fn();
    renderFruits({ onChange });
    fireEvent.click(screen.getByRole('combobox'));
    const option = screen.getByRole('option', { name: 'Banana' });
    fireEvent.click(option);

    expect(onChange).toHaveBeenCalledTimes(1);
    const [payload] = onChange.mock.calls[0];
    expect(payload).toMatchObject({
      value: 'banana',
      option: { value: 'banana', label: 'Banana' },
    });
    expect(payload.event.target).toBe(option);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('ignores clicks on disabled options', () => {
    const onChange = vi.fn();
    renderFruits({ onChange });
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Cherry' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('still fires onChange when re-picking the same single value', () => {
    const onChange = vi.fn();
    renderFruits({ onChange, defaultValue: 'banana' });
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Banana' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toMatchObject({ value: 'banana' });
  });

  it('uncontrolled defaultValue runs without external control', () => {
    renderFruits({ defaultValue: 'banana' });
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Apple' }));
    expect(screen.getByRole('combobox', { name: 'Apple' })).toBeInTheDocument();
  });

  it('keeps the controlled value untouched (onChange reports, the prop decides)', () => {
    const onChange = vi.fn();
    renderFruits({ value: 'banana', onChange });
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Apple' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 'apple' }));
    expect(screen.getByRole('combobox', { name: 'Banana' })).toBeInTheDocument();
  });
});

describe('Select clearable', () => {
  it('shows the clear button with a selection and paddle-free clicks clear it', () => {
    const onChange = vi.fn();
    renderFruits({ defaultValue: 'banana', clearable: true, onChange });
    const clear = screen.getByRole('button', { name: 'Clear selection' });
    fireEvent.click(clear);

    const [payload] = onChange.mock.calls[0];
    expect(payload).toMatchObject({ value: '', option: undefined });
    expect(payload.event.target).toBe(clear);
    expect(screen.getByRole('combobox', { name: 'Pick a fruit' })).toBeInTheDocument();
  });

  it('is hidden while the selection is empty', () => {
    renderFruits({ clearable: true });
    expect(screen.queryByRole('button', { name: 'Clear selection' })).toBeNull();
  });
});

describe('Select form channel', () => {
  it('collects the selection through a hidden native input', () => {
    const { container } = renderFruits({ name: 'fruit', value: 'banana' });
    const hidden = container.querySelector<HTMLInputElement>('input[type="hidden"]');
    expect(hidden).not.toBeNull();
    expect(hidden?.name).toBe('fruit');
    expect(hidden?.value).toBe('banana');
  });

  it('renders no hidden input without a name', () => {
    const { container } = renderFruits();
    expect(container.querySelector('input[type="hidden"]')).toBeNull();
  });
});

describe('Select states', () => {
  it('disables the trigger and panel markup', () => {
    renderFruits({ disabled: true });
    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeDisabled();
    fireEvent.click(combobox);
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(combobox.closest('.colox-select')).toHaveClass('colox-select--disabled');
  });

  it('marks the shell invalid and puts aria-invalid on the organ', () => {
    renderFruits({ invalid: true });
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('aria-invalid', 'true');
    expect(combobox.closest('.colox-select')).toHaveClass('colox-select--invalid');
  });
});

describe('Select search (single)', () => {
  it('embeds the input organ and filters options on typing', () => {
    const onSearch = vi.fn();
    renderFruits({ showSearch: true, onSearch });
    const organ = screen.getByRole('combobox');
    expect(organ.tagName).toBe('INPUT');

    fireEvent.click(organ);
    fireEvent.change(organ, { target: { value: 'ban' } });
    expect(onSearch).toHaveBeenCalledWith('ban');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
  });

  it('matches the default filter over label and value', () => {
    const { unmount } = renderFruits({ showSearch: true });
    const organ = screen.getByRole('combobox');
    fireEvent.click(organ);
    // value match: 'cher'.includes? cherry is disabled but still listed
    fireEvent.change(organ, { target: { value: 'cherry' } });
    expect(screen.getByRole('option', { name: 'Cherry' })).toBeInTheDocument();
    unmount();

    render(
      <Select
        showSearch
        options={[
          { value: 'release-2', label: 'Two' },
          { value: 'release-3', label: 'Three' },
        ]}
        placeholder="Pick"
      />,
    );
    const secondOrgan = screen.getByRole('combobox');
    fireEvent.click(secondOrgan);
    fireEvent.change(secondOrgan, { target: { value: '2' } });
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option', { name: 'Two' })).toBeInTheDocument();
  });

  it('uses the custom filterOption', () => {
    renderFruits({
      showSearch: true,
      filterOption: (query: string, option: SelectOption) => option.value.endsWith(query),
    });
    const organ = screen.getByRole('combobox');
    fireEvent.click(organ);
    fireEvent.change(organ, { target: { value: 'na' } });
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
  });

  it('renders the optionRender into the panel row and the raw label into the trigger', () => {
    renderFruits({
      showSearch: true,
      optionRender: (option: SelectOption) => <strong>{`🍏 ${String(option.label)}`}</strong>,
      value: 'banana',
    });
    // Closed: the organ carries the selected label (display text).
    expect(screen.getByRole('combobox')).toHaveValue('Banana');
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText('🍏 Banana')).toBeInTheDocument();
    // Open: the organ flips to the (empty) query stream.
    expect(screen.getByRole('combobox')).toHaveValue('');
  });

  it('interrupts the trigger label with the query only while open', () => {
    renderFruits({ showSearch: true, value: 'banana' });
    const organ = screen.getByRole('combobox');
    // Closed: the organ carries the selected label.
    expect(organ).toHaveValue('Banana');
    fireEvent.click(organ);
    // Open + untouched: the query stream takes over (empty until typed).
    expect(organ).toHaveValue('');
    fireEvent.change(organ, { target: { value: 'ap' } });
    expect(organ).toHaveValue('ap');
    // Filtered down to Apple: highlight then activate (V1 has no
    // typeahead — Enter acts on the highlighted option only).
    fireEvent.keyDown(organ, { key: 'ArrowDown' });
    fireEvent.keyDown(organ, { key: 'Enter' });
    expect(organ).toHaveAttribute('aria-expanded', 'false');
    // The controlled value stays 'banana' — the label returns.
    expect(organ).toHaveValue('Banana');
  });
});

describe('Select popup presentation', () => {
  it('renders the empty state when no options match', () => {
    renderFruits({ showSearch: true });
    const organ = screen.getByRole('combobox');
    fireEvent.click(organ);
    fireEvent.change(organ, { target: { value: 'zzz' } });
    expect(screen.getByText('No options')).toBeInTheDocument();
  });

  it('applies the optionSize tier to the listbox and defaults to md', () => {
    const { unmount } = renderFruits({ optionSize: 'lg' });
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toHaveClass('colox-select__listbox--lg');
    unmount();
    renderFruits();
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toHaveClass('colox-select__listbox--md');
  });
});

describe('Select refs', () => {
  it('exposes the trigger button in plain single mode', () => {
    const ref = createRef<HTMLInputElement | HTMLButtonElement>();
    renderFruits({ ref });
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('exposes the search organ in searchable single mode', () => {
    const ref = createRef<HTMLInputElement | HTMLButtonElement>();
    renderFruits({ showSearch: true, ref });
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
