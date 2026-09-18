import { createRef } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Textarea } from '../textarea';

describe('Textarea shell contract', () => {
  it('points the forwarded ref at the inner native textarea', () => {
    const ref = createRef<HTMLTextAreaElement>();
    const { container } = render(<Textarea aria-label="Notes" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    expect(ref.current).toHaveClass('colox-textarea-control');
    expect(ref.current).toBe(container.querySelector('textarea'));
  });

  it('lands consumer className and style on the shell', () => {
    const { container } = render(
      <Textarea aria-label="Notes" className="custom-class" style={{ marginTop: 8 }} />,
    );
    const shell = container.querySelector('.colox-textarea');
    expect(shell).toHaveClass('custom-class');
    expect(shell).toHaveStyle({ marginTop: '8px' });
  });

  it('renders the clear control inside the in-flow footer pill', () => {
    const { container } = render(<Textarea aria-label="Notes" clearable />);
    const pill = container.querySelector('.colox-textarea__pill');
    expect(pill?.querySelector('button')).toHaveClass('colox-textarea__clear');
    expect(pill?.querySelector('button')).toHaveTextContent('清除');
  });
});
