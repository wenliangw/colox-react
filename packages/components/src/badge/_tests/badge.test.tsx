import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Anchor } from '../../anchor';
import { Positioner } from '../../positioner';
import { Badge } from '..';

describe('Badge', () => {
  it('renders the children content with the base capsule class', () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText('New');
    expect(badge).toHaveClass(
      'colox-badge',
      'colox-badge--solid',
      'colox-badge--gray',
      'colox-badge--md',
    );
  });

  it('applies variant, palette and size classes', () => {
    render(
      <Badge variant="outline" palette="success" size="lg">
        Done
      </Badge>,
    );
    const badge = screen.getByText('Done');
    expect(badge).toHaveClass('colox-badge--outline', 'colox-badge--success', 'colox-badge--lg');
    expect(badge).not.toHaveClass('colox-badge--solid', 'colox-badge--gray', 'colox-badge--md');
  });

  it('passes className, native attributes and ref through', () => {
    const ref = { current: null as HTMLSpanElement | null };
    const { container } = render(
      <Badge className="custom" data-marker="b" ref={ref}>
        x
      </Badge>,
    );
    const badge = container.querySelector('.colox-badge');
    expect(badge).toHaveClass('custom');
    expect(badge).toHaveAttribute('data-marker', 'b');
    expect(ref.current).toBe(badge);
  });
});

describe('Badge.Dot', () => {
  it('renders a solid dot span with the default size and palette', () => {
    render(<Badge.Dot />);
    const dot = document.querySelector('.colox-badge-dot');
    expect(dot).not.toBeNull();
    expect(dot).toHaveClass('colox-badge-dot--md', 'colox-badge--gray');
  });

  it('applies palette and size classes', () => {
    render(<Badge.Dot palette="success" size="sm" />);
    const dot = document.querySelector('.colox-badge-dot');
    expect(dot).toHaveClass('colox-badge--success', 'colox-badge-dot--sm');
  });

  it('passes aria and className through', () => {
    render(<Badge.Dot aria-label="在线" className="status" />);
    const dot = document.querySelector('.colox-badge-dot');
    expect(dot).toHaveClass('status');
    expect(dot).toHaveAttribute('aria-label', '在线');
  });
});

describe('Badge.Count', () => {
  it('renders the count', () => {
    render(<Badge.Count count={5} />);
    expect(screen.getByText('5')).toHaveClass('colox-badge-count');
  });

  it('truncates above the default overflowCount of 99', () => {
    render(<Badge.Count count={128} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('respects a custom overflowCount', () => {
    render(<Badge.Count count={128} overflowCount={9} />);
    expect(screen.getByText('9+')).toBeInTheDocument();
    expect(screen.queryByText('128')).not.toBeInTheDocument();
  });

  it('renders exactly the overflowCount when equal', () => {
    render(<Badge.Count count={99} />);
    expect(screen.getByText('99')).toBeInTheDocument();
  });

  it('hides at zero by default', () => {
    render(<Badge.Count count={0} />);
    expect(document.querySelector('.colox-badge-count')).toBeNull();
  });

  it('shows zero with showZero', () => {
    render(<Badge.Count count={0} showZero />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('applies palette and size classes', () => {
    render(<Badge.Count count={3} palette="error" size="lg" />);
    const count = screen.getByText('3');
    expect(count).toHaveClass('colox-badge-count', 'colox-badge--error', 'colox-badge--lg');
  });
});

describe('Badge.Group + Badge.Item', () => {
  it('renders the seamless capsule container with its segments', () => {
    const { container } = render(
      <Badge.Group>
        <Badge.Item>build</Badge.Item>
        <Badge.Item palette="success">passing</Badge.Item>
      </Badge.Group>,
    );
    const group = container.querySelector('.colox-badge-group');
    expect(group).not.toBeNull();
    expect(group).toHaveClass('colox-badge-group');
    expect(screen.getByText('build')).toHaveClass('colox-badge__item');
    expect(screen.getByText('passing')).toHaveClass('colox-badge__item');
  });

  it('defaults the group to the light corner rounding (no rounded class)', () => {
    const { container } = render(
      <Badge.Group>
        <Badge.Item>x</Badge.Item>
      </Badge.Group>,
    );
    const group = container.querySelector('.colox-badge-group');
    expect(group).not.toHaveClass('colox-badge-group--rounded');
  });

  it('applies the full capsule rounding with rounded', () => {
    const { container } = render(
      <Badge.Group rounded>
        <Badge.Item>x</Badge.Item>
      </Badge.Group>,
    );
    const group = container.querySelector('.colox-badge-group');
    expect(group).toHaveClass('colox-badge-group--rounded');
  });

  it('paints every segment with its own palette and variant', () => {
    render(
      <Badge.Group>
        <Badge.Item>npm</Badge.Item>
        <Badge.Item palette="info">1.0.0</Badge.Item>
        <Badge.Item palette="warning" variant="outline">
          MIT
        </Badge.Item>
      </Badge.Group>,
    );
    const npm = screen.getByText('npm');
    const version = screen.getByText('1.0.0');
    const license = screen.getByText('MIT');
    expect(npm).toHaveClass('colox-badge--gray');
    expect(version).toHaveClass('colox-badge--info');
    expect(license).toHaveClass('colox-badge--warning', 'colox-badge--outline');
  });

  it('applies size to every segment', () => {
    render(
      <Badge.Group>
        <Badge.Item size="sm">a</Badge.Item>
        <Badge.Item size="lg">b</Badge.Item>
      </Badge.Group>,
    );
    expect(screen.getByText('a')).toHaveClass('colox-badge--sm');
    expect(screen.getByText('b')).toHaveClass('colox-badge--lg');
  });

  it('passes className and native attributes through to the group', () => {
    const { container } = render(
      <Badge.Group className="shields" data-marker="g">
        <Badge.Item>x</Badge.Item>
      </Badge.Group>,
    );
    const group = container.querySelector('.colox-badge-group');
    expect(group).toHaveClass('shields');
    expect(group).toHaveAttribute('data-marker', 'g');
  });
});

describe('Badge composition', () => {
  it('mounts all five parts on the root', () => {
    expect(Badge.Dot).toBeDefined();
    expect(Badge.Count).toBeDefined();
    expect(Badge.Group).toBeDefined();
    expect(Badge.Item).toBeDefined();
    expect(Badge).toBeDefined();
  });

  it('anchors a dot to a host corner via Anchor + Positioner', () => {
    const { container } = render(
      <Anchor inline>
        <span>host</span>
        <Positioner placement="bottom-end">
          <Badge.Dot palette="success" />
        </Positioner>
      </Anchor>,
    );
    const dot = container.querySelector('.colox-badge-dot');
    const positioner = container.querySelector('.colox-positioner');
    expect(dot).not.toBeNull();
    expect(positioner).not.toBeNull();
    expect(positioner).toHaveClass('colox-positioner--placement-bottom-end');
    expect(container.querySelector('.colox-anchor')).not.toBeNull();
  });
});
