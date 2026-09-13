import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '../button';

describe('Button variants', () => {
  it('applies the solid variant class by default', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button')).toHaveClass('colox-button--solid');
  });

  it('applies the outline variant class', () => {
    render(<Button variant="outline">Save</Button>);
    expect(screen.getByRole('button')).toHaveClass('colox-button--outline');
  });

  it('applies the ghost variant class', () => {
    render(<Button variant="ghost">Save</Button>);
    expect(screen.getByRole('button')).toHaveClass('colox-button--ghost');
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
