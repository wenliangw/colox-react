import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '../../input';
import { AutoComplete } from '../autocomplete';

const Friends = (
  <AutoComplete.Suggestions>
    <AutoComplete.Option value="ada" text="Ada" />
    <AutoComplete.Option value="bob" text="Bob" />
    <AutoComplete.Option value="cleo" text="Cleo" disabled />
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

// fireEvent.focus only dispatches the event — it never moves the real
// DOM focus in jsdom. Real focus comes from the imperative call; the
// dispatched event drives the React open handler.
const focusControl = () => {
  const target = control();
  target.focus();
  fireEvent.focus(target);
};

describe('autocomplete open policy', () => {
  it('opens the full list on focus and closes on blur', () => {
    renderFriends();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    fireEvent.focus(control());
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
    fireEvent.blur(control());
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('opens on a typing match while closed and closes on zero matches', () => {
    renderFriends();
    fireEvent.change(control(), { target: { value: 'ad' } });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(1);
    fireEvent.change(control(), { target: { value: 'zzz' } });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes on Escape and keeps focus in the host', () => {
    renderFriends();
    focusControl();
    fireEvent.keyDown(control(), { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(control()).toHaveFocus();
  });

  it('notifies onOpenChange for the auto policy', () => {
    const onOpenChange = vi.fn();
    renderFriends({ onOpenChange });
    fireEvent.focus(control());
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    fireEvent.blur(control());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('honours the controlled open prop', () => {
    const { rerender } = renderFriends({ open: true });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    rerender(
      <AutoComplete open={false}>
        <AutoComplete.Target>
          <Input />
        </AutoComplete.Target>
        {Friends}
      </AutoComplete>,
    );
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('suppresses the popup for a disabled host', () => {
    render(
      <AutoComplete>
        <AutoComplete.Target>
          <Input disabled />
        </AutoComplete.Target>
        {Friends}
      </AutoComplete>,
    );
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('suppresses the popup for a readOnly host', () => {
    render(
      <AutoComplete>
        <AutoComplete.Target>
          <Input readOnly />
        </AutoComplete.Target>
        {Friends}
      </AutoComplete>,
    );
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('never opens without members', () => {
    render(
      <AutoComplete>
        <AutoComplete.Target>
          <Input />
        </AutoComplete.Target>
        <AutoComplete.Suggestions />
      </AutoComplete>,
    );
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('stays open on edits inside the panel interaction window', () => {
    // Row mousedown is barred, so a row click never blurs the host.
    renderFriends();
    focusControl();
    const row = screen.getByRole('option', { name: 'Ada' });
    fireEvent.mouseDown(row);
    expect(control()).toHaveFocus();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});
