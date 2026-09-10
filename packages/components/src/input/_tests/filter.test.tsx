import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '../input';

const digits = /^\d*$/;

describe('Input filterPattern', () => {
  it('rejects uncontrolled input that leaves the pattern language', () => {
    render(<Input aria-label="Code" defaultValue="12" filterPattern={digits} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '12a' } });
    expect(input).toHaveValue('12');
  });

  it('rejects controlled input without notifying the consumer', () => {
    const onChange = vi.fn();
    const Harness = () => {
      const [value, setValue] = useState('12');
      return (
        <Input
          aria-label="Code"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setValue(event.target.value);
          }}
          filterPattern={digits}
        />
      );
    };
    render(<Harness />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '12a' } });
    expect(input).toHaveValue('12');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('accepts input inside the pattern language', () => {
    const onChange = vi.fn();
    render(<Input aria-label="Code" defaultValue="" filterPattern={digits} onChange={onChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '123' } });
    expect(input).toHaveValue('123');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('never rewrites an externally fed controlled value that violates the pattern', () => {
    render(<Input aria-label="Code" value="12a" filterPattern={digits} />);
    expect(screen.getByRole('textbox')).toHaveValue('12a');
  });

  it('lets an explicit clear bypass the pattern', () => {
    const onChange = vi.fn();
    render(
      <Input
        aria-label="Code"
        defaultValue="12"
        clearable
        filterPattern={/^\d+$/}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Clear input' }));
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('passes IME composition events through unfiltered', () => {
    const onChange = vi.fn();
    render(
      <Input
        aria-label="Name"
        defaultValue=""
        filterPattern={/^[a-zA-Z]*$/}
        onCompositionStart={vi.fn()}
        onChange={onChange}
      />,
    );
    const input = screen.getByRole('textbox');
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: 'pinyin' }, nativeEvent: { isComposing: true } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('is inert without a pattern', () => {
    const onChange = vi.fn();
    render(<Input aria-label="Name" defaultValue="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'anything' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
