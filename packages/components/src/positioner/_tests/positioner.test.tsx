import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Anchor } from '../../anchor';
import { Positioner } from '../positioner';
import type { PositionerRef } from '../types';

const PLACEMENTS = [
  'top-start',
  'top',
  'top-end',
  'start',
  'center',
  'end',
  'bottom-start',
  'bottom',
  'bottom-end',
] as const;

describe('Positioner', () => {
  it('resolves against the nearest positioned ancestor by default', () => {
    render(<Positioner data-testid="box" />);
    expect(screen.getByTestId('box')).toHaveClass(
      'colox-positioner',
      'colox-positioner--position-absolute',
    );
  });

  it('resolves against the viewport when fixed', () => {
    render(<Positioner data-testid="box" position="fixed" />);
    expect(screen.getByTestId('box')).toHaveClass('colox-positioner--position-fixed');
  });

  it.each(PLACEMENTS)('pins to the %s anchor', (placement) => {
    render(<Positioner data-testid="box" placement={placement} />);
    expect(screen.getByTestId('box')).toHaveClass(`colox-positioner--placement-${placement}`);
  });

  it('covers its reference box when filled', () => {
    render(<Positioner data-testid="box" position="fixed" fill />);
    expect(screen.getByTestId('box')).toHaveClass(
      'colox-positioner--position-fixed',
      'colox-positioner--fill',
    );
  });

  it('carries no anchor without a placement', () => {
    render(<Positioner data-testid="box" />);
    expect(screen.getByTestId('box').className).not.toMatch(/--placement-/);
  });

  it('spaces a bare offset key from the pinned edges only', () => {
    render(<Positioner data-testid="box" placement="top-end" offset="2" />);
    const box = screen.getByTestId('box');

    expect(box).toHaveClass('colox-positioner--offset-top-2', 'colox-positioner--offset-end-2');
    expect(box).not.toHaveClass('colox-positioner--offset-bottom-2');
    expect(box).not.toHaveClass('colox-positioner--offset-start-2');
  });

  it('applies a bare offset key to every edge without a placement', () => {
    render(<Positioner data-testid="box" position="fixed" offset="0-5" />);
    expect(screen.getByTestId('box')).toHaveClass(
      'colox-positioner--offset-top-0-5',
      'colox-positioner--offset-bottom-0-5',
      'colox-positioner--offset-start-0-5',
      'colox-positioner--offset-end-0-5',
    );
  });

  it('leaves a centred box without an edge to space', () => {
    render(<Positioner data-testid="box" placement="center" offset="2" />);
    const box = screen.getByTestId('box');

    expect(box).toHaveClass('colox-positioner--placement-center');
    expect(box.className).not.toMatch(/--offset-/);
  });

  it('states each edge with an object and pins the edges it names', () => {
    render(
      <Positioner data-testid="box" placement="top-end" offset={{ bottom: '4', start: '1' }} />,
    );
    const box = screen.getByTestId('box');

    expect(box).toHaveClass(
      'colox-positioner--offset-bottom-4',
      'colox-positioner--offset-start-1',
    );
    expect(box).not.toHaveClass('colox-positioner--offset-top-4');
  });

  it('combines fill with an offset inset', () => {
    render(<Positioner data-testid="box" fill offset="4" />);
    expect(screen.getByTestId('box')).toHaveClass(
      'colox-positioner--fill',
      'colox-positioner--offset-top-4',
      'colox-positioner--offset-bottom-4',
      'colox-positioner--offset-start-4',
      'colox-positioner--offset-end-4',
    );
  });

  it('merges className and keeps the native box attributes', () => {
    const ref = createRef<PositionerRef>();
    render(
      <Positioner
        ref={ref}
        data-testid="box"
        position="fixed"
        placement="bottom-end"
        className="picky"
        style={{ color: 'red' }}
        aria-hidden="true"
      />,
    );
    const box = screen.getByTestId('box');

    expect(box).toHaveClass('colox-positioner', 'picky');
    expect(box).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    expect(box).toHaveAttribute('aria-hidden', 'true');
    expect(ref.current).toBe(box);
  });
});

describe('Anchor and Positioner together', () => {
  it('nests the positioned box inside the frame', () => {
    const { container } = render(
      <Anchor inline>
        <span>content</span>
        <Positioner placement="top-end" />
      </Anchor>,
    );
    const frame = container.querySelector('.colox-anchor');
    const box = frame?.querySelector('.colox-positioner');

    expect(box).not.toBeNull();
    expect(frame).toHaveTextContent('content');
  });

  it('lets a positioned box frame its own children', () => {
    const { container } = render(
      <Anchor>
        <Positioner placement="bottom-start">
          <Positioner placement="center" />
        </Positioner>
      </Anchor>,
    );
    const outerBox = container.querySelector<HTMLElement>('.colox-positioner');
    const innerBox = outerBox?.querySelector('.colox-positioner');

    expect(innerBox).not.toBeNull();
    expect(container.querySelector('.colox-anchor')).toContainElement(outerBox);
  });
});
