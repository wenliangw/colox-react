import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Compact } from '..';
import { Button } from '../../button';
import { Input } from '../../input';
import { Select } from '../../select';

describe('Compact', () => {
  it('renders the seam root whose children stay direct and untouched', () => {
    const { container } = render(
      <Compact>
        <Input aria-label="amount" />
        <span className="colox-compact__addon">GB</span>
      </Compact>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass('colox-compact');
    // No wrappers, no cloning: the members are the author's own elements.
    expect(root.children).toHaveLength(2);
    expect(root.children[0]).toHaveClass('colox-input');
    expect(root.children[1]).toHaveClass('colox-compact__addon');
  });

  it('merges the author className and spread attributes onto the root', () => {
    const { container } = render(
      <Compact id="toolbar" data-seam="row" className="mine" style={{ width: 320 }}>
        <Button>Go</Button>
      </Compact>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass('colox-compact', 'mine');
    expect(root).toHaveAttribute('id', 'toolbar');
    expect(root).toHaveAttribute('data-seam', 'row');
    expect(root).toHaveStyle({ width: '320px' });
  });

  it('forwards the ref to the seam root', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Compact ref={ref}>
        <Input aria-label="query" />
      </Compact>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass('colox-compact');
  });

  it('joins mixed controls and a Select prefix without touching their behaviour', () => {
    render(
      <Compact>
        <Select aria-label="country">
          <Select.Option value="86" text="+86" />
        </Select>
        <Input aria-label="number" />
        <Button>Send</Button>
      </Compact>,
    );
    expect(screen.getByLabelText('country')).toBeInTheDocument();
    expect(screen.getByLabelText('number')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  it('inherits the unit size into members, clone-free, via context', () => {
    render(
      <Compact size="sm">
        <Input aria-label="word" />
        <Button>Go</Button>
      </Compact>,
    );
    expect(screen.getByLabelText('word').closest('.colox-input')).toHaveClass('colox-input--sm');
    expect(screen.getByRole('button')).toHaveClass('colox-button--sm');
  });

  it('lets a member’s own size win over the unit default', () => {
    render(
      <Compact size="sm">
        <Input aria-label="word" size="lg" />
        <Button size="xs">Go</Button>
      </Compact>,
    );
    expect(screen.getByLabelText('word').closest('.colox-input')).toHaveClass('colox-input--lg');
    expect(screen.getByRole('button')).toHaveClass('colox-button--xs');
  });

  it('inherits the unit palette into the members that carry one', () => {
    render(
      <Compact palette="error">
        <Button>Go</Button>
      </Compact>,
    );
    expect(screen.getByRole('button')).toHaveClass('colox-button--error');
  });

  it('keeps the divide modifier on the seam root', () => {
    const { container } = render(
      <Compact className="colox-compact--divide">
        <Input aria-label="shared" />
      </Compact>,
    );
    expect(container.firstElementChild).toHaveClass('colox-compact--divide');
  });
});
