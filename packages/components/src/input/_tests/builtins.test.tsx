import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '../input';

describe('Input clearable', () => {
  it('renders a clear button only when clearable', () => {
    const { rerender } = render(<Input aria-label="Name" />);
    expect(screen.queryByRole('button', { name: 'Clear input' })).toBeNull();
    rerender(<Input aria-label="Name" clearable />);
    expect(screen.getByRole('button', { name: 'Clear input' })).toBeInTheDocument();
  });

  it('clears an uncontrolled value through onChange', () => {
    const onChange = vi.fn();
    render(<Input aria-label="Name" defaultValue="abc" clearable onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear input' }));
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('clears a controlled value through onChange', () => {
    const onChange = vi.fn();
    const Harness = () => {
      const [value, setValue] = useState('abc');
      return (
        <Input
          aria-label="Name"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setValue(event.target.value);
          }}
          clearable
        />
      );
    };
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Clear input' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('');
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('hides the clear button when disabled or readOnly', () => {
    const { rerender } = render(<Input aria-label="Name" clearable disabled />);
    expect(screen.queryByRole('button', { name: 'Clear input' })).toBeNull();
    rerender(<Input aria-label="Name" clearable readOnly />);
    expect(screen.queryByRole('button', { name: 'Clear input' })).toBeNull();
  });
});

describe('Input password toggle', () => {
  it('is opt-in: no toggle without allowTogglePassword', () => {
    render(<Input aria-label="Password" type="password" />);
    expect(screen.queryByRole('button', { name: /password/i })).toBeNull();
  });

  it('is inactive for non-password types', () => {
    render(<Input aria-label="Name" type="text" allowTogglePassword />);
    expect(screen.queryByRole('button', { name: /password/i })).toBeNull();
  });

  it('toggles the input type with state-indicating icon labels', () => {
    render(<Input aria-label="Password" type="password" allowTogglePassword />);
    const input = screen.getByLabelText('Password') as HTMLInputElement;

    expect(input.type).toBe('password');
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input.type).toBe('text');
    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(input.type).toBe('password');
  });

  it('allows icon overrides', () => {
    render(
      <Input
        aria-label="Password"
        type="password"
        allowTogglePassword
        eyeIcon={<span data-testid="eye-open">开</span>}
        eyeOffIcon={<span data-testid="eye-closed">闭</span>}
      />,
    );
    expect(screen.getByTestId('eye-closed')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByTestId('eye-open')).toBeInTheDocument();
  });

  it('disables the toggle when the input is disabled', () => {
    render(<Input aria-label="Password" type="password" allowTogglePassword disabled />);
    expect(screen.getByRole('button', { name: 'Show password' })).toBeDisabled();
  });
});
