import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from '../input';

describe('Input state', () => {
  it('renders a text input inside the group shell', () => {
    render(<Input aria-label="Name" />);
    const input = screen.getByRole('textbox', { name: /name/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('colox-input__control');
    expect(input.closest('.colox-input-group')).not.toBeNull();
  });

  it('marks invalid inputs: aria on the control, class on the shell', () => {
    render(<Input aria-label="Name" invalid />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.closest('.colox-input-group')).toHaveClass('colox-input--invalid');
  });

  it('is not marked invalid by default', () => {
    render(<Input aria-label="Name" />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('marks the shell disabled state', () => {
    render(<Input aria-label="Name" disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input.closest('.colox-input-group')).toHaveClass('colox-input--disabled');
  });

  it('forwards extra attributes to the inner control', () => {
    render(<Input data-testid="input" type="email" placeholder="you@example.com" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'you@example.com');
  });
});
