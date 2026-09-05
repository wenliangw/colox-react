import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../button';

describe('Button state', () => {
  it('renders a button with sensible defaults', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: /save/i });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('colox-button--md', 'colox-button--solid', 'colox-button--brand');
  });

  it('disables interaction when disabled is set', () => {
    render(<Button disabled>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('forwards extra attributes and keeps the type override', () => {
    render(
      <Button data-testid="submit-order" type="submit" form="checkout">
        Submit
      </Button>,
    );
    const button = screen.getByTestId('submit-order');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('form', 'checkout');
  });

  it('triggers click handlers', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
