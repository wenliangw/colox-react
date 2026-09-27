import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Modal } from '..';

describe('Modal compile rules', () => {
  it('throws on duplicate <Modal.Title>', () => {
    expect(() =>
      render(
        <Modal visible>
          <Modal.Title>one</Modal.Title>
          <Modal.Title>two</Modal.Title>
          <Modal.Content>body</Modal.Content>
        </Modal>,
      ),
    ).toThrow(/at most one <Modal.Title>/);
  });

  it('throws on duplicate <Modal.Content>', () => {
    expect(() =>
      render(
        <Modal visible>
          <Modal.Content>one</Modal.Content>
          <Modal.Content>two</Modal.Content>
        </Modal>,
      ),
    ).toThrow(/at most one <Modal.Content>/);
  });

  it('throws on duplicate <Modal.Footer>', () => {
    expect(() =>
      render(
        <Modal visible>
          <Modal.Content>body</Modal.Content>
          <Modal.Footer>one</Modal.Footer>
          <Modal.Footer>two</Modal.Footer>
        </Modal>,
      ),
    ).toThrow(/at most one <Modal.Footer>/);
  });

  it('throws on plain (non-part) children — the modal is purely composed', () => {
    expect(() =>
      render(
        <Modal visible>
          <Modal.Title>title</Modal.Title>
          plain body
        </Modal>,
      ),
    ).toThrow(/put the body in <Modal.Content>/);
  });

  it('throws when a non-part element child is present', () => {
    expect(() =>
      render(
        <Modal visible>
          <Modal.Content>body</Modal.Content>
          <span>stray</span>
        </Modal>,
      ),
    ).toThrow(/put the body in <Modal.Content>/);
  });

  it('accepts fragments transparently', () => {
    expect(() =>
      render(
        <Modal visible>
          <Modal.Title>title</Modal.Title>
          <Modal.Content>body</Modal.Content>
          <Modal.Footer>footer</Modal.Footer>
        </Modal>,
      ),
    ).not.toThrow();
  });
});

describe('Modal render structure', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Modal visible={false}>
        <Modal.Title>title</Modal.Title>
        <Modal.Content>body</Modal.Content>
      </Modal>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the overlay, backdrop and the panel with the three regions', () => {
    render(
      <Modal visible>
        <Modal.Title>title words</Modal.Title>
        <Modal.Content>body words</Modal.Content>
        <Modal.Footer>footer words</Modal.Footer>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('title words')).toBeInTheDocument();
    expect(screen.getByText('body words')).toBeInTheDocument();
    expect(screen.getByText('footer words')).toBeInTheDocument();
    // the backdrop dims behind the panel
    expect(document.querySelector('.colox-overlay__backdrop')).toBeInTheDocument();
  });

  it('sits inside the overlay container class', () => {
    render(
      <Modal visible>
        <Modal.Content>body</Modal.Content>
      </Modal>,
    );
    expect(document.querySelector('.colox-modal')).toBeInTheDocument();
    expect(document.querySelector('.colox-modal__panel')).toBeInTheDocument();
  });

  it('shows the corner close button by default and hides it with showClose={false}', () => {
    const { rerender } = render(
      <Modal visible>
        <Modal.Content>body</Modal.Content>
      </Modal>,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    rerender(
      <Modal visible showClose={false}>
        <Modal.Content>body</Modal.Content>
      </Modal>,
    );
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('hides the backdrop with showMask={false}', () => {
    render(
      <Modal visible showMask={false}>
        <Modal.Content>body</Modal.Content>
      </Modal>,
    );
    expect(document.querySelector('.colox-overlay__backdrop')).not.toBeInTheDocument();
  });

  it('maps the size tier to the design-language width token class', () => {
    const { rerender } = render(
      <Modal visible size="sm">
        <Modal.Content>body</Modal.Content>
      </Modal>,
    );
    expect(document.querySelector('.colox-modal__panel')).toHaveClass(
      'colox-modal__panel--size-sm',
    );
    rerender(
      <Modal visible size="lg">
        <Modal.Content>body</Modal.Content>
      </Modal>,
    );
    expect(document.querySelector('.colox-modal__panel')).toHaveClass(
      'colox-modal__panel--size-lg',
    );
  });

  it('applies the width escape hatch as an inline style override', () => {
    render(
      <Modal visible size="sm" width={420}>
        <Modal.Content>body</Modal.Content>
      </Modal>,
    );
    expect(document.querySelector('.colox-modal__panel')).toHaveStyle({ width: '420px' });
  });

  it('merges the consumer className onto the panel', () => {
    render(
      <Modal visible className="my-modal">
        <Modal.Content>body</Modal.Content>
      </Modal>,
    );
    expect(document.querySelector('.colox-modal__panel')).toHaveClass('my-modal');
  });
});
