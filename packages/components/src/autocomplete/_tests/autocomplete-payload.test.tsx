import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '../../input';
import { AutoComplete } from '../autocomplete';

const Friends = (
  <AutoComplete.Suggestions>
    <AutoComplete.Option value="ada" text="Ada" />
    <AutoComplete.Option value="bob" text="Bob" />
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

describe('autocomplete value cycle', () => {
  it('fires the uniform payload on typing', () => {
    const onChange = vi.fn();
    renderFriends({ onChange });
    fireEvent.change(control(), { target: { value: 'ad' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const [payload] = onChange.mock.calls[0];
    expect(payload).toHaveProperty('event');
    expect(payload.value).toBe('ad');
    expect(control()).toHaveValue('ad');
  });

  it('starts from the uncontrolled defaultValue', () => {
    renderFriends({ defaultValue: 'bob' });
    expect(control()).toHaveValue('bob');
  });

  it('fills the picked value on a row click and closes', () => {
    const onSelect = vi.fn();
    renderFriends({ onSelect });
    fireEvent.focus(control());
    fireEvent.click(screen.getByRole('option', { name: 'Ada' }));

    expect(control()).toHaveValue('ada');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    const [payload] = onSelect.mock.calls[0];
    expect(payload.value).toBe('ada');
    expect(payload.option.text).toBe('Ada');
    expect(payload).toHaveProperty('event');
  });

  it('ignores clicks on disabled rows', () => {
    render(
      <AutoComplete>
        <AutoComplete.Target>
          <Input />
        </AutoComplete.Target>
        <AutoComplete.Suggestions>
          <AutoComplete.Option value="off" text="Off" disabled />
        </AutoComplete.Suggestions>
      </AutoComplete>,
    );
    fireEvent.focus(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Off' }));
    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('stays controlled: prop value wins and edits only notify', () => {
    const onChange = vi.fn();
    const { rerender } = renderFriends({ value: 'ada', onChange });
    expect(control()).toHaveValue('ada');

    fireEvent.change(control(), { target: { value: 'bob' } });
    // The controlled host renders the prop, not the keystroke.
    expect(control()).toHaveValue('ada');
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: 'bob' }));

    rerender(
      <AutoComplete value="bob">
        <AutoComplete.Target>
          <Input />
        </AutoComplete.Target>
        {Friends}
      </AutoComplete>,
    );
    expect(control()).toHaveValue('bob');
  });

  it('chains the host handlers through the injection', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(
      <AutoComplete>
        <AutoComplete.Target>
          <Input onFocus={onFocus} onBlur={onBlur} />
        </AutoComplete.Target>
        {Friends}
      </AutoComplete>,
    );
    const host = screen.getByRole('combobox');
    fireEvent.focus(host);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.blur(host);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
