import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Textarea } from '../textarea';

describe('Textarea state', () => {
  it('renders a native textarea inside the shell', () => {
    render(<Textarea aria-label="Notes" />);
    const textarea = screen.getByRole('textbox', { name: /notes/i });
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveClass('colox-textarea-control');
    expect(textarea.closest('.colox-textarea')).not.toBeNull();
  });

  it('marks invalid textareas: aria on the control, class on the shell', () => {
    render(<Textarea aria-label="Notes" invalid />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea.closest('.colox-textarea')).toHaveClass('colox-textarea--invalid');
  });

  it('is not marked invalid by default', () => {
    render(<Textarea aria-label="Notes" />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('marks the shell disabled state', () => {
    render(<Textarea aria-label="Notes" disabled />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
    expect(textarea.closest('.colox-textarea')).toHaveClass('colox-textarea--disabled');
  });

  it('forwards extra attributes to the inner control', () => {
    render(<Textarea data-testid="notes" rows={3} placeholder="Write something…" required />);
    const textarea = screen.getByTestId('notes');
    expect(textarea).toHaveAttribute('rows', '3');
    expect(textarea).toHaveAttribute('placeholder', 'Write something…');
    expect(textarea).toBeRequired();
  });
});
