import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { Progress } from '..';

/** Render a Progress.Linear and return its root element. */
function renderRoot(ui: ReactElement) {
  const { container } = render(ui);
  const root = container.querySelector('.colox-progress-linear');
  if (!root) throw new Error('progress root not found');
  return root;
}

describe('Progress.Linear value', () => {
  it('slides the bar to the committed percent and reports it', () => {
    const root = renderRoot(<Progress.Linear value={40} />);
    const bar = root.querySelector('.colox-progress-linear__bar') as HTMLElement;
    expect(bar.style.width).toBe('40%');
    expect(root).toHaveAttribute('aria-valuenow', '40');
    expect(root.querySelector('.colox-progress-linear__info')?.textContent).toBe('40%');
  });

  it('is indeterminate without a value: sweeping block, no percent label', () => {
    const root = renderRoot(<Progress.Linear />);
    const bar = root.querySelector('.colox-progress-linear__bar') as HTMLElement;
    expect(bar).toHaveClass('colox-progress-linear__bar--indeterminate');
    expect(bar.style.width).toBe('');
    expect(root).not.toHaveAttribute('aria-valuenow');
    expect(root.querySelector('.colox-progress-linear__info')).toBeNull();
  });

  it('keeps the live region pinned: role, min and max', () => {
    const root = renderRoot(<Progress.Linear value={40} />);
    expect(root).toHaveAttribute('role', 'progressbar');
    expect(root).toHaveAttribute('aria-valuemin', '0');
    expect(root).toHaveAttribute('aria-valuemax', '100');
  });

  it('over-committed widths stay clipped by the track, not the style', () => {
    const root = renderRoot(<Progress.Linear value={140} />);
    const bar = root.querySelector('.colox-progress-linear__bar') as HTMLElement;
    expect(bar.style.width).toBe('140%');
    const track = root.querySelector('.colox-progress-linear__track') as HTMLElement;
    expect(track).toHaveClass('colox-progress-linear__track');
  });
});

describe('Progress.Linear info', () => {
  it('omits the label with showInfo={false}', () => {
    const root = renderRoot(<Progress.Linear value={40} showInfo={false} />);
    expect(root.querySelector('.colox-progress-linear__info')).toBeNull();
  });

  it('formats the label through format', () => {
    const root = renderRoot(
      <Progress.Linear value={40} format={(percent) => `completed ${percent}/100`} />,
    );
    expect(root.querySelector('.colox-progress-linear__info')?.textContent).toBe(
      'completed 40/100',
    );
  });
});

describe('Progress.Linear axes', () => {
  it.each([
    ['primary', 'colox-progress-linear--primary'],
    ['gray', 'colox-progress-linear--gray'],
    ['info', 'colox-progress-linear--info'],
    ['success', 'colox-progress-linear--success'],
    ['warning', 'colox-progress-linear--warning'],
    ['error', 'colox-progress-linear--error'],
  ] as const)('maps the %s palette family', (palette, expectedClass) => {
    expect(renderRoot(<Progress.Linear value={40} palette={palette} />)).toHaveClass(expectedClass);
  });

  it('defaults to the primary palette and the md size', () => {
    const root = renderRoot(<Progress.Linear value={40} />);
    expect(root).toHaveClass('colox-progress-linear--primary');
    expect(root).toHaveClass('colox-progress-linear--md');
  });

  it.each([
    ['sm', 'colox-progress-linear--sm'],
    ['md', 'colox-progress-linear--md'],
    ['lg', 'colox-progress-linear--lg'],
  ] as const)('maps the %s size tier', (size, expectedClass) => {
    expect(renderRoot(<Progress.Linear value={40} size={size} />)).toHaveClass(expectedClass);
  });
});

describe('Progress.Linear passthrough', () => {
  it('merges className and passes native attributes', () => {
    const root = renderRoot(
      <Progress.Linear value={40} className="extra" data-testid="progress" aria-label="Upload" />,
    );
    expect(root).toHaveClass('extra');
    expect(root).toHaveAttribute('data-testid', 'progress');
    expect(root).toHaveAttribute('aria-label', 'Upload');
  });

  it('spreads classless rest props onto the root', () => {
    const root = renderRoot(<Progress.Linear value={40} title="upload progress" />);
    expect(root).toHaveAttribute('title', 'upload progress');
  });
});
