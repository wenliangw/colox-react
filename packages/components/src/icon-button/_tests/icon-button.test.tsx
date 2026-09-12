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

describe('IconButton variant', () => {
  it.each([
    ['text', 'colox-icon-button--text'],
    ['solid', 'colox-icon-button--solid'],
    ['outline', 'colox-icon-button--outline'],
    ['ghost', 'colox-icon-button--ghost'],
  ] as const)('applies the %s variant class', (variant, expectedClass) => {
    render(<IconButton variant={variant} aria-label="close" />);
    expect(screen.getByRole('button', { name: 'close' })).toHaveClass(expectedClass);
  });

  it('defaults to text', () => {
    render(<IconButton aria-label="close" />);
    expect(screen.getByRole('button', { name: 'close' })).toHaveClass('colox-icon-button--text');
  });
});

describe('IconButton intent', () => {
  it.each([
    ['primary', 'colox-icon-button--primary'],
    ['neutral', 'colox-icon-button--neutral'],
    ['danger', 'colox-icon-button--danger'],
    ['warning', 'colox-icon-button--warning'],
    ['success', 'colox-icon-button--success'],
  ] as const)('applies the %s intent class', (intent, expectedClass) => {
    render(<IconButton variant="solid" intent={intent} aria-label="close" />);
    expect(screen.getByRole('button', { name: 'close' })).toHaveClass(expectedClass);
  });

  it('defaults to neutral', () => {
    render(<IconButton aria-label="close" />);
    expect(screen.getByRole('button', { name: 'close' })).toHaveClass('colox-icon-button--neutral');
  });
});

describe('IconButton rounded', () => {
  it('stays square by default', () => {
    render(<IconButton aria-label="close" />);
    expect(screen.getByRole('button', { name: 'close' })).not.toHaveClass(
      'colox-icon-button--rounded',
    );
  });

  it('applies the rounded class when set', () => {
    render(<IconButton rounded aria-label="close" />);
    expect(screen.getByRole('button', { name: 'close' })).toHaveClass('colox-icon-button--rounded');
  });
});
