import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from '../switch';
import type { SwitchChangePayload } from '../types';

describe('Switch size', () => {
  it.each([
    ['xs', 'colox-switch--xs'],
    ['sm', 'colox-switch--sm'],
    ['md', 'colox-switch--md'],
    ['lg', 'colox-switch--lg'],
  ] as const)('applies %s on the root label', (size, expectedClass) => {
    render(<Switch size={size} />);
    expect(screen.getByRole('switch').closest('.colox-switch')).toHaveClass(expectedClass);
  });

  it('defaults to md', () => {
    render(<Switch />);
    expect(screen.getByRole('switch').closest('.colox-switch')).toHaveClass('colox-switch--md');
  });
});

describe('Switch palette', () => {
  it.each([
    ['primary', 'colox-switch--primary'],
    ['gray', 'colox-switch--gray'],
    ['info', 'colox-switch--info'],
    ['error', 'colox-switch--error'],
    ['warning', 'colox-switch--warning'],
    ['success', 'colox-switch--success'],
  ] as const)('applies the %s palette class on the root label', (palette, expectedClass) => {
    render(<Switch palette={palette} />);
    expect(screen.getByRole('switch').closest('.colox-switch')).toHaveClass(expectedClass);
  });

  it('defaults to primary', () => {
    render(<Switch defaultChecked />);
    expect(screen.getByRole('switch').closest('.colox-switch')).toHaveClass(
      'colox-switch--primary',
    );
  });
});

describe('Switch label', () => {
  it('renders children as the label', () => {
    render(<Switch>Dark mode</Switch>);
    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBeInTheDocument();
  });

  it('renders without a label span when there are no children', () => {
    const { container } = render(<Switch aria-label="Bare" />);
    expect(container.querySelector('.colox-switch__label')).toBeNull();
  });
});

describe('Switch states', () => {
  it('forwards the native checked state', () => {
    render(<Switch defaultChecked />);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('toggles off by default', () => {
    render(<Switch />);
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('marks invalid with aria-invalid on the control and the modifier on the root', () => {
    render(<Switch invalid />);
    const input = screen.getByRole('switch');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.closest('.colox-switch')).toHaveClass('colox-switch--invalid');
  });

  it('is not marked invalid by default', () => {
    render(<Switch />);
    expect(screen.getByRole('switch')).not.toHaveAttribute('aria-invalid');
  });

  it('disables via the native attribute and the root modifier', () => {
    render(<Switch disabled />);
    const input = screen.getByRole('switch');
    expect(input).toBeDisabled();
    expect(input.closest('.colox-switch')).toHaveClass('colox-switch--disabled');
  });

  it('pins the value when read-only: no change published, DOM reverted', () => {
    const onChange = vi.fn();
    render(<Switch readOnly onChange={onChange} />);
    const input = screen.getByRole('switch');
    expect(input).toHaveAttribute('aria-readonly', 'true');
    expect(input).not.toBeDisabled();
    fireEvent.click(input);
    expect(onChange).not.toHaveBeenCalled();
    expect(input).not.toBeChecked();
    expect(input.closest('.colox-switch')).toHaveClass('colox-switch--readonly');
  });

  it('keeps a checked read-only switch on', () => {
    const onChange = vi.fn();
    render(<Switch readOnly defaultChecked onChange={onChange} />);
    const input = screen.getByRole('switch');
    fireEvent.click(input);
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toBeChecked();
  });
});

describe('Switch native contract', () => {
  it('dresses the native checkbox input with the switch role', () => {
    render(<Switch />);
    const input = screen.getByRole('switch');
    expect(input).toHaveAttribute('type', 'checkbox');
    expect(input).toHaveClass('colox-switch__control');
  });

  it('points the forwarded ref at the inner native input', () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(<Switch ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toBe(container.querySelector('input'));
  });

  it('hands the change over as the family payload', () => {
    const onChange = vi.fn<(switchchangepayload: SwitchChangePayload) => void>();
    render(<Switch onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledOnce();
    const [payload] = onChange.mock.calls[0] ?? [];
    expect(payload?.value).toBe(true);
    expect(payload?.event.target.checked).toBe(true);
  });

  it('forwards name and value so native forms collect the switch', () => {
    render(<Switch name="feature" value="dark-mode" aria-label="Dark mode" />);
    const input = screen.getByRole('switch');
    expect(input).toHaveAttribute('name', 'feature');
    expect(input).toHaveAttribute('value', 'dark-mode');
  });

  it('merges the consumer className and style on the root label', () => {
    const { container } = render(<Switch className="custom-class" style={{ marginTop: 8 }} />);
    const root = container.querySelector('.colox-switch');
    expect(root).toHaveClass('custom-class');
    expect(root).toHaveStyle({ marginTop: '8px' });
  });
});
