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
  render(<Select mode="multiple" options={fruitOptions} placeholder="Pick a fruit" {...props} />);

const organ = () => screen.getByRole('combobox');
const open = () => {
  fireEvent.keyDown(organ(), { key: 'ArrowDown' });
};

describe('Select multiple trigger', () => {
  it('renders a chip per selected value', () => {
    renderFruits({ value: ['apple', 'banana'] });
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByRole('combobox').tagName).toBe('INPUT');
  });

  it('shows the placeholder through the organ while empty', () => {
    renderFruits();
    expect(organ()).toHaveAttribute('placeholder', 'Pick a fruit');
  });
});

describe('Select multiple toggling', () => {
  it('appends on option click with the toggled option in the payload', () => {
    const onChange = vi.fn();
    renderFruits({ defaultValue: ['apple'], onChange });
    open();
    const option = screen.getByRole('option', { name: 'Banana' });
    fireEvent.click(option);

    expect(onChange).toHaveBeenCalledTimes(1);
    const [payload] = onChange.mock.calls[0];
    expect(payload).toMatchObject({
      value: ['apple', 'banana'],
      option: { value: 'banana', label: 'Banana' },
    });
    expect(payload.event.target).toBe(option);
    // multiple keeps the popup open after a pick
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    // The new chip proves the trigger side picked it up (the open panel
    // still shows the option row too).
    expect(screen.getByRole('button', { name: 'Remove Banana' })).toBeInTheDocument();
  });

  it('removes on clicking a selected option', () => {
    const onChange = vi.fn();
    renderFruits({ defaultValue: ['apple', 'banana'], onChange });
    open();
    fireEvent.click(screen.getByRole('option', { name: 'Apple' }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        value: ['banana'],
        option: expect.objectContaining({ value: 'apple' }),
      }),
    );
    // The panel stays open — the option row now reads unselected.
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'false');
  });

  it('ignores disabled options', () => {
    const onChange = vi.fn();
    renderFruits({ onChange });
    open();
    fireEvent.click(screen.getByRole('option', { name: 'Cherry' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps focus in the organ after a mouse pick', () => {
    renderFruits({ defaultValue: [] });
    organ().focus();
    open();
    fireEvent.click(screen.getByRole('option', { name: 'Apple' }));
    expect(organ()).toHaveFocus();
  });

  it('marks chosen options aria-selected', () => {
    renderFruits({ value: ['apple', 'date'] });
    open();
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Date' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });
});

describe('Select multiple chip removal', () => {
  it('removes through the chip remove button', () => {
    const onChange = vi.fn();
    renderFruits({ defaultValue: ['apple', 'banana'], onChange });
    fireEvent.click(screen.getByRole('button', { name: 'Remove Banana' }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        value: ['apple'],
        option: expect.objectContaining({ value: 'banana' }),
      }),
    );
    expect(screen.queryByText('Banana')).toBeNull();
  });

  it('Backspace on an empty query removes the last chip', () => {
    const onChange = vi.fn();
    renderFruits({ defaultValue: ['apple', 'banana'], onChange });
    fireEvent.keyDown(organ(), { key: 'Backspace' });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        value: ['apple'],
        option: expect.objectContaining({ value: 'banana' }),
      }),
    );
  });

  it('Backspace with a typed query edits it instead', () => {
    const onChange = vi.fn();
    renderFruits({ defaultValue: ['apple'], onChange });
    fireEvent.change(organ(), { target: { value: 'x' } });
    fireEvent.keyDown(organ(), { key: 'Backspace' });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('disables the chip remove buttons when the select is disabled', () => {
    renderFruits({ value: ['apple'], disabled: true });
    expect(screen.getByRole('button', { name: 'Remove Apple' })).toBeDisabled();
  });
});

describe('Select multiple keyboard', () => {
  it('ArrowDown opens and highlights; Enter toggles and keeps the panel open', () => {
    const onChange = vi.fn();
    renderFruits({ defaultValue: ['apple'], onChange });
    fireEvent.keyDown(organ(), { key: 'ArrowDown' });
    fireEvent.keyDown(organ(), { key: 'ArrowDown' });
    fireEvent.keyDown(organ(), { key: 'Enter' });

    expect(onChange).toHaveBeenCalledTimes(1);
    const [payload] = onChange.mock.calls[0];
    expect(payload).toMatchObject({
      value: ['apple', 'banana'],
      option: { value: 'banana', label: 'Banana' },
    });
    expect(payload.event.key).toBe('Enter');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(organ()).toHaveAttribute('aria-expanded', 'true');
  });

  it('Enter on the highlighted chosen option removes it', () => {
    const onChange = vi.fn();
    renderFruits({ defaultValue: ['apple'], onChange });
    fireEvent.keyDown(organ(), { key: 'ArrowDown' });
    fireEvent.keyDown(organ(), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: [] }));
  });

  it('Escape closes and clears the query', () => {
    renderFruits({ showSearch: true, defaultValue: ['apple'] });
    open();
    fireEvent.change(organ(), { target: { value: 'q' } });
    fireEvent.keyDown(organ(), { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(organ()).toHaveValue('');
  });
});

describe('Select multiple clearable + form channel', () => {
  it('clears every chip with one click and an empty array payload', () => {
    const onChange = vi.fn();
    renderFruits({ defaultValue: ['apple', 'banana'], clearable: true, onChange });
    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: [], option: undefined }),
    );
    expect(screen.queryByText('Apple')).toBeNull();
  });

  it('collects one hidden input per value', () => {
    const { container } = renderFruits({ name: 'fruits', value: ['apple', 'banana'] });
    const hidden = container.querySelectorAll<HTMLInputElement>('input[type="hidden"]');
    expect(hidden).toHaveLength(2);
    expect([...hidden].map((el) => el.value)).toEqual(['apple', 'banana']);
    expect([...hidden].every((el) => el.name === 'fruits')).toBe(true);
  });
});

describe('Select multiple search + shell', () => {
  it('filters options while typing (showSearch)', () => {
    renderFruits({ showSearch: true });
    open();
    fireEvent.change(organ(), { target: { value: 'dat' } });
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option', { name: 'Date' })).toBeInTheDocument();
  });

  it('opens on shell click outside the organ', () => {
    const { container } = renderFruits();
    fireEvent.click(container.querySelector('.colox-select__inner') as HTMLElement);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('renders the option check on chosen options', () => {
    renderFruits({ value: ['apple'] });
    open();
    expect(
      screen.getByRole('option', { name: 'Apple' }).querySelector('.colox-select__option-check'),
    ).not.toBeNull();
    expect(
      screen.getByRole('option', { name: 'Date' }).querySelector('.colox-select__option-check'),
    ).toBeNull();
  });
});

describe('Select multiple size + ref', () => {
  it('spreads the size tier on the shell', () => {
    renderFruits({ size: 'xs' });
    expect(organ().closest('.colox-select')).toHaveClass('colox-select--xs');
  });

  it('exposes the search organ as the focus ref in multiple mode', () => {
    const ref = createRef<HTMLInputElement | HTMLButtonElement>();
    renderFruits({ ref });
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
