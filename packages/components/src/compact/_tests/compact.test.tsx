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
});
