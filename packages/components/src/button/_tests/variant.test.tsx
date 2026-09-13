import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '../button';

describe('Button variants', () => {
  it('applies the solid variant class by default', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button')).toHaveClass('colox-button--solid');
  });

  it.each([
    ['solid', 'colox-button--solid'],
    ['subtle', 'colox-button--subtle'],
    ['surface', 'colox-button--surface'],
    ['outline', 'colox-button--outline'],
    ['ghost', 'colox-button--ghost'],
  ] as const)('applies the %s variant class', (variant, expectedClass) => {
    render(<Button variant={variant}>Save</Button>);
    expect(screen.getByRole('button')).toHaveClass(expectedClass);
  });

  it('applies the gray palette class by default', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button')).toHaveClass('colox-button--gray');
  });

  it.each([
    ['primary', 'colox-button--primary'],
    ['gray', 'colox-button--gray'],
    ['info', 'colox-button--info'],
    ['error', 'colox-button--error'],
    ['warning', 'colox-button--warning'],
    ['success', 'colox-button--success'],
  ] as const)('applies the %s palette class', (palette, expectedClass) => {
    render(<Button palette={palette}>Save</Button>);
    expect(screen.getByRole('button')).toHaveClass(expectedClass);
  });
});
