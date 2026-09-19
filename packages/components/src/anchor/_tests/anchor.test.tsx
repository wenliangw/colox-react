import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Anchor } from '../anchor';
import type { AnchorRef } from '../types';

describe('Anchor', () => {
  it('renders the reference frame', () => {
    render(<Anchor data-testid="frame" />);
    expect(screen.getByTestId('frame')).toHaveClass('colox-anchor');
  });

  it('hugs the content when inline', () => {
    render(<Anchor data-testid="frame" inline />);
    expect(screen.getByTestId('frame')).toHaveClass('colox-anchor', 'colox-anchor--inline');
  });

  it('merges className, spreads rest props and forwards the ref', () => {
    const ref = createRef<AnchorRef>();
    render(<Anchor ref={ref} data-testid="frame" className="picky" id="anchor" />);

    const frame = screen.getByTestId('frame');
    expect(frame).toHaveClass('colox-anchor', 'picky');
    expect(frame).toHaveAttribute('id', 'anchor');
    expect(ref.current).toBe(frame);
  });

  it('carries no positioning vocabulary', () => {
    render(<Anchor data-testid="frame" inline />);
    expect(screen.getByTestId('frame').className).not.toMatch(
      /--(placement|fill|offset|position)-/,
    );
  });
});
