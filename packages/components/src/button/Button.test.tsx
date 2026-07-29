import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies the variant class', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('colox-btn--danger');
  });

  it('applies the size class', () => {
    render(<Button size="lg">Big</Button>);
    expect(screen.getByRole('button')).toHaveClass('colox-btn--lg');
  });

  it('is disabled while loading', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('forwards extra attributes', () => {
    render(
      <Button data-testid="btn" type="submit">
        Submit
      </Button>,
    );
    expect(screen.getByTestId('btn')).toHaveAttribute('type', 'submit');
  });
});
