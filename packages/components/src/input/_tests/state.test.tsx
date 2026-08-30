import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from '../input';

describe('Input state', () => {
  it('renders a text input', () => {
    render(<Input aria-label="Name" />);
    expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
  });

  it('marks invalid inputs', () => {
    render(<Input aria-label="Name" invalid />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('colox-input--invalid');
  });

  it('is not marked invalid by default', () => {
    render(<Input aria-label="Name" />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('forwards extra attributes', () => {
    render(<Input data-testid="input" type="email" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');
  });
});
