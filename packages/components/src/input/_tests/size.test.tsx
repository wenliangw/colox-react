import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from '../input';

describe('Input size', () => {
  it.each([
    ['xs', 'colox-input-group--xs'],
    ['sm', 'colox-input-group--sm'],
    ['md', 'colox-input-group--md'],
    ['lg', 'colox-input-group--lg'],
  ] as const)('applies %s on the shell', (size, expectedClass) => {
    render(<Input aria-label="Name" size={size} />);
    expect(screen.getByRole('textbox').closest('.colox-input-group')).toHaveClass(expectedClass);
  });

  it('defaults to md', () => {
    render(<Input aria-label="Name" />);
    expect(screen.getByRole('textbox').closest('.colox-input-group')).toHaveClass(
      'colox-input-group--md',
    );
  });
});
