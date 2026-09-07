import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Container } from '../container';

describe('Container', () => {
  it('renders the width-shell base class with the semantic defaults', () => {
    render(<Container>content</Container>);
    const el = screen.getByText('content');
    expect(el).toHaveClass(
      'colox-container',
      'colox-container--size-fluid',
      'colox-container--align-center',
    );
    expect(el.className).not.toMatch(/colox-container--gutter-/);
  });

  it('maps size, gutter and align onto the modifier classes', () => {
    render(
      <Container size="md" gutter="4" align="start">
        content
      </Container>,
    );
    expect(screen.getByText('content')).toHaveClass(
      'colox-container--size-md',
      'colox-container--gutter-4',
      'colox-container--align-start',
    );
    expect(screen.getByText('content')).not.toHaveClass('colox-container--size-fluid');
  });

  it('supports the half-step gutter keys', () => {
    render(<Container gutter="2-5">content</Container>);
    expect(screen.getByText('content')).toHaveClass('colox-container--gutter-2-5');
  });

  it('passes through native div attributes, handlers and className', () => {
    const onClick = vi.fn();
    render(
      <Container data-testid="container" className="my-container" onClick={onClick}>
        content
      </Container>,
    );
    const el = screen.getByTestId('container');
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledOnce();
    expect(el).toHaveClass('my-container', 'colox-container');
  });

  it('forwards its ref to the underlying div', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Container ref={ref}>content</Container>);
    expect(ref.current).toHaveClass('colox-container');
  });
});
