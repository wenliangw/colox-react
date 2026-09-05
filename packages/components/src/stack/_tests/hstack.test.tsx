import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HStack } from '../hstack';

describe('HStack', () => {
  it('renders with the direction class and the default modifier set', () => {
    render(<HStack>content</HStack>);
    const stack = screen.getByText('content');
    expect(stack).toHaveClass(
      'colox-hstack',
      'colox-stack--gap-2',
      'colox-stack--align-stretch',
      'colox-stack--justify-start',
    );
    expect(stack).not.toHaveClass('colox-hstack--wrap');
  });

  it('maps gap, align and justify onto the theme-token modifier classes', () => {
    render(
      <HStack gap="8" align="center" justify="between" wrap>
        content
      </HStack>,
    );
    expect(screen.getByText('content')).toHaveClass(
      'colox-stack--gap-8',
      'colox-stack--align-center',
      'colox-stack--justify-between',
      'colox-hstack--wrap',
    );
  });

  it('keeps half-step gap keys intact', () => {
    render(<HStack gap="2-5">content</HStack>);
    expect(screen.getByText('content')).toHaveClass('colox-stack--gap-2-5');
  });

  it('passes through native div attributes and handlers', () => {
    const onClick = vi.fn();
    render(
      <HStack data-testid="stack" className="my-row" onClick={onClick}>
        content
      </HStack>,
    );
    const el = screen.getByTestId('stack');
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledOnce();
    expect(el).toHaveClass('my-row', 'colox-hstack');
  });
});
