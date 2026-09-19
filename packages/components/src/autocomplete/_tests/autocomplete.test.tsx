import { createRef } from 'react';
import type { ReactNode } from 'react';
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
        <Input placeholder="Friend" />
      </AutoComplete.Target>
      {Friends}
    </AutoComplete>,
  );

const control = () => screen.getByRole('combobox') as HTMLInputElement;
const shell = () => control().closest('.colox-autocomplete') as HTMLElement;

describe('autocomplete contract', () => {
  it('renders the injected combobox host with a closed panel', () => {
    renderFriends();
    expect(control()).toHaveValue('');
    expect(control()).toHaveAttribute('placeholder', 'Friend');
    expect(control()).toHaveAttribute('role', 'combobox');
    expect(control()).toHaveAttribute('aria-expanded', 'false');
    expect(control()).toHaveAttribute('aria-autocomplete', 'list');
    expect(control()).toHaveAttribute('aria-haspopup', 'listbox');
    expect(control()).toHaveAttribute('aria-controls');
    expect(control()).not.toHaveAttribute('aria-activedescendant');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('renders nothing for the structural members', () => {
    renderFriends();
    expect(document.querySelector('.colox-autocomplete [role="combobox"]')).not.toBeNull();
    expect(screen.queryByText('Ada')).not.toBeInTheDocument();
  });

  it('forwards the ref to the anchor shell', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AutoComplete ref={ref}>
        <AutoComplete.Target>
          <Input />
        </AutoComplete.Target>
        {Friends}
      </AutoComplete>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current).toHaveClass('colox-autocomplete');
  });

  it('opens the listbox with one row per member on focus', () => {
    renderFriends();
    fireEvent.focus(control());
    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveClass('colox-autocomplete__listbox');
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(shell().contains(listbox)).not.toBe(true);
  });

  it('renders rich children over the plain text fallback', () => {
    render(
      <AutoComplete>
        <AutoComplete.Target>
          <Input />
        </AutoComplete.Target>
        <AutoComplete.Suggestions>
          <AutoComplete.Option value="plain" text="Plain" />
          <AutoComplete.Option value="rich" text="Rich fallback">
            <strong>Rich row</strong>
          </AutoComplete.Option>
        </AutoComplete.Suggestions>
      </AutoComplete>,
    );
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: 'Plain' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Rich row' })).toBeInTheDocument();
  });

  it('keeps the static host props and applies the disabled row state', () => {
    renderFriends();
    fireEvent.focus(control());
    const rows = screen.getAllByRole('option');
    expect(rows[2]).toHaveClass('colox-autocomplete__option--disabled');
    expect(rows[2]).toHaveAttribute('aria-disabled', 'true');
  });

  it('forwards the control words to the host input', () => {
    renderFriends({
      id: 'friend',
      name: 'friend',
      invalid: true,
      'aria-describedby': 'friend-hint',
      'aria-required': true,
    });
    expect(control()).toHaveAttribute('id', 'friend');
    expect(control()).toHaveAttribute('name', 'friend');
    expect(control()).toHaveAttribute('aria-invalid', 'true');
    expect(control()).toHaveAttribute('aria-describedby', 'friend-hint');
    expect(control()).toHaveAttribute('aria-required', 'true');
    // The root anchor only carries the shell: label wiring belongs to
    // the focusable control, not to the positioning div.
    expect(shell()).not.toHaveAttribute('id');
    expect(shell()).not.toHaveAttribute('aria-describedby');
  });

  it('lets the root id override the host id', () => {
    render(
      <AutoComplete id="root-id">
        <AutoComplete.Target>
          <Input id="host-id" />
        </AutoComplete.Target>
        {Friends}
      </AutoComplete>,
    );
    expect(control()).toHaveAttribute('id', 'root-id');
  });

  it('resolves disabled at the root and keeps the panel shut', () => {
    renderFriends({ disabled: true });
    expect(control()).toBeDisabled();
    fireEvent.focus(control());
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('resolves read-only at the root without disabling the control', () => {
    renderFriends({ readOnly: true });
    expect(control()).toHaveAttribute('readonly');
    expect(control()).not.toBeDisabled();
    fireEvent.focus(control());
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

describe('autocomplete tree validation', () => {
  const expectError = (tree: ReactNode, message: string) => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<>{tree}</>)).toThrow(message);
    spy.mockRestore();
  };

  it('requires exactly one Target', () => {
    expectError(
      <AutoComplete>
        <AutoComplete.Suggestions>
          <AutoComplete.Option value="a" text="A" />
        </AutoComplete.Suggestions>
      </AutoComplete>,
      'AutoComplete requires exactly one <AutoComplete.Target>.',
    );
  });

  it('rejects a second Target', () => {
    expectError(
      <AutoComplete>
        <AutoComplete.Target>
          <Input />
        </AutoComplete.Target>
        <AutoComplete.Target>
          <Input />
        </AutoComplete.Target>
        {Friends}
      </AutoComplete>,
      'AutoComplete accepts exactly one <AutoComplete.Target>.',
    );
  });

  it('rejects a host-element Target child', () => {
    expectError(
      <AutoComplete>
        <AutoComplete.Target>
          <input />
        </AutoComplete.Target>
        {Friends}
      </AutoComplete>,
      '<AutoComplete.Target> child must be a component (function/class), not a host element or a fragment.',
    );
  });

  it('rejects a fragment Target child', () => {
    expectError(
      <AutoComplete>
        <AutoComplete.Target>
          <>
            <Input />
          </>
        </AutoComplete.Target>
        {Friends}
      </AutoComplete>,
      '<AutoComplete.Target> child must be a component (function/class), not a host element or a fragment.',
    );
  });

  it('rejects a Target without exactly one child', () => {
    expectError(
      <AutoComplete>
        <AutoComplete.Target>
          <Input />
          <Input />
        </AutoComplete.Target>
        {Friends}
      </AutoComplete>,
      '<AutoComplete.Target> requires exactly one component child.',
    );
  });

  it('rejects a second Suggestions region', () => {
    expectError(
      <AutoComplete>
        <AutoComplete.Target>
          <Input />
        </AutoComplete.Target>
        {Friends}
        {Friends}
      </AutoComplete>,
      'AutoComplete accepts at most one <AutoComplete.Suggestions>.',
    );
  });

  it('rejects Option members outside Suggestions', () => {
    expectError(
      <AutoComplete>
        <AutoComplete.Target>
          <Input />
        </AutoComplete.Target>
        <AutoComplete.Option value="a" text="A" />
      </AutoComplete>,
      '<AutoComplete.Option> members must live inside <AutoComplete.Suggestions>.',
    );
  });

  it('walks fragment members and pass-through wrappers', () => {
    const Wrapped = ({ children }: { children: ReactNode }) => <div>{children}</div>;
    render(
      <AutoComplete>
        <AutoComplete.Target>
          <Input />
        </AutoComplete.Target>
        <AutoComplete.Suggestions>
          <>
            <AutoComplete.Option value="a" text="A" />
          </>
          <Wrapped>
            <AutoComplete.Option value="b" text="B" />
          </Wrapped>
        </AutoComplete.Suggestions>
      </AutoComplete>,
    );
    fireEvent.focus(screen.getByRole('combobox'));
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });
});
