import type { ReactElement } from 'react';
import { createRef } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Loading } from '..';

function renderLoading(ui: ReactElement = <Loading />): HTMLElement {
  const { container } = render(ui);
  const root = container.querySelector('.colox-loading');
  if (!root) throw new Error('loading root not found');
  return container;
}

describe('Loading indicator', () => {
  it('announces itself as a polite status region', () => {
    const root = renderLoading().querySelector('.colox-loading');
    expect(root).toHaveAttribute('role', 'status');
    expect(root).toHaveAttribute('aria-live', 'polite');
  });

  it('renders the spinner figure by default', () => {
    const container = renderLoading();
    expect(container.querySelector('.colox-loading')).toHaveClass('colox-loading--spinner');
    expect(container.querySelector('.colox-loading__indicator svg')).not.toBeNull();
  });

  it('switches figures per animation', () => {
    const dots = renderLoading(<Loading animation="dots" />);
    expect(dots.querySelector('.colox-loading')).toHaveClass('colox-loading--dots');
    expect(dots.querySelectorAll('.colox-loading__dot')).toHaveLength(3);
    expect(dots.querySelector('.colox-loading__indicator svg')).toBeNull();

    const pulse = renderLoading(<Loading animation="pulse" />);
    expect(pulse.querySelector('.colox-loading')).toHaveClass('colox-loading--pulse');
    expect(pulse.querySelector('.colox-loading__pulse')).not.toBeNull();
    // the ripple: a solid core wrapped in two concentric rings
    expect(pulse.querySelector('.colox-loading__pulse-core')).not.toBeNull();
    expect(
      pulse.querySelectorAll('.colox-loading__pulse-ring-inner, .colox-loading__pulse-ring-outer'),
    ).toHaveLength(2);
  });

  it('hides the animated figure from screen readers', () => {
    const indicator = renderLoading().querySelector('.colox-loading__indicator');
    expect(indicator).toHaveAttribute('aria-hidden', 'true');
  });

  it('sizes the indicator per key with md as the default', () => {
    expect(renderLoading().querySelector('.colox-loading')).toHaveClass('colox-loading--md');
    expect(renderLoading(<Loading size="sm" />).querySelector('.colox-loading')).toHaveClass(
      'colox-loading--sm',
    );
    expect(renderLoading(<Loading size="lg" />).querySelector('.colox-loading')).toHaveClass(
      'colox-loading--lg',
    );
  });

  it('pins a numeric size as the exact pixel footprint', () => {
    const indicator = renderLoading(<Loading size={40} />).querySelector(
      '.colox-loading__indicator',
    );
    expect(indicator).toHaveStyle({ 'font-size': '40px' });
  });
});

describe('Loading label', () => {
  it('renders the label beside the indicator', () => {
    const container = renderLoading(<Loading label="加载中…" />);
    expect(container.querySelector('.colox-loading__label')).toHaveTextContent('加载中…');
  });

  it('omits the label slot when absent', () => {
    expect(renderLoading().querySelector('.colox-loading__label')).toBeNull();
  });

  it('defaults the accessible name to Loading without a label', () => {
    expect(renderLoading().querySelector('.colox-loading')).toHaveAttribute(
      'aria-label',
      'Loading',
    );
  });

  it('lets the label be the accessible name when present', () => {
    const root = renderLoading(<Loading label="加载中…" />).querySelector('.colox-loading');
    expect(root).not.toHaveAttribute('aria-label');
    expect(root).toHaveTextContent('加载中…');
  });

  it('lets an explicit aria-label override both', () => {
    const root = renderLoading(<Loading label="加载中…" aria-label="Submitting" />).querySelector(
      '.colox-loading',
    );
    expect(root).toHaveAttribute('aria-label', 'Submitting');
  });
});

describe('Loading surface', () => {
  it('merges className and passes through native props', () => {
    const container = renderLoading(<Loading className="my-loading" data-side />);
    const root = container.querySelector('.colox-loading');
    expect(root).toHaveClass('colox-loading', 'my-loading');
    expect(root).toHaveAttribute('data-side');
  });

  it('forwards the ref to the host span', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Loading ref={ref} />);
    expect(ref.current?.tagName).toBe('SPAN');
  });
});
