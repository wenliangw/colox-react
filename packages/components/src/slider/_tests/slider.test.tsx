import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Slider } from '../slider';

describe('Slider size', () => {
  it.each([
    ['xs', 'colox-slider--xs'],
    ['sm', 'colox-slider--sm'],
    ['md', 'colox-slider--md'],
    ['lg', 'colox-slider--lg'],
  ] as const)('applies %s on the root shell', (size, expectedClass) => {
    render(<Slider size={size} />);
    expect(screen.getByRole('slider').closest('.colox-slider')).toHaveClass(expectedClass);
  });

  it('defaults to md', () => {
    render(<Slider />);
    expect(screen.getByRole('slider').closest('.colox-slider')).toHaveClass('colox-slider--md');
  });
});

describe('Slider palette', () => {
  it.each([
    ['primary', 'colox-slider--primary'],
    ['gray', 'colox-slider--gray'],
    ['info', 'colox-slider--info'],
    ['error', 'colox-slider--error'],
    ['warning', 'colox-slider--warning'],
    ['success', 'colox-slider--success'],
  ] as const)('applies the %s palette class on the root shell', (palette, expectedClass) => {
    render(<Slider palette={palette} />);
    expect(screen.getByRole('slider').closest('.colox-slider')).toHaveClass(expectedClass);
  });

  it('defaults to primary', () => {
    render(<Slider />);
    expect(screen.getByRole('slider').closest('.colox-slider')).toHaveClass(
      'colox-slider--primary',
    );
  });
});

describe('Slider native contract', () => {
  it('renders the control as a native range input', () => {
    render(<Slider />);
    const input = screen.getByRole('slider');
    expect(input).toHaveAttribute('type', 'range');
    expect(input).toHaveClass('colox-slider__control');
  });

  it('carries the native min/max/step defaults', () => {
    render(<Slider />);
    const input = screen.getByRole('slider') as HTMLInputElement;
    expect(input.min).toBe('0');
    expect(input.max).toBe('100');
    expect(input.step).toBe('1');
  });

  it('points the forwarded ref at the inner native input', () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(<Slider ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toBe(container.querySelector('input'));
  });

  it('forwards the consumer aria label onto the control', () => {
    render(<Slider aria-label="Volume" />);
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument();
  });

  it('merges the consumer className and style on the root shell', () => {
    const { container } = render(<Slider className="custom-class" style={{ marginTop: 8 }} />);
    const root = container.querySelector('.colox-slider');
    expect(root).toHaveClass('custom-class');
    expect(root).toHaveStyle({ marginTop: '8px' });
  });

  it('marks disabled via the native attribute and the root modifier', () => {
    render(<Slider disabled />);
    const input = screen.getByRole('slider');
    expect(input).toBeDisabled();
    expect(input.closest('.colox-slider')).toHaveClass('colox-slider--disabled');
  });
});

describe('Slider value wiring', () => {
  it('seeds the uncontrolled value from defaultValue', () => {
    render(<Slider defaultValue={30} />);
    expect((screen.getByRole('slider') as HTMLInputElement).value).toBe('30');
  });

  it('writes the controlled value onto the input and the progress variable', () => {
    render(<Slider value={60} />);
    const input = screen.getByRole('slider') as HTMLInputElement;
    expect(input.value).toBe('60');
    expect(input.style.getPropertyValue('--colox-slider-progress')).toBe('60%');
  });

  it('derives the initial progress from the uncontrolled value', () => {
    render(<Slider defaultValue={30} min={0} max={100} />);
    expect(
      (screen.getByRole('slider') as HTMLInputElement).style.getPropertyValue(
        '--colox-slider-progress',
      ),
    ).toBe('30%');
  });

  it('publishes the change payload as { event, value } with a parsed number', () => {
    const onChange = vi.fn();
    render(<Slider onChange={onChange} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '42' } });
    expect(onChange).toHaveBeenCalledOnce();
    const payload = onChange.mock.calls[0]?.[0] as { event: unknown; value: number };
    expect(payload?.value).toBe(42);
    expect(payload?.event).toBeDefined();
  });

  it('shifts past the min when min/max collapse into an empty span', () => {
    render(<Slider value={50} min={50} max={50} />);
    expect(
      (screen.getByRole('slider') as HTMLInputElement).style.getPropertyValue(
        '--colox-slider-progress',
      ),
    ).toBe('0%');
  });
});

describe('Slider marks', () => {
  it('renders ticks with labels at their value offsets', () => {
    const { container } = render(
      <Slider marks={{ 0: 'start', 50: 'middle', 100: 'end' }} defaultValue={20} />,
    );
    const marks = container.querySelectorAll('.colox-slider__mark');
    expect(marks).toHaveLength(3);
    expect(marks[0]).toHaveStyle({ left: '0%' });
    expect(marks[1]).toHaveStyle({ left: '50%' });
    expect(marks[2]).toHaveStyle({ left: '100%' });
    expect(container.querySelectorAll('.colox-slider__mark-label')).toHaveLength(3);
  });

  it('renders a bare tick for null/false labels', () => {
    const { container } = render(
      <Slider marks={{ 0: null, 50: false, 100: 'end' }} defaultValue={20} />,
    );
    expect(container.querySelectorAll('.colox-slider__mark')).toHaveLength(3);
    expect(container.querySelectorAll('.colox-slider__mark-label')).toHaveLength(1);
  });

  it('snaps the edge labels inside the strip ends', () => {
    const { container } = render(<Slider marks={{ 0: 'start', 100: 'end' }} defaultValue={20} />);
    const marks = container.querySelectorAll('.colox-slider__mark');
    expect(marks[0]).toHaveClass('colox-slider__mark--first');
    expect(marks[1]).toHaveClass('colox-slider__mark--last');
  });

  it('keeps a single mark unsnapped', () => {
    const { container } = render(<Slider marks={{ 50: 'middle' }} defaultValue={20} />);
    expect(container.querySelector('.colox-slider__mark')).not.toHaveClass(
      'colox-slider__mark--first',
    );
  });

  it('renders no marks layer without the marks prop', () => {
    const { container } = render(<Slider />);
    expect(container.querySelector('.colox-slider__marks')).toBeNull();
  });
});
