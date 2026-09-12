import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IconButton } from '../icon-button';

describe('IconButton size', () => {
  it.each([
    ['xs', 'colox-icon-button--xs'],
    ['sm', 'colox-icon-button--sm'],
    ['md', 'colox-icon-button--md'],
    ['lg', 'colox-icon-button--lg'],
  ] as const)('applies the %s preset class', (size, expectedClass) => {
    render(<IconButton size={size} aria-label="close" />);
    expect(screen.getByRole('button', { name: 'close' })).toHaveClass(expectedClass);
  });

  it.each(['0-5', '4', '7', '16', '360'] as const)(
    'applies the size-%s raw token key class',
    (key) => {
      render(<IconButton size={key} aria-label="close" />);
      expect(screen.getByRole('button', { name: 'close' })).toHaveClass(
        `colox-icon-button--size-${key}`,
      );
    },
  );

  it('defaults to md', () => {
    render(<IconButton aria-label="close" />);
    expect(screen.getByRole('button', { name: 'close' })).toHaveClass('colox-icon-button--md');
  });
});

describe('IconButton semantics', () => {
  it('renders children inside the button', () => {
    render(
      <IconButton aria-label="close">
        <svg data-testid="glyph" />
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: 'close' })).toContainElement(
      screen.getByTestId('glyph'),
    );
  });

  it('defaults to type="button"', () => {
    render(<IconButton aria-label="close" />);
    expect(screen.getByRole('button', { name: 'close' })).toHaveAttribute('type', 'button');
  });

  it('forwards native props (click, disabled, className)', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <IconButton aria-label="close" disabled className="mine" onClick={onClick} />,
    );
    const button = screen.getByRole('button', { name: 'close' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('mine');
    // A disabled button never fires click (native semantics); assert the
    // passthrough on an enabled re-render.
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    rerender(<IconButton aria-label="close" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'close' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
