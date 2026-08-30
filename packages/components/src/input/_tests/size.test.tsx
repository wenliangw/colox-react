import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from '../input';

describe('Input size', () => {
  it('applies the default md size class', () => {
    render(<Input aria-label="Name" />);
    expect(screen.getByRole('textbox')).toHaveClass('colox-input--md');
  });

  it('applies the sm size class', () => {
    render(<Input aria-label="Name" size="sm" />);
    expect(screen.getByRole('textbox')).toHaveClass('colox-input--sm');
  });

  it('applies the lg size class', () => {
    render(<Input aria-label="Name" size="lg" />);
    expect(screen.getByRole('textbox')).toHaveClass('colox-input--lg');
  });
});
