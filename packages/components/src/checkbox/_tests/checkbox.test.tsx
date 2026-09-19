import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../checkbox';
import type { CheckboxChangePayload } from '../types';

describe('Checkbox size', () => {
  it.each([
    ['xs', 'colox-checkbox--xs'],
    ['sm', 'colox-checkbox--sm'],
    ['md', 'colox-checkbox--md'],
    ['lg', 'colox-checkbox--lg'],
  ] as const)('applies %s on the root label', (size, expectedClass) => {
    render(<Checkbox size={size} />);
    expect(screen.getByRole('checkbox').closest('.colox-checkbox')).toHaveClass(expectedClass);
  });

  it('defaults to md', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox').closest('.colox-checkbox')).toHaveClass(
      'colox-checkbox--md',
    );
  });
});

describe('Checkbox label', () => {
  it('renders children as the label', () => {
    render(<Checkbox>Agree to terms</Checkbox>);
    expect(screen.getByRole('checkbox', { name: 'Agree to terms' })).toBeInTheDocument();
  });

  it('renders without a label span when there are no children', () => {
    const { container } = render(<Checkbox aria-label="Bare" />);
    expect(container.querySelector('.colox-checkbox__label')).toBeNull();
  });
});

describe('Checkbox states', () => {
  it('forwards the native checked state', () => {
    render(<Checkbox defaultChecked />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('marks indeterminate on the native input without checking it', () => {
    render(<Checkbox indeterminate />);
    const input = screen.getByRole('checkbox') as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
    expect(input).not.toBeChecked();
  });

  it('marks invalid with aria-invalid on the control and the modifier on the root', () => {
    render(<Checkbox invalid />);
    const input = screen.getByRole('checkbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.closest('.colox-checkbox')).toHaveClass('colox-checkbox--invalid');
  });

  it('is not marked invalid by default', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).not.toHaveAttribute('aria-invalid');
  });

  it('disables via the native attribute and the root modifier', () => {
    render(<Checkbox disabled />);
    const input = screen.getByRole('checkbox');
    expect(input).toBeDisabled();
    expect(input.closest('.colox-checkbox')).toHaveClass('colox-checkbox--disabled');
  });
});

describe('Checkbox native contract', () => {
  it('points the forwarded ref at the inner native input', () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(<Checkbox ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toHaveClass('colox-checkbox__control');
    expect(ref.current).toBe(container.querySelector('input'));
  });

  it('hands the change over as the family payload', () => {
    const onChange = vi.fn<(checkboxchangepayload: CheckboxChangePayload) => void>();
    render(<Checkbox onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledOnce();
    const [payload] = onChange.mock.calls[0] ?? [];
    expect(payload?.value).toBe(true);
    expect(payload?.event.target.checked).toBe(true);
  });

  it('pins the value when read-only: no change published, DOM reverted', () => {
    const onChange = vi.fn();
    render(<Checkbox readOnly onChange={onChange} />);
    const input = screen.getByRole('checkbox');
    expect(input).toHaveAttribute('aria-readonly', 'true');
    expect(input).not.toBeDisabled();
    fireEvent.click(input);
    expect(onChange).not.toHaveBeenCalled();
    expect(input).not.toBeChecked();
    expect(input.closest('.colox-checkbox')).toHaveClass('colox-checkbox--readonly');
  });

  it('keeps a checked read-only checkbox on and restores indeterminate', () => {
    render(<Checkbox readOnly indeterminate defaultChecked />);
    const input = screen.getByRole('checkbox') as HTMLInputElement;
    fireEvent.click(input);
    expect(input).toBeChecked();
    expect(input.indeterminate).toBe(true);
  });

  it('merges the consumer className and style on the root label', () => {
    const { container } = render(<Checkbox className="custom-class" style={{ marginTop: 8 }} />);
    const root = container.querySelector('.colox-checkbox');
    expect(root).toHaveClass('custom-class');
    expect(root).toHaveStyle({ marginTop: '8px' });
  });
});

describe('Checkbox group participation surface', () => {
  it('forwards name and value so native forms collect the checkbox', () => {
    render(<Checkbox name="fruit" value="apple" aria-label="Apple" />);
    const input = screen.getByRole('checkbox');
    expect(input).toHaveAttribute('name', 'fruit');
    expect(input).toHaveAttribute('value', 'apple');
  });
});
