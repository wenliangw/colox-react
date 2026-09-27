import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Drawer } from '..';

describe('Drawer compile rules', () => {
  it('throws on duplicate <Drawer.Title>', () => {
    expect(() =>
      render(
        <Drawer visible>
          <Drawer.Title>one</Drawer.Title>
          <Drawer.Title>two</Drawer.Title>
          <Drawer.Content>body</Drawer.Content>
        </Drawer>,
      ),
    ).toThrow(/at most one <Drawer.Title>/);
  });

  it('throws on duplicate <Drawer.Content>', () => {
    expect(() =>
      render(
        <Drawer visible>
          <Drawer.Content>one</Drawer.Content>
          <Drawer.Content>two</Drawer.Content>
        </Drawer>,
      ),
    ).toThrow(/at most one <Drawer.Content>/);
  });

  it('throws on duplicate <Drawer.Footer>', () => {
    expect(() =>
      render(
        <Drawer visible>
          <Drawer.Content>body</Drawer.Content>
          <Drawer.Footer>one</Drawer.Footer>
          <Drawer.Footer>two</Drawer.Footer>
        </Drawer>,
      ),
    ).toThrow(/at most one <Drawer.Footer>/);
  });

  it('throws on plain (non-part) children — the drawer is purely composed', () => {
    expect(() =>
      render(
        <Drawer visible>
          <Drawer.Title>title</Drawer.Title>
          plain body
        </Drawer>,
      ),
    ).toThrow(/put the body in <Drawer.Content>/);
  });

  it('throws when a non-part element child is present', () => {
    expect(() =>
      render(
        <Drawer visible>
          <Drawer.Content>body</Drawer.Content>
          <span>stray</span>
        </Drawer>,
      ),
    ).toThrow(/put the body in <Drawer.Content>/);
  });

  it('accepts fragments transparently', () => {
    expect(() =>
      render(
        <Drawer visible>
          <Drawer.Title>title</Drawer.Title>
          <Drawer.Content>body</Drawer.Content>
          <Drawer.Footer>footer</Drawer.Footer>
        </Drawer>,
      ),
    ).not.toThrow();
  });
});

describe('Drawer render structure', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Drawer visible={false}>
        <Drawer.Title>title</Drawer.Title>
        <Drawer.Content>body</Drawer.Content>
      </Drawer>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the overlay, backdrop and the panel with the three regions', () => {
    render(
      <Drawer visible>
        <Drawer.Title>title words</Drawer.Title>
        <Drawer.Content>body words</Drawer.Content>
        <Drawer.Footer>footer words</Drawer.Footer>
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('title words')).toBeInTheDocument();
    expect(screen.getByText('body words')).toBeInTheDocument();
    expect(screen.getByText('footer words')).toBeInTheDocument();
    // the backdrop dims behind the panel
    expect(document.querySelector('.colox-overlay__backdrop')).toBeInTheDocument();
  });

  it('sits inside the overlay container class and anchors by the default direction', () => {
    render(
      <Drawer visible>
        <Drawer.Content>body</Drawer.Content>
      </Drawer>,
    );
    expect(document.querySelector('.colox-drawer')).toBeInTheDocument();
    const panel = document.querySelector('.colox-drawer__panel');
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveClass('colox-drawer__panel--direction-right');
  });

  it('maps the direction to the anchoring class', () => {
    const { rerender } = render(
      <Drawer visible direction="left">
        <Drawer.Content>body</Drawer.Content>
      </Drawer>,
    );
    expect(document.querySelector('.colox-drawer__panel')).toHaveClass(
      'colox-drawer__panel--direction-left',
    );
    rerender(
      <Drawer visible direction="top">
        <Drawer.Content>body</Drawer.Content>
      </Drawer>,
    );
    expect(document.querySelector('.colox-drawer__panel')).toHaveClass(
      'colox-drawer__panel--direction-top',
    );
    rerender(
      <Drawer visible direction="bottom">
        <Drawer.Content>body</Drawer.Content>
      </Drawer>,
    );
    expect(document.querySelector('.colox-drawer__panel')).toHaveClass(
      'colox-drawer__panel--direction-bottom',
    );
  });

  it('shows the corner close button by default and hides it with showClose={false}', () => {
    const { rerender } = render(
      <Drawer visible>
        <Drawer.Content>body</Drawer.Content>
      </Drawer>,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    rerender(
      <Drawer visible showClose={false}>
        <Drawer.Content>body</Drawer.Content>
      </Drawer>,
    );
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('hides the backdrop with showMask={false}', () => {
    render(
      <Drawer visible showMask={false}>
        <Drawer.Content>body</Drawer.Content>
      </Drawer>,
    );
    expect(document.querySelector('.colox-overlay__backdrop')).not.toBeInTheDocument();
  });

  it('maps the size tier to the content-space class', () => {
    const { rerender } = render(
      <Drawer visible size="sm">
        <Drawer.Content>body</Drawer.Content>
      </Drawer>,
    );
    expect(document.querySelector('.colox-drawer__panel')).toHaveClass(
      'colox-drawer__panel--size-sm',
    );
    rerender(
      <Drawer visible size="lg">
        <Drawer.Content>body</Drawer.Content>
      </Drawer>,
    );
    expect(document.querySelector('.colox-drawer__panel')).toHaveClass(
      'colox-drawer__panel--size-lg',
    );
  });

  it('applies the width escape hatch as an inline style override for vertical panels', () => {
    render(
      <Drawer visible direction="right" size="sm" width={420}>
        <Drawer.Content>body</Drawer.Content>
      </Drawer>,
    );
    expect(document.querySelector('.colox-drawer__panel')).toHaveStyle({ width: '420px' });
  });

  it('applies the height escape hatch as an inline style override for horizontal panels', () => {
    render(
      <Drawer visible direction="top" size="sm" height={260}>
        <Drawer.Content>body</Drawer.Content>
      </Drawer>,
    );
    expect(document.querySelector('.colox-drawer__panel')).toHaveStyle({ height: '260px' });
  });

  it('merges the consumer className onto the panel', () => {
    render(
      <Drawer visible className="my-drawer">
        <Drawer.Content>body</Drawer.Content>
      </Drawer>,
    );
    expect(document.querySelector('.colox-drawer__panel')).toHaveClass('my-drawer');
  });
});
