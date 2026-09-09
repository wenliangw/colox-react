import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BreakpointName } from '@colox/theme';
import { Grid } from '../grid';

const { mockBreakpoint } = vi.hoisted(() => ({
  mockBreakpoint: { value: 'base' as BreakpointName },
}));

vi.mock('@colox/theme', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@colox/theme')>();
  return {
    ...actual,
    useColoxTheme: () => ({ breakpoint: mockBreakpoint.value }),
  };
});

describe('Grid', () => {
  afterEach(() => {
    mockBreakpoint.value = 'base';
  });

  it('renders the grid base class with CSS-faithful defaults', () => {
    render(<Grid>content</Grid>);
    const el = screen.getByText('content');
    expect(el).toHaveClass('colox-grid');
    expect(el.className).not.toMatch(/colox-grid--/);
  });

  it('maps the static column count onto the runtime custom property', () => {
    render(<Grid columns={3}>content</Grid>);
    expect(screen.getByText('content').style.getPropertyValue('--colox-grid-columns')).toBe('3');
  });

  it('resolves responsive columns against the current band', () => {
    mockBreakpoint.value = 'md';
    render(<Grid columns={{ sm: 1, md: 2, lg: 6 }}>content</Grid>);
    expect(screen.getByText('content').style.getPropertyValue('--colox-grid-columns')).toBe('2');
  });

  it('keeps the last configured band upward and falls back below the first', () => {
    mockBreakpoint.value = 'xl';
    const { rerender } = render(<Grid columns={{ md: 2, lg: 6 }}>content</Grid>);
    expect(screen.getByText('content').style.getPropertyValue('--colox-grid-columns')).toBe('6');
    mockBreakpoint.value = 'sm';
    rerender(<Grid columns={{ md: 2, lg: 6 }}>content</Grid>);
    expect(screen.getByText('content').style.getPropertyValue('--colox-grid-columns')).toBe('1');
  });

  it('keeps the last configured band beyond the widest cap (base state)', () => {
    render(<Grid columns={{ md: 2, lg: 6 }}>content</Grid>);
    expect(screen.getByText('content').style.getPropertyValue('--colox-grid-columns')).toBe('6');
  });

  it('takes one gap key for both axes and a per-axis object for each', () => {
    const { rerender } = render(<Grid gap="4">content</Grid>);
    const el = screen.getByText('content');
    expect(el).toHaveClass('colox-grid--gap-4');
    rerender(<Grid gap={{ row: '2', column: '8' }}>content</Grid>);
    expect(screen.getByText('content')).toHaveClass(
      'colox-grid--row-gap-2',
      'colox-grid--column-gap-8',
    );
    expect(screen.getByText('content')).not.toHaveClass('colox-grid--gap-4');
  });

  it('distributes tracks via the align/justify word families', () => {
    render(
      <Grid align="center" justify="between">
        content
      </Grid>,
    );
    expect(screen.getByText('content')).toHaveClass(
      'colox-grid--align-center',
      'colox-grid--justify-between',
    );
  });

  it('passes through native attributes, className, style and ref', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Grid ref={ref} data-testid="grid" className="my-grid" style={{ color: 'red' }}>
        content
      </Grid>,
    );
    const el = screen.getByTestId('grid');
    expect(el).toHaveClass('my-grid', 'colox-grid');
    expect(el.style.color).toBe('red');
    expect(ref.current).toBe(el);
  });

  it('exposes Item as a part', () => {
    expect(Grid.Item).toBeDefined();
  });
});

describe('Grid.Item', () => {
  it('renders the item base class and writes the span custom property', () => {
    render(
      <Grid>
        <Grid.Item span={3}>one</Grid.Item>
        <div>two</div>
      </Grid>,
    );
    const item = screen.getByText('one');
    expect(item).toHaveClass('colox-grid-item');
    expect(item.style.getPropertyValue('--colox-grid-item-span')).toBe('span 3');
    expect(screen.getByText('two')).not.toHaveClass('colox-grid-item');
  });

  it('stays class-only without a span and merges className', () => {
    render(
      <Grid>
        <Grid.Item className="my-item">one</Grid.Item>
      </Grid>,
    );
    const el = screen.getByText('one');
    expect(el).toHaveClass('colox-grid-item', 'my-item');
    expect(el.style.getPropertyValue('--colox-grid-item-span')).toBe('');
  });
});
