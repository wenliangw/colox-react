import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '../../input';
import { AutoComplete } from '../autocomplete';

const Friends = (
  <AutoComplete.Suggestions>
    <AutoComplete.Option value="ada" text="Ada" />
    <AutoComplete.Option value="bob" text="Bob" />
    <AutoComplete.Option value="cleo" text="Cleo" disabled />
    <AutoComplete.Option value="dora" text="Dora" />
  </AutoComplete.Suggestions>
);

const renderFriends = (props: object = {}) =>
  render(
    <AutoComplete {...props}>
      <AutoComplete.Target>
        <Input />
      </AutoComplete.Target>
      {Friends}
    </AutoComplete>,
  );

const control = () => screen.getByRole('combobox') as HTMLInputElement;

const activeRow = () =>
  screen
    .getAllByRole('option')
    .find((row) => row.classList.contains('colox-autocomplete__option--active'));

const rowText = (row: HTMLElement | undefined) => row?.textContent;

describe('autocomplete keyboard', () => {
  it('opens on ArrowDown and highlights the first eligible row', () => {
    renderFriends();
    fireEvent.keyDown(control(), { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(rowText(activeRow())).toBe('Ada');
    expect(control()).toHaveAttribute('aria-expanded', 'true');
    expect(control()).toHaveAttribute('aria-activedescendant');
  });

  it('walks with arrows and wraps past the end', () => {
    renderFriends();
    fireEvent.keyDown(control(), { key: 'ArrowDown' });
    fireEvent.keyDown(control(), { key: 'ArrowDown' });
    expect(rowText(activeRow())).toBe('Bob');
    fireEvent.keyDown(control(), { key: 'ArrowDown' });
    fireEvent.keyDown(control(), { key: 'ArrowDown' });
    expect(rowText(activeRow())).toBe('Ada');
  });

  it('skips disabled rows in both directions', () => {
    renderFriends();
    fireEvent.keyDown(control(), { key: 'ArrowDown' });
    fireEvent.keyDown(control(), { key: 'ArrowDown' });
    expect(rowText(activeRow())).toBe('Bob');
    fireEvent.keyDown(control(), { key: 'ArrowDown' });
    expect(rowText(activeRow())).toBe('Dora');
    fireEvent.keyDown(control(), { key: 'ArrowUp' });
    expect(rowText(activeRow())).toBe('Bob');
  });

  it('starts from the last row on ArrowUp from a closed control', () => {
    renderFriends();
    fireEvent.keyDown(control(), { key: 'ArrowUp' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(rowText(activeRow())).toBe('Dora');
  });

  it('jumps with Home and End while open', () => {
    renderFriends();
    fireEvent.keyDown(control(), { key: 'ArrowDown' });
    fireEvent.keyDown(control(), { key: 'End' });
    expect(rowText(activeRow())).toBe('Dora');
    fireEvent.keyDown(control(), { key: 'Home' });
    expect(rowText(activeRow())).toBe('Ada');
  });

  it('picks the active row on Enter and closes', () => {
    const onSelect = vi.fn();
    const onChange = vi.fn();
    renderFriends({ onSelect, onChange });
    fireEvent.keyDown(control(), { key: 'ArrowDown' });
    fireEvent.keyDown(control(), { key: 'ArrowDown' });
    fireEvent.keyDown(control(), { key: 'Enter' });

    expect(control()).toHaveValue('bob');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    expect(onSelect).toHaveBeenCalledTimes(1);
    const [selectPayload] = onSelect.mock.calls[0];
    expect(selectPayload.value).toBe('bob');
    expect(selectPayload.option.text).toBe('Bob');

    expect(onChange).toHaveBeenCalledTimes(1);
    const [changePayload] = onChange.mock.calls[0];
    expect(changePayload.value).toBe('bob');
  });

  it('only opens on Enter when closed without picking anything', () => {
    renderFriends();
    fireEvent.keyDown(control(), { key: 'Enter' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(control()).toHaveValue('');
    expect(activeRow()).toBeUndefined();
  });

  it('lets Space type through an input host', () => {
    renderFriends();
    fireEvent.keyDown(control(), { key: ' ' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('resets the cursor to the first match while typing open', () => {
    renderFriends();
    fireEvent.focus(control());
    fireEvent.keyDown(control(), { key: 'ArrowDown' });
    fireEvent.keyDown(control(), { key: 'ArrowDown' });
    expect(rowText(activeRow())).toBe('Bob');
    fireEvent.change(control(), { target: { value: 'or' } });
    expect(rowText(activeRow())).toBe('Dora');
  });
});
