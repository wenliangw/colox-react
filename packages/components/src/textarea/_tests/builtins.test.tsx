import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Textarea } from '../textarea';

describe('Textarea clearable', () => {
  it('renders a clear button only when clearable', () => {
    const { rerender } = render(<Textarea aria-label="Notes" />);
    expect(screen.queryByRole('button', { name: '清除' })).toBeNull();
    rerender(<Textarea aria-label="Notes" clearable />);
    expect(screen.getByRole('button', { name: '清除' })).toBeInTheDocument();
  });

  it('labels the clear control with the 清除 text', () => {
    render(<Textarea aria-label="Notes" clearable />);
    const clear = screen.getByRole('button', { name: '清除' });
    expect(clear).toHaveTextContent('清除');
    expect(clear).toHaveClass('colox-textarea__clear');
  });

  it('clears an uncontrolled value through onChange', () => {
    const onChange = vi.fn();
    render(<Textarea aria-label="Notes" defaultValue="abc" clearable onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '清除' }));
    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('clears a controlled value through onChange', () => {
    const onChange = vi.fn();
    const Harness = () => {
      const [value, setValue] = useState('abc');
      return (
        <Textarea
          aria-label="Notes"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setValue(event.target.value);
          }}
          clearable
        />
      );
    };
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: '清除' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('');
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('hides the clear button when disabled or readOnly', () => {
    const { rerender } = render(<Textarea aria-label="Notes" clearable disabled />);
    expect(screen.queryByRole('button', { name: '清除' })).toBeNull();
    rerender(<Textarea aria-label="Notes" clearable readOnly />);
    expect(screen.queryByRole('button', { name: '清除' })).toBeNull();
  });
});
