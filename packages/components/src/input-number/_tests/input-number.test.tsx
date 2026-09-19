import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InputNumber } from '../input-number';
import type { InputNumberChangePayload } from '../types';

const renderInputNumber = (props: React.ComponentProps<typeof InputNumber>) =>
  render(<InputNumber aria-label="Amount" {...props} />);

const getInput = () => screen.getByRole('spinbutton') as HTMLInputElement;
const getUp = () => screen.getByRole('button', { name: 'Increase value' });
const getDown = () => screen.getByRole('button', { name: 'Decrease value' });

const lastChange = (onChange: ReturnType<typeof vi.fn>) =>
  onChange.mock.lastCall?.[0] as InputNumberChangePayload | undefined;

/** Types `text` keystroke by keystroke, firing one change per step. */
const typeText = (input: HTMLInputElement, text: string) => {
  for (const char of text) {
    const next = input.value + char;
    fireEvent.change(input, { target: { value: next } });
  }
};

describe('InputNumber contract', () => {
  it('renders a bare text input with decimal keyboard and spinbutton role', () => {
    renderInputNumber({});
    const input = getInput();
    expect(input.type).toBe('text');
    expect(input.inputMode).toBe('decimal');
  });

  it('mirrors min/max/current into the aria value contract', () => {
    renderInputNumber({ min: 0, max: 10, value: 4 });
    const input = getInput();
    expect(input).toHaveAttribute('aria-valuemin', '0');
    expect(input).toHaveAttribute('aria-valuemax', '10');
    expect(input).toHaveAttribute('aria-valuenow', '4');
  });

  it('omits aria-valuenow for an empty value', () => {
    renderInputNumber({ value: null });
    expect(getInput()).not.toHaveAttribute('aria-valuenow');
  });

  it('marks invalid and disabled on root and input', () => {
    renderInputNumber({ invalid: true, disabled: true });
    const root = document.querySelector('.colox-input-number');
    expect(root).toHaveClass('colox-input-number--invalid', 'colox-input-number--disabled');
    expect(getInput()).toHaveAttribute('aria-invalid', 'true');
    expect(getInput()).toBeDisabled();
    expect(getUp()).toBeDisabled();
  });

  it('renders the default md tier and merges className/style onto the root', () => {
    const { container } = renderInputNumber({ className: 'custom', style: { width: 200 } });
    const root = container.firstElementChild;
    expect(root).toHaveClass('colox-input-number', 'colox-input-number--md', 'custom');
    expect(root).toHaveStyle({ width: '200px' });
  });

  it('hides the steppers when readOnly', () => {
    renderInputNumber({ readOnly: true });
    expect(screen.queryByRole('button', { name: 'Increase value' })).toBeNull();
    expect(getInput()).toHaveAttribute('readonly');
  });

  it('exposes the native input as ref', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<InputNumber ref={ref} aria-label="Amount" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('passes native attributes through to the input', () => {
    renderInputNumber({ id: 'amount', name: 'amount', placeholder: '0', autoComplete: 'off' });
    const input = getInput();
    expect(input).toHaveAttribute('id', 'amount');
    expect(input).toHaveAttribute('name', 'amount');
    expect(input).toHaveAttribute('placeholder', '0');
    expect(input).toHaveAttribute('autocomplete', 'off');
  });
});

describe('InputNumber draft and commit', () => {
  it('commits the parsed number as the draft resolves', () => {
    const onChange = vi.fn();
    renderInputNumber({ onChange });
    typeText(getInput(), '42');
    const last = lastChange(onChange);
    expect(last?.value).toBe(42);
    expect(last?.event.target).toBe(getInput());
    expect(getInput()).toHaveValue('42');
  });

  it('does not commit partial drafts — the dot state notifies nothing', () => {
    const onChange = vi.fn();
    renderInputNumber({ onChange });
    const input = getInput();
    typeText(input, '42');
    fireEvent.change(input, { target: { value: '42.' } });
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(getInput()).toHaveValue('42.');
  });

  it('a bare minus is a silent draft', () => {
    const onChange = vi.fn();
    renderInputNumber({ onChange });
    const input = getInput();
    fireEvent.change(input, { target: { value: '-' } });
    expect(onChange).not.toHaveBeenCalled();
    expect(getInput()).toHaveValue('-');
  });

  it('commits a leading-dot fraction', () => {
    const onChange = vi.fn();
    renderInputNumber({ onChange });
    typeText(getInput(), '.5');
    expect(lastChange(onChange)?.value).toBe(0.5);
  });

  it('clearing commits null', () => {
    const onChange = vi.fn();
    renderInputNumber({ defaultValue: 42, onChange });
    fireEvent.change(getInput(), { target: { value: '' } });
    expect(lastChange(onChange)?.value).toBeNull();
    expect(getInput()).toHaveValue('');
  });

  it('rejects non-decimal characters and keeps the previous draft', () => {
    const onChange = vi.fn();
    renderInputNumber({ onChange });
    typeText(getInput(), '1e');
    expect(getInput()).toHaveValue('1');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('rejects a pasted exponent wholesale — the committed draft stays', () => {
    const onChange = vi.fn();
    renderInputNumber({ defaultValue: 7, onChange });
    fireEvent.change(getInput(), { target: { value: '1e5' } });
    expect(getInput()).toHaveValue('7');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('skips same-value commits while typing zeros', () => {
    const onChange = vi.fn();
    renderInputNumber({ onChange });
    typeText(getInput(), '007');
    const values = onChange.mock.calls.map(([payload]) => payload.value);
    expect(values).toEqual([0, 7]);
  });

  it('rolls a partial draft back to the committed value on blur', () => {
    const onChange = vi.fn();
    renderInputNumber({ defaultValue: 7, onChange });
    const input = getInput();
    fireEvent.change(input, { target: { value: '7.' } });
    fireEvent.blur(input);
    expect(getInput()).toHaveValue('7');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('rolls a lone minus back to empty on blur', () => {
    renderInputNumber({});
    const input = getInput();
    fireEvent.change(input, { target: { value: '-' } });
    fireEvent.blur(input);
    expect(getInput()).toHaveValue('');
  });

  it('normalizes the display on blur — typed padding zeros shrink', () => {
    renderInputNumber({ defaultValue: 7, min: 0, max: 100 });
    const input = getInput();
    fireEvent.change(input, { target: { value: '007' } });
    fireEvent.blur(input);
    expect(getInput()).toHaveValue('7');
  });

  it('clamps a below-min value on blur and notifies', () => {
    const onChange = vi.fn();
    renderInputNumber({ defaultValue: 5, min: 10, onChange });
    const input = getInput();
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(getInput()).toHaveValue('10');
    expect(lastChange(onChange)?.value).toBe(10);
  });

  it('clamps an above-max typed value on blur and notifies', () => {
    const onChange = vi.fn();
    renderInputNumber({ min: 0, max: 10, onChange });
    typeText(getInput(), '15');
    fireEvent.blur(getInput());
    expect(getInput()).toHaveValue('10');
    expect(lastChange(onChange)?.value).toBe(10);
  });

  it('seeds uncontrolled from defaultValue and mirrors a null value as empty', () => {
    const { rerender } = renderInputNumber({ defaultValue: 7 });
    expect(getInput()).toHaveValue('7');
    rerender(<InputNumber aria-label="Amount" value={null} />);
    expect(getInput()).toHaveValue('');
  });

  it('resyncs the draft when the controlled value moves from outside', () => {
    const onChange = vi.fn();
    const { rerender } = renderInputNumber({ value: 3, onChange });
    fireEvent.change(getInput(), { target: { value: '4' } });
    expect(getInput()).toHaveValue('4');
    rerender(<InputNumber aria-label="Amount" value={5} onChange={onChange} />);
    expect(getInput()).toHaveValue('5');
  });
});

describe('InputNumber stepping', () => {
  it('steps up and down by one with the built-in steppers', () => {
    const onChange = vi.fn();
    renderInputNumber({ defaultValue: 5, onChange });
    fireEvent.click(getUp());
    expect(getInput()).toHaveValue('6');
    expect(lastChange(onChange)?.value).toBe(6);
    fireEvent.click(getDown());
    expect(getInput()).toHaveValue('5');
  });

  it('is a silent no-op at the span bounds', () => {
    const onChange = vi.fn();
    renderInputNumber({ defaultValue: 5, max: 5, onChange });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(getUp());
    expect(onChange).not.toHaveBeenCalled();
    expect(getInput()).toHaveValue('5');
  });

  it('carries the step decimal precision without float dust', () => {
    const onChange = vi.fn();
    renderInputNumber({ defaultValue: 0, step: 0.01, onChange });
    fireEvent.click(getUp());
    fireEvent.click(getUp());
    expect(lastChange(onChange)?.value).toBe(0.02);
    expect(getInput()).toHaveValue('0.02');
  });

  it('steps from an empty value anchored at a positive min', () => {
    const onChange = vi.fn();
    renderInputNumber({ min: 5, onChange });
    fireEvent.click(getUp());
    expect(lastChange(onChange)?.value).toBe(6);
    expect(getInput()).toHaveValue('6');
  });

  it('steps on Arrow Up/Down and still runs the consumer key handler', () => {
    const onChange = vi.fn();
    const onKeyDown = vi.fn();
    renderInputNumber({ defaultValue: 5, onChange, onKeyDown });
    fireEvent.keyDown(getInput(), { key: 'ArrowUp' });
    expect(getInput()).toHaveValue('6');
    fireEvent.keyDown(getInput(), { key: 'ArrowDown' });
    fireEvent.keyDown(getInput(), { key: 'ArrowDown' });
    expect(getInput()).toHaveValue('4');
    expect(onKeyDown).toHaveBeenCalledTimes(3);
  });

  it('steps over a pending partial draft with the committed value', () => {
    const onChange = vi.fn();
    renderInputNumber({ defaultValue: 7, onChange });
    const input = getInput();
    fireEvent.change(input, { target: { value: '7.' } });
    fireEvent.click(getUp());
    expect(getInput()).toHaveValue('8');
    expect(lastChange(onChange)?.value).toBe(8);
  });

  it('falls back to step 1 when the step is not positive', () => {
    renderInputNumber({ defaultValue: 0, step: 0 });
    fireEvent.click(getUp());
    expect(getInput()).toHaveValue('1');
  });
});
