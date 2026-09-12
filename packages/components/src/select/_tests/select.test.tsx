import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Select } from '../select';
import type { SelectOptionRecord } from '../types';

// A fragment member block: the compiler walks fragments, arrays and
// pass-through wrappers (the member leaf never renders itself).
const FruitOptions = (
  <>
    <Select.Option value="apple" text="Apple" />
    <Select.Option value="banana" text="Banana" />
    <Select.Option value="cherry" text="Cherry" disabled />
    <Select.Option value="date" text="Date" />
  </>
);

// A pass-through wrapper keeps members structurally reachable. A
// component that creates members internally is not visible — the
// members would only exist after render (same boundary as rc-select).
const PassthroughOptions = ({ children }: { children: React.ReactNode }) => (
  <div className="member-wrapper">{children}</div>
);

const renderFruits = (props: object = {}) =>
  render(
    <Select placeholder="Pick a fruit" {...props}>
      {FruitOptions}
    </Select>,
  );

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

  it('inherits the parent size on the option rows', () => {
    renderFruits({ size: 'lg' });
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveClass('colox-select__option--lg');
  });

  it('lets a member override its own row tier', () => {
    render(
      <Select placeholder="Pick a fruit" size="lg">
        <Select.Option value="apple" text="Apple" size="xs" />
        <Select.Option value="banana" text="Banana" />
      </Select>,
    );
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveClass('colox-select__option--xs');
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveClass('colox-select__option--lg');
  });
});

