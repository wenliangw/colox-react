import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from '..';

/** Render a skeleton shape and return its host element. */
function renderHost(ui: ReactElement, selector: string): HTMLElement {
  const { container } = render(ui);
  const host = container.querySelector(selector);
  if (!host) throw new Error(`${selector} not found`);
  return host as HTMLElement;
}

describe('Skeleton root (rect block)', () => {
  it('renders a neutral rect block with the card radius face', () => {
    const root = renderHost(<Skeleton />, '.colox-skeleton');
    expect(root.tagName).toBe('DIV');
  });

  it('is decorative: aria-hidden on by default', () => {
    const root = renderHost(<Skeleton />, '.colox-skeleton');
    expect(root).toHaveAttribute('aria-hidden', 'true');
  });

  it('accepts an explicit aria-hidden={false} for caller-wired announcements', () => {
    const root = renderHost(<Skeleton aria-hidden={false} />, '.colox-skeleton');
    expect(root).toHaveAttribute('aria-hidden', 'false');
  });

  it('pulses by default, wave and none are explicit faces', () => {
    expect(renderHost(<Skeleton />, '.colox-skeleton')).toHaveClass('colox-skeleton--pulse');
    expect(renderHost(<Skeleton animation="wave" />, '.colox-skeleton')).toHaveClass(
      'colox-skeleton--wave',
    );
    expect(renderHost(<Skeleton animation="none" />, '.colox-skeleton')).toHaveClass(
      'colox-skeleton--none',
    );
  });

  it('pins exact sizes through the px escapes', () => {
    const root = renderHost(<Skeleton width={480} height={96} />, '.colox-skeleton');
    expect(root.style.width).toBe('480px');
    expect(root.style.height).toBe('96px');
  });

  it('lets the px escapes win over a consumer inline style', () => {
    const root = renderHost(<Skeleton style={{ width: '20rem' }} width={320} />, '.colox-skeleton');
    expect(root.style.width).toBe('320px');
  });

  it('merges the className and passes native attributes through', () => {
    const root = renderHost(
      <Skeleton className="my-rect" data-testid="hero-slot" />,
      '.colox-skeleton',
    );
    expect(root).toHaveClass('colox-skeleton--pulse', 'my-rect');
    expect(root).toHaveAttribute('data-testid', 'hero-slot');
  });
});

describe('Skeleton.Text', () => {
  it('renders a full-width capsule line, md tier by default', () => {
    const line = renderHost(<Skeleton.Text />, '.colox-skeleton-text');
    expect(line.tagName).toBe('SPAN');
    expect(line).toHaveClass('colox-skeleton-text--md', 'colox-skeleton--pulse');
  });

  it('moves across the line tiers', () => {
    expect(renderHost(<Skeleton.Text size="sm" />, '.colox-skeleton-text')).toHaveClass(
      'colox-skeleton-text--sm',
    );
    expect(renderHost(<Skeleton.Text size="lg" />, '.colox-skeleton-text')).toHaveClass(
      'colox-skeleton-text--lg',
    );
  });

  it('accepts a px line width', () => {
    const line = renderHost(<Skeleton.Text width={260} />, '.colox-skeleton-text');
    expect(line.style.width).toBe('260px');
  });
});

describe('Skeleton.Circle', () => {
  it('renders a round footprint, md tier by default', () => {
    const circle = renderHost(<Skeleton.Circle />, '.colox-skeleton-circle');
    expect(circle.tagName).toBe('SPAN');
    expect(circle).toHaveClass('colox-skeleton-circle--md', 'colox-skeleton--pulse');
  });

  it('aliases the Avatar footprint tiers', () => {
    expect(renderHost(<Skeleton.Circle size="xs" />, '.colox-skeleton-circle')).toHaveClass(
      'colox-skeleton-circle--xs',
    );
    expect(renderHost(<Skeleton.Circle size="sm" />, '.colox-skeleton-circle')).toHaveClass(
      'colox-skeleton-circle--sm',
    );
    expect(renderHost(<Skeleton.Circle size="lg" />, '.colox-skeleton-circle')).toHaveClass(
      'colox-skeleton-circle--lg',
    );
  });

  it('addresses any raw size-token key through the same size channel', () => {
    const circle = renderHost(<Skeleton.Circle size="7" />, '.colox-skeleton-circle');
    expect(circle).toHaveClass('colox-skeleton-circle--size-7');
  });

  it('takes the animation axis like the rest of the family', () => {
    const circle = renderHost(<Skeleton.Circle animation="wave" />, '.colox-skeleton-circle');
    expect(circle).toHaveClass('colox-skeleton--wave');
  });
});

describe('Skeleton.Button', () => {
  it('renders a control silhouette, md tier by default', () => {
    const button = renderHost(<Skeleton.Button />, '.colox-skeleton-button');
    expect(button.tagName).toBe('SPAN');
    expect(button).toHaveClass('colox-skeleton-button--md', 'colox-skeleton--pulse');
  });

  it('mirrors the Button control ladder', () => {
    expect(renderHost(<Skeleton.Button size="xs" />, '.colox-skeleton-button')).toHaveClass(
      'colox-skeleton-button--xs',
    );
    expect(renderHost(<Skeleton.Button size="sm" />, '.colox-skeleton-button')).toHaveClass(
      'colox-skeleton-button--sm',
    );
    expect(renderHost(<Skeleton.Button size="lg" />, '.colox-skeleton-button')).toHaveClass(
      'colox-skeleton-button--lg',
    );
  });

  it('accepts a px button width', () => {
    const button = renderHost(<Skeleton.Button width={120} />, '.colox-skeleton-button');
    expect(button.style.width).toBe('120px');
  });
});
