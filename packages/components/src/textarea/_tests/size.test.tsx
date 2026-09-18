import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Textarea } from '../textarea';

describe('Textarea size', () => {
  it.each([
    ['xs', 'colox-textarea--xs'],
    ['sm', 'colox-textarea--sm'],
    ['md', 'colox-textarea--md'],
    ['lg', 'colox-textarea--lg'],
  ] as const)('applies %s on the shell', (size, expectedClass) => {
    render(<Textarea aria-label="Notes" size={size} />);
    expect(screen.getByRole('textbox').closest('.colox-textarea')).toHaveClass(expectedClass);
  });

  it('defaults to md', () => {
    render(<Textarea aria-label="Notes" />);
    expect(screen.getByRole('textbox').closest('.colox-textarea')).toHaveClass(
      'colox-textarea--md',
    );
  });
});