describe('Select trigger', () => {
  it('shows the placeholder while unselected', () => {
    renderFruits();
    expect(screen.getByRole('combobox', { name: 'Pick a fruit' })).toBeInTheDocument();
  });

  it('shows the selected option text', () => {
    renderFruits({ value: 'banana' });
    expect(screen.getByRole('combobox', { name: 'Banana' })).toBeInTheDocument();
  });

  it('shows the raw value when it is not in the member list', () => {
    renderFruits({ value: 'lychee' });
    expect(screen.getByRole('combobox', { name: 'lychee' })).toBeInTheDocument();
  });

  it('applies the shell className and spreads rest props to the shell', () => {
    const { container } = renderFruits({ className: 'picky', 'data-testid': 'fruit-select' });
    const shell = screen.getByTestId('fruit-select');
    expect(shell).toHaveClass('colox-select', 'picky');
    expect(container.querySelector('.colox-select__control')).not.toBeNull();
    expect(container.querySelector('.colox-select__combobox')).toBeNull();
  });

  it('renders the member text as the default row content', () => {
    renderFruits();
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveTextContent('Apple');
  });

  it('finds members through pass-through component wrappers', () => {
    render(
      <Select placeholder="Pick a fruit">
        <PassthroughOptions>
          <Select.Option value="apple" text="Apple" />
          <Select.Option value="banana" text="Banana" />
        </PassthroughOptions>
      </Select>,
    );
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();
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
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Apple' }).id,
    );
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

  it('stays closed while open is controlled to false', () => {
    const onOpenChange = vi.fn();
    renderFruits({ open: false, onOpenChange });
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('renders open while open is controlled to true', () => {
    renderFruits({ open: true });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens initially with defaultOpen', () => {
    renderFruits({ defaultOpen: true });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  });

  it('fires onOpenChange on open and close', () => {
    const onOpenChange = vi.fn();
    renderFruits({ onOpenChange });
    fireEvent.click(screen.getByRole('combobox'));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});

describe('Select keyboard', () => {
  it('walks with ArrowDown and wraps', () => {
    renderFruits();
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    // apple → banana → (cherry disabled, skipped) → date
    expect(screen.getByRole('option', { name: 'Date' })).toHaveClass(
      'colox-select__option--active',
    );
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveClass(
      'colox-select__option--active',
    );
  });

  it('ArrowUp from nothing goes to the last enabled option', () => {
    renderFruits();
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'ArrowUp' });
    expect(screen.getByRole('option', { name: 'Date' })).toHaveClass(
      'colox-select__option--active',
    );
  });

  it('jumps with Home and End', () => {
    renderFruits();
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    fireEvent.keyDown(combobox, { key: 'End' });
    expect(screen.getByRole('option', { name: 'Date' })).toHaveClass(
      'colox-select__option--active',
    );
    fireEvent.keyDown(combobox, { key: 'Home' });
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveClass(
      'colox-select__option--active',
    );
  });

  it('Enter activates the highlighted option with the compiled record', () => {
    const onChange = vi.fn();
    renderFruits({ onChange });
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    fireEvent.keyDown(combobox, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledTimes(1);
    const [payload] = onChange.mock.calls[0];
    expect(payload).toMatchObject({
      value: 'apple',
      option: { value: 'apple', text: 'Apple', disabled: false },
    });
    // React synthesizes the native keydown — carry the key through.
    expect(payload.event.key).toBe('Enter');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.getByRole('combobox', { name: 'Apple' })).toBeInTheDocument();
  });

  it('does nothing on Enter without an active option', () => {
    const onChange = vi.fn();
    renderFruits({ onChange });
    const combobox = screen.getByRole('combobox');
    // Click opens at the initial highlight: nothing selected → -1.
    fireEvent.click(combobox);
    fireEvent.keyDown(combobox, { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('re-fires onChange when re-picking the current value', () => {
    const onChange = vi.fn();
    renderFruits({ value: 'apple', onChange });
    fireEvent.click(screen.getByRole('combobox'));
    // Clicking open starts at the selected option; re-pick it.
    fireEvent.click(screen.getByRole('option', { name: 'Apple' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 'apple' }));
  });

  it('reopening starts at the selected option', () => {
    renderFruits({ value: 'banana' });
    const combobox = screen.getByRole('combobox');
    // Click open lands the highlight on the selection itself.
    fireEvent.click(combobox);
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveClass(
      'colox-select__option--active',
    );
    // One press moves ONCE to the next enabled option — the walk does
    // not restart from the top.
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: 'Date' })).toHaveClass(
      'colox-select__option--active',
    );
  });
});

describe('Select search', () => {
  it('shows the selected text while closed and the query stream while open', () => {
    renderFruits({ showSearch: true, value: 'banana' });
    const control = screen.getByRole('combobox');
    expect(control).toHaveValue('Banana');
    fireEvent.click(control);
    expect(control).toHaveValue('');
    fireEvent.change(control, { target: { value: 'ap' } });
    expect(control).toHaveValue('ap');
  });

  it('filters over the member text by default', () => {
    renderFruits({ showSearch: true });
    const control = screen.getByRole('combobox');
    fireEvent.click(control);
    fireEvent.change(control, { target: { value: 'an' } });
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Apple' })).toBeNull();
    expect(screen.queryByRole('option', { name: 'Cherry' })).toBeNull();
    expect(screen.queryByRole('option', { name: 'Date' })).toBeNull();
  });

  it('accepts a custom filterOption over compiled records', () => {
    renderFruits({
      showSearch: true,
      filterOption: (query: string, option: SelectOptionRecord) =>
        option.text.toLowerCase().startsWith(query.toLowerCase()),
    });
    const control = screen.getByRole('combobox');
    fireEvent.click(control);
    fireEvent.change(control, { target: { value: 'ch' } });
    expect(screen.getByRole('option', { name: 'Cherry' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Apple' })).toBeNull();
  });

  it('streams the raw query through onSearch', () => {
    const onSearch = vi.fn();
    renderFruits({ showSearch: true, onSearch });
    const control = screen.getByRole('combobox');
    fireEvent.click(control);
    fireEvent.change(control, { target: { value: 'na' } });
    expect(onSearch).toHaveBeenCalledWith('na');
  });

  it('renders member children as the rich row and keeps text as the reachable name', () => {
    render(
      <Select placeholder="Pick a fruit" showSearch value="apple">
        <Select.Option value="apple" text="Apple">
          <strong>🍏 Apple</strong>
        </Select.Option>
        <Select.Option value="banana" text="Banana" />
      </Select>,
    );
    const control = screen.getByRole('combobox');
    // Closed: the text surface carries the label.
    expect(control).toHaveValue('Apple');
    fireEvent.click(control);
    expect(screen.getByText('🍏 Apple')).toBeInTheDocument();
    // The row stays findable by its text even under the rich render.
    expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();
    // Open: the query stream takes over.
    expect(control).toHaveValue('');
  });

  it('interrupts the closed text with the query only while open', () => {
    renderFruits({ showSearch: true, value: 'banana' });
    const control = screen.getByRole('combobox');
    expect(control).toHaveValue('Banana');
    fireEvent.click(control);
    expect(control).toHaveValue('');
    fireEvent.change(control, { target: { value: 'ap' } });
    expect(control).toHaveValue('ap');
    // Filtered down to Apple: highlight then activate. The controlled
    // value stays 'banana' — the selected text returns when closed.
    fireEvent.keyDown(control, { key: 'ArrowDown' });
    fireEvent.keyDown(control, { key: 'Enter' });
    expect(control).toHaveAttribute('aria-expanded', 'false');
    expect(control).toHaveValue('Banana');
  });

  it('shows the empty state when nothing matches', () => {
    renderFruits({ showSearch: true });
    const control = screen.getByRole('combobox');
    fireEvent.click(control);
    fireEvent.change(control, { target: { value: 'zzz' } });
    expect(screen.getByText('No options')).toBeInTheDocument();
    expect(screen.queryByRole('option')).toBeNull();
  });
});

describe('Select choosing', () => {
  it('selects on option click with the compiled record in the payload', () => {
    const onChange = vi.fn();
    renderFruits({ onChange });
    fireEvent.click(screen.getByRole('combobox'));
    const option = screen.getByRole('option', { name: 'Banana' });
    fireEvent.click(option);

    expect(onChange).toHaveBeenCalledTimes(1);
    const [payload] = onChange.mock.calls[0];
    expect(payload).toMatchObject({
      value: 'banana',
      option: { value: 'banana', text: 'Banana', disabled: false },
    });
    expect(payload.event.target).toBe(option);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('ignores disabled members', () => {
    const onChange = vi.fn();
    renderFruits({ onChange });
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Cherry' }));
    expect(onChange).not.toHaveBeenCalled();
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

describe('Select clearing', () => {
  it('clears to the mode empty shape with an empty option', () => {
    const onChange = vi.fn();
    renderFruits({ defaultValue: 'banana', clearable: true, onChange });
    const clear = screen.getByRole('button', { name: 'Clear selection' });
    fireEvent.click(clear);

    expect(onChange).toHaveBeenCalledTimes(1);
    const [payload] = onChange.mock.calls[0];
    expect(payload).toMatchObject({ value: '', option: undefined });
    expect(payload.event.target).toBe(clear);
    // The selection left, so the clear control leaves with it.
    expect(screen.queryByRole('button', { name: 'Clear selection' })).toBeNull();
    expect(screen.getByRole('combobox', { name: 'Pick a fruit' })).toBeInTheDocument();
  });

  it('is hidden while the selection is empty', () => {
    renderFruits({ clearable: true });
    expect(screen.queryByRole('button', { name: 'Clear selection' })).toBeNull();
  });
});

describe('Select form collection', () => {
  it('mounts one hidden input per selection channel without name', () => {
    const { container } = renderFruits();
    expect(container.querySelectorAll('input[type="hidden"]')).toHaveLength(0);
  });

  it('mounts a single hidden input carrying the value in single mode', () => {
    const { container } = renderFruits({ name: 'fruit', value: 'banana' });
    const hidden = container.querySelector<HTMLInputElement>('input[type="hidden"]');
    expect(hidden).not.toBeNull();
    expect(hidden?.name).toBe('fruit');
    expect(hidden?.value).toBe('banana');
  });

  it('routes the id to the control', () => {
    renderFruits({ id: 'pick-me' });
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'pick-me');
  });
});

describe('Select states', () => {
  it('marks the shell invalid and puts aria-invalid on the control', () => {
    renderFruits({ invalid: true });
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('combobox').closest('.colox-select')).toHaveClass(
      'colox-select--invalid',
    );
  });

  it('disables the control and keeps the panel shut', () => {
    renderFruits({ disabled: true });
    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeDisabled();
    fireEvent.click(combobox);
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(combobox.closest('.colox-select')).toHaveClass('colox-select--disabled');
  });
});

describe('Select refs', () => {
  it('exposes the trigger button in plain single mode', () => {
    const ref = createRef<HTMLInputElement | HTMLButtonElement>();
    renderFruits({ ref });
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('exposes the search control in searchable single mode', () => {
    const ref = createRef<HTMLInputElement | HTMLButtonElement>();
    renderFruits({ showSearch: true, ref });
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
