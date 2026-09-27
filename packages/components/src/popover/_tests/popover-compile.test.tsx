import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Popover } from '..';

describe('Popover structure', () => {
  it('renders the trigger in place without wrapping it (zero container)', () => {
    const { container } = render(
      <Popover content="body">
        <button type="button">open me</button>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'open me' });
    expect(container.firstChild).toBe(trigger);
  });

  it('injects the dialog wiring: haspopup always, expanded live, controls while open', () => {
    render(
      <Popover content="body">
        <button type="button">ref</button>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'ref' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toHaveAttribute('aria-controls');
    fireEvent.click(trigger);
    const panel = screen.getByRole('dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', panel.id);
    fireEvent.pointerDown(document.body);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).not.toHaveAttribute('aria-controls');
  });

  it('appends the panel id to an existing author aria-controls while open', () => {
    render(
      <Popover content="body">
        <button type="button" aria-controls="own-panel">
          merged
        </button>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'merged' });
    fireEvent.click(trigger);
    const panel = screen.getByRole('dialog');
    expect(trigger.getAttribute('aria-controls')).toBe(`own-panel ${panel.id}`);
  });

  it('renders no panel for an empty content and keeps expanded false', () => {
    render(
      <Popover content="">
        <button type="button">x</button>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'x' });
    fireEvent.click(trigger);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('merges className/style onto the trigger and keeps the author values', () => {
    render(
      <Popover className="root-extra" style={{ color: 'red', marginTop: 4 }} content="body">
        <button type="button" className="own" style={{ color: 'blue' }}>
          styled
        </button>
      </Popover>,
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
      <Popover ref={ref} content="body">
        <button type="button">focus</button>
      </Popover>,
    );
    expect(ref.current).toBe(screen.getByRole('button', { name: 'focus' }));
  });

  it('paints the card structure: arrow first, then the titled content box (props mode)', () => {
    render(
      <Popover title="head" content="body" showArrow placement="top">
        <button type="button">v</button>
      </Popover>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'v' }));
    const panel = screen.getByRole('dialog');
    expect(panel).toHaveClass('colox-popover__panel');
    expect(panel).toHaveClass('colox-popover__panel--arrow');
    expect(panel).toHaveAttribute('tabindex', '-1');
    expect(panel.id).toBeTruthy();
    expect(panel.firstElementChild).toHaveClass('colox-popover__arrow');
    const title = panel.children[1] as HTMLElement;
    expect(title).toHaveClass('colox-popover__title');
    expect(title.textContent).toBe('head');
    expect(panel).toHaveAttribute('aria-labelledby', title.id);
    const content = panel.children[2] as HTMLElement;
    expect(content).toHaveClass('colox-popover__content');
    expect(content.textContent).toBe('body');
  });

  it('drops the arrow word with showArrow={false} and skips the title without one', () => {
    render(
      <Popover content="body" showArrow={false}>
        <button type="button">a</button>
      </Popover>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'a' }));
    const panel = screen.getByRole('dialog');
    expect(panel.className).not.toMatch(/--arrow/);
    expect(panel.firstElementChild).toHaveClass('colox-popover__content');
    expect(panel).not.toHaveAttribute('aria-labelledby');
  });

  it('composed channels: the trigger host renders in place, title and content fill the panel', () => {
    const { container } = render(
      <Popover>
        <Popover.Trigger>
          <button type="button">composed</button>
        </Popover.Trigger>
        <Popover.Title>head</Popover.Title>
        <Popover.Content className="custom-box">rich body</Popover.Content>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'composed' });
    expect(container.firstChild).toBe(trigger);
    fireEvent.click(trigger);
    const panel = screen.getByRole('dialog');
    const title = panel.children[1] as HTMLElement;
    expect(title).toHaveClass('colox-popover__title');
    expect(title.textContent).toBe('head');
    const content = panel.children[2] as HTMLElement;
    expect(content).toHaveClass('colox-popover__content');
    expect(content).toHaveClass('custom-box');
    expect(content.textContent).toBe('rich body');
  });

  it('composed mode without Content renders the plain trigger and never mounts a panel', () => {
    render(
      <Popover>
        <Popover.Trigger>
          <button type="button">solo</button>
        </Popover.Trigger>
        <Popover.Title>head</Popover.Title>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'solo' });
    fireEvent.click(trigger);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('props mode with zero children renders nothing', () => {
    const { container } = render(<Popover content="body" />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('Popover compile walls', () => {
  it('rejects both channels given (content prop + Content part)', () => {
    expect(() =>
      render(
        <Popover content="props">
          <Popover.Trigger>
            <button type="button">t</button>
          </Popover.Trigger>
          <Popover.Content>composed</Popover.Content>
        </Popover>,
      ),
    ).toThrow('Provide either the `content` prop or a <Popover.Content>');
  });

  it('rejects both title channels given (title prop + Title part)', () => {
    expect(() =>
      render(
        <Popover title="props">
          <Popover.Trigger>
            <button type="button">t</button>
          </Popover.Trigger>
          <Popover.Content>composed</Popover.Content>
          <Popover.Title>composed</Popover.Title>
        </Popover>,
      ),
    ).toThrow('Provide either the `title` prop or a <Popover.Title>');
  });

  it('rejects a composed mode without Trigger', () => {
    expect(() =>
      render(
        <Popover>
          <Popover.Content>body</Popover.Content>
        </Popover>,
      ),
    ).toThrow('The composed Popover channels require a <Popover.Trigger>');
  });

  it('rejects duplicated Triggers', () => {
    expect(() =>
      render(
        <Popover>
          <Popover.Trigger>
            <button type="button">a</button>
          </Popover.Trigger>
          <Popover.Trigger>
            <button type="button">b</button>
          </Popover.Trigger>
        </Popover>,
      ),
    ).toThrow('Popover accepts exactly one <Popover.Trigger>');
  });

  it('rejects a Trigger wrapping multiple element children', () => {
    expect(() =>
      render(
        <Popover>
          <Popover.Trigger>
            <button type="button">a</button>
            <button type="button">b</button>
          </Popover.Trigger>
        </Popover>,
      ),
    ).toThrow('<Popover.Trigger> requires exactly one element child');
  });

  it('rejects a props mode with several trigger children', () => {
    expect(() =>
      render(
        <Popover content="body">
          <button type="button">a</button>
          <button type="button">b</button>
        </Popover>,
      ),
    ).toThrow('Popover accepts exactly one trigger element child');
  });
});
