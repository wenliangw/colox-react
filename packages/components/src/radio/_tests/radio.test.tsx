import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Radio } from '../radio';

describe('Radio size', () => {
  it.each([
    ['xs', 'colox-radio--xs'],
    ['sm', 'colox-radio--sm'],
    ['md', 'colox-radio--md'],
    ['lg', 'colox-radio--lg'],
  ] as const)('applies %s on the root label', (size, expectedClass) => {
    render(<Radio size={size} />);
    expect(screen.getByRole('radio').closest('.colox-radio')).toHaveClass(expectedClass);
  });

  it('defaults to md', () => {
    render(<Radio />);
    expect(screen.getByRole('radio').closest('.colox-radio')).toHaveClass('colox-radio--md');
  });
});

describe('Radio label', () => {
  it('renders children as the label', () => {
    render(<Radio>Agree to terms</Radio>);
    expect(screen.getByRole('radio', { name: 'Agree to terms' })).toBeInTheDocument();
  });

  it('renders without a label span when there are no children', () => {
    const { container } = render(<Radio aria-label="Bare" />);
    expect(container.querySelector('.colox-radio__label')).toBeNull();
  });
});

describe('Radio states', () => {
  it('forwards the native checked state', () => {
    render(<Radio defaultChecked />);
    expect(screen.getByRole('radio')).toBeChecked();
  });

  it('marks invalid with aria-invalid on the control and the modifier on the root', () => {
    render(<Radio invalid />);
    const input = screen.getByRole('radio');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.closest('.colox-radio')).toHaveClass('colox-radio--invalid');
  });

  it('is not marked invalid by default', () => {
    render(<Radio />);
    expect(screen.getByRole('radio')).not.toHaveAttribute('aria-invalid');
  });

  it('disables via the native attribute and the root modifier', () => {
    render(<Radio disabled />);
    const input = screen.getByRole('radio');
    expect(input).toBeDisabled();
    expect(input.closest('.colox-radio')).toHaveClass('colox-radio--disabled');
  });
});

describe('Radio native contract', () => {
  it('points the forwarded ref at the inner native input', () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(<Radio ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toHaveClass('colox-radio__control');
    expect(ref.current).toBe(container.querySelector('input'));
  });

  it('passes the native change event through unchanged', () => {
    const onChange = vi.fn();
    render(<Radio onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio'));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0]?.[0].target.checked).toBe(true);
  });

  it('merges the consumer className and style on the root label', () => {
    const { container } = render(<Radio className="custom-class" style={{ marginTop: 8 }} />);
    const root = container.querySelector('.colox-radio');
    expect(root).toHaveClass('custom-class');
    expect(root).toHaveStyle({ marginTop: '8px' });
  });
});

describe('Radio group participation surface', () => {
  it('forwards name and value so native forms collect the radio', () => {
    render(<Radio name="fruit" value="apple" aria-label="Apple" />);
    const input = screen.getByRole('radio');
    expect(input).toHaveAttribute('name', 'fruit');
    expect(input).toHaveAttribute('value', 'apple');
  });
});
