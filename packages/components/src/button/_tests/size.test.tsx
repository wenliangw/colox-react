import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '../button';

describe('Button sizes', () => {
  it('applies the extra small size class', () => {
    render(<Button size="xs">Save</Button>);
    expect(screen.getByRole('button')).toHaveClass('colox-button--xs');
  });

  it('applies the medium size class by default', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button')).toHaveClass('colox-button--md');
  });

  it('applies the small size class', () => {
    render(<Button size="sm">Save</Button>);
    expect(screen.getByRole('button')).toHaveClass('colox-button--sm');
  });

  it('applies the large size class', () => {
    render(<Button size="lg">Save</Button>);
    expect(screen.getByRole('button')).toHaveClass('colox-button--lg');
  });
});
