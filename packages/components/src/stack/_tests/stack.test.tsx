import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BreakpointName } from '@colox/theme';
import { Stack } from '../stack';

const { mockBreakpoint } = vi.hoisted(() => ({
  mockBreakpoint: { value: 'base' as BreakpointName },
}));

vi.mock('@colox/theme', () => ({
  useColoxTheme: () => ({ breakpoint: mockBreakpoint.value }),
}));

describe('Stack', () => {
  afterEach(() => {
    mockBreakpoint.value = 'base';
  });

  it('renders the flexbox base class with CSS-faithful defaults', () => {
    render(<Stack>content</Stack>);
    const el = screen.getByText('content');
    expect(el).toHaveClass(
      'colox-stack',
      'colox-stack--row',
      'colox-stack--align-stretch',
      'colox-stack--justify-start',
    );
    expect(el).not.toHaveClass('colox-stack--wrap');
    expect(el.className).not.toMatch(/colox-stack--gap-/);
  });

  it('maps direction, gap, align, justify and wrap onto the modifier classes', () => {
    render(
      <Stack direction="column" gap="8" align="center" justify="between" wrap>
        content
      </Stack>,
    );
    expect(screen.getByText('content')).toHaveClass(
      'colox-stack--column',
      'colox-stack--gap-8',
      'colox-stack--align-center',
      'colox-stack--justify-between',
      'colox-stack--wrap',
    );
  });

  it('supports the reverse main-axis directions and half-step gap keys', () => {
    render(
      <Stack direction="row-reverse" gap="2-5">
        content
      </Stack>,
    );
    expect(screen.getByText('content')).toHaveClass(
      'colox-stack--row-reverse',
      'colox-stack--gap-2-5',
    );
  });

  it('passes through native div attributes, handlers and className', () => {
    const onClick = vi.fn();
    render(
      <Stack data-testid="stack" className="my-stack" onClick={onClick}>
        content
      </Stack>,
    );
    const el = screen.getByTestId('stack');
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledOnce();
    expect(el).toHaveClass('my-stack', 'colox-stack');
  });

  it('exposes Item and Responsive as parts', () => {
    expect(Stack.Item).toBeDefined();
    expect(Stack.Responsive).toBeDefined();
  });
});

describe('Stack.Item', () => {
  it('renders the item base class and the grow modifier', () => {
    render(
      <Stack>
        <Stack.Item grow>one</Stack.Item>
        <div>two</div>
      </Stack>,
    );
    expect(screen.getByText('one')).toHaveClass('colox-stack-item', 'colox-stack-item--grow');
    expect(screen.getByText('two')).not.toHaveClass('colox-stack-item');
  });

  it('merges className onto the item', () => {
    render(
      <Stack>
        <Stack.Item className="my-item">one</Stack.Item>
      </Stack>,
    );
    expect(screen.getByText('one')).toHaveClass('colox-stack-item', 'my-item');
  });
});

describe('Stack.Responsive', () => {
  it('overrides the gap prop while mounted and restores it on unmount', () => {
    const { rerender } = render(
      <Stack gap="4">
        <Stack.Responsive gap={{ base: '2' }} />
        content
      </Stack>,
    );
    const el = screen.getByText('content');
    expect(el).toHaveClass('colox-stack--gap-2');
    expect(el).not.toHaveClass('colox-stack--gap-4');

    rerender(<Stack gap="4">content</Stack>);
    expect(el).toHaveClass('colox-stack--gap-4');
  });

  it('resolves the current band value across the theme breakpoint name', () => {
    mockBreakpoint.value = 'md';
    render(
      <Stack gap="4">
        <Stack.Responsive gap={{ base: '2', md: '8' }} />
        content
      </Stack>,
    );
    expect(screen.getByText('content')).toHaveClass('colox-stack--gap-8');
  });

  it('falls back to base for wider bands without their own value', () => {
    mockBreakpoint.value = 'lg';
    render(
      <Stack gap="4">
        <Stack.Responsive gap={{ base: '2', md: '8' }} />
        content
      </Stack>,
    );
    expect(screen.getByText('content')).toHaveClass('colox-stack--gap-2');
  });
});
