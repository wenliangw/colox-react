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

  it('applies the brand intent class by default', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button')).toHaveClass('colox-button--brand');
  });

  it('applies the neutral intent class', () => {
    render(<Button intent="neutral">Save</Button>);
    expect(screen.getByRole('button')).toHaveClass('colox-button--neutral');
  });

  it('applies the danger intent class', () => {
    render(<Button intent="danger">Save</Button>);
    expect(screen.getByRole('button')).toHaveClass('colox-button--danger');
  });
});
