import { createRef } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from '../input';
import { IconEye } from '@colox/icons';

describe('Input shell contract', () => {
  it('points the forwarded ref at the inner native input', () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(<Input aria-label="Name" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toHaveClass('colox-input-control');
    expect(ref.current).toBe(container.querySelector('input'));
  });

  it('lands consumer className and style on the shell', () => {
    const { container } = render(
      <Input aria-label="Name" className="custom-class" style={{ marginTop: 8 }} />,
    );
    const shell = container.querySelector('.colox-input');
    expect(shell).toHaveClass('custom-class');
    expect(shell).toHaveStyle({ marginTop: '8px' });
  });

  it('renders built-in controls after consumer trailing content', () => {
    const { container } = render(
      <Input aria-label="Name" clearable trailing={<IconEye data-testid="slot-icon" />} />,
    );
    const trailing = container.querySelector('.colox-input__trailing');
    const children = trailing?.children ?? [];
    expect(children).toHaveLength(2);
    expect(children[0]?.getAttribute('data-testid')).toBe('slot-icon');
    expect(children[1]?.getAttribute('aria-label')).toBe('Clear input');
  });
});
