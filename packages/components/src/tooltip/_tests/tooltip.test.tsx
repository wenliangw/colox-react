import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tooltip } from '..';

describe('Tooltip', () => {
  it('renders the trigger in place without wrapping it (zero container)', () => {
    const { container } = render(
      <Tooltip content="hint">
        <button type="button">hover me</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'hover me' });
    expect(container.firstChild).toBe(trigger);
  });

  it('injects aria-describedby pointing at the tooltip id and keeps the author words', () => {
    render(
      <Tooltip content="hint">
        <button type="button" aria-describedby="own-desc">
          ref
        </button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'ref' });
    fireEvent.focus(trigger);
    const panel = screen.getByRole('tooltip');
    expect(trigger.getAttribute('aria-describedby')).toBe(`own-desc ${panel.id}`);
  });

  it('renders no panel and no describedby when the content is empty', () => {
    render(
      <Tooltip content="">
        <button type="button">x</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'x' });
    fireEvent.focus(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(trigger).not.toHaveAttribute('aria-describedby');
  });

  it('merges className/style onto the trigger and keeps the author values', () => {
    render(
      <Tooltip className="root-extra" style={{ color: 'red', marginTop: 4 }}>
        <button type="button" className="own" style={{ color: 'blue' }}>
          styled
        </button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'styled' });
    expect(trigger.className).toContain('own');
    expect(trigger.className).toContain('root-extra');
    expect(trigger.style.color).toBe('blue');
    expect(trigger.style.marginTop).toBe('4px');
  });

  it('forwards the root ref to the trigger DOM node', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Tooltip ref={ref} content="hint">
        <button type="button">focus</button>
      </Tooltip>,
    );
    expect(ref.current).toBe(screen.getByRole('button', { name: 'focus' }));
  });

  it('maps palette/size/arrow onto the panel and content box classes', () => {
    render(
      <Tooltip content="hint" palette="primary" size="lg" showArrow>
        <button type="button">v</button>
      </Tooltip>,
    );
    fireEvent.focus(screen.getByRole('button', { name: 'v' }));
    const panel = screen.getByRole('tooltip');
    expect(panel).toHaveClass('colox-tooltip__panel');
    expect(panel).toHaveClass('colox-tooltip__panel--primary');
    // The arrow span renders first (it buries under the content box).
    expect(panel.firstElementChild).toHaveClass('colox-tooltip__arrow');
    const content = panel.lastElementChild as HTMLElement;
    expect(content).toHaveClass('colox-tooltip__content');
    expect(content).toHaveClass('colox-tooltip__content--primary');
    expect(content).toHaveClass('colox-tooltip__content--size-lg');
    expect(content).toHaveClass('colox-tooltip__content--arrow');
  });

  it('sizes the arrow with the sm tier', () => {
    render(
      <Tooltip content="hint" size="sm" showArrow>
        <button type="button">v</button>
      </Tooltip>,
    );
    fireEvent.focus(screen.getByRole('button', { name: 'v' }));
    const panel = screen.getByRole('tooltip');
    expect(panel.firstElementChild).toHaveClass('colox-tooltip__arrow');
    expect(panel.firstElementChild).toHaveClass('colox-tooltip__arrow--size-sm');
    expect(screen.getByRole('tooltip').lastElementChild).toHaveClass(
      'colox-tooltip__content--size-sm',
    );
  });

  it('drops the arrow word with showArrow={false} and keeps the defaults unmodified', () => {
    render(
      <Tooltip content="hint" showArrow={false}>
        <button type="button">a</button>
      </Tooltip>,
    );
    fireEvent.focus(screen.getByRole('button', { name: 'a' }));
    const content = screen.getByRole('tooltip').firstElementChild as HTMLElement;
    expect(content.className).toBe('colox-tooltip__content');
    expect(content.className).not.toMatch(/--arrow/);
    expect(content.className).not.toMatch(/--size/);
  });

  it('composed channels: the trigger part host renders in place, the content part paints its DOM', () => {
    const { container } = render(
      <Tooltip>
        <Tooltip.Trigger>
          <button type="button">composed</button>
        </Tooltip.Trigger>
        <Tooltip.Content className="custom-box">rich body</Tooltip.Content>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'composed' });
    expect(container.firstChild).toBe(trigger);
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip').textContent).toBe('rich body');
    const content = screen.getByRole('tooltip').lastElementChild as HTMLElement;
    expect(content).toHaveClass('custom-box');
  });

  it('composed mode without Content renders the plain trigger and never mounts a panel', () => {
    render(
      <Tooltip>
        <Tooltip.Trigger>
          <button type="button">solo</button>
        </Tooltip.Trigger>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'solo' });
    fireEvent.focus(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(trigger).not.toHaveAttribute('aria-describedby');
  });

  it('props mode with zero children renders nothing', () => {
    const { container } = render(<Tooltip content="hint" />);
    expect(container).toBeEmptyDOMElement();
  });
});
