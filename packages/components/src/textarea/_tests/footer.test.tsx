import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Textarea } from '../textarea';

describe('Textarea footer', () => {
  it('has no footer bar when count, clear and the handle are all off', () => {
    const { container } = render(<Textarea aria-label="Notes" autoSize={false} />);
    expect(container.querySelector('.colox-textarea__footer')).toBeNull();
  });

  it('renders the bare footer for the default growth world — handle only, no pill', () => {
    const { container } = render(<Textarea aria-label="Notes" />);
    const footer = container.querySelector('.colox-textarea__footer');
    expect(footer).not.toBeNull();
    expect(footer?.querySelectorAll('button')).toHaveLength(1);
    expect(footer?.querySelector('.colox-textarea__pill')).toBeNull();
  });

  it('shows the bare count without maxLength and updates on input (uncontrolled)', () => {
    render(<Textarea aria-label="Notes" showCount defaultValue="abc" />);
    expect(screen.getByText('3')).toBeInTheDocument();
    fireEvent.input(screen.getByRole('textbox'), { target: { value: 'abcd' } });
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('shows the n / max form with maxLength', () => {
    render(<Textarea aria-label="Notes" showCount maxLength={200} defaultValue="abc" />);
    expect(screen.getByText('3 / 200')).toBeInTheDocument();
  });

  it('derives the controlled count from the value prop', () => {
    const onChange = () => {};
    const { rerender } = render(
      <Textarea aria-label="Notes" showCount value="abc" onChange={onChange} />,
    );
    expect(screen.getByText('3')).toBeInTheDocument();
    rerender(<Textarea aria-label="Notes" showCount value="abcd" onChange={onChange} />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('packs the count, divider and clear text into one pill with the handle at the end', () => {
    const { container } = render(
      <Textarea aria-label="Notes" showCount maxLength={10} clearable defaultValue="abc" />,
    );
    const children = [...(container.querySelector('.colox-textarea__footer')?.children ?? [])];
    expect(children).toHaveLength(3);
    expect(children[0]).toHaveClass('colox-textarea__pill');
    expect(children[1]).toHaveClass('colox-textarea__spacer');
    expect(children[2]).toHaveClass('colox-textarea__resize');
    const pillParts = [...(children[0].querySelectorAll(':scope > *') ?? [])];
    expect(pillParts).toHaveLength(3);
    expect(pillParts[0]).toHaveClass('colox-textarea__count');
    expect(pillParts[1]).toHaveClass('colox-textarea__separator');
    expect(pillParts[2]).toHaveClass('colox-textarea__clear');
  });

  it('keeps only the count inside the pill without clearable', () => {
    const { container } = render(
      <Textarea aria-label="Notes" showCount maxLength={10} defaultValue="abc" />,
    );
    const pill = container.querySelector('.colox-textarea__pill');
    expect(pill?.querySelectorAll(':scope > *')).toHaveLength(1);
    expect(pill?.querySelector('.colox-textarea__count')).toBeInTheDocument();
    expect(pill?.querySelector('.colox-textarea__separator')).toBeNull();
    expect(pill?.querySelector('.colox-textarea__clear')).toBeNull();
  });

  it('keeps only the clear text inside the pill without count', () => {
    render(<Textarea aria-label="Notes" clearable />);
    const pill = document.querySelector('.colox-textarea__pill');
    expect(pill?.querySelectorAll(':scope > *')).toHaveLength(1);
    expect(pill?.querySelector('.colox-textarea__separator')).toBeNull();
    expect(screen.getByRole('button', { name: '清除' })).toBeInTheDocument();
  });

  it('clearing resets the count (uncontrolled)', () => {
    render(<Textarea aria-label="Notes" showCount clearable defaultValue="abc" />);
    fireEvent.click(screen.getByRole('button', { name: '清除' }));
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
