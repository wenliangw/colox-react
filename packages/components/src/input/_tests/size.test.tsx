import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from '../input';

describe('Input size', () => {
  it.each([
    ['xs', 'colox-input--xs'],
    ['sm', 'colox-input--sm'],
    ['md', 'colox-input--md'],
    ['lg', 'colox-input--lg'],
  ] as const)('applies %s on the shell', (size, expectedClass) => {
    render(<Input aria-label="Name" size={size} />);
    expect(screen.getByRole('textbox').closest('.colox-input')).toHaveClass(expectedClass);
  });

  it('defaults to md', () => {
    render(<Input aria-label="Name" />);
    expect(screen.getByRole('textbox').closest('.colox-input')).toHaveClass('colox-input--md');
  });
});
