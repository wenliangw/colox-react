import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Radio } from '../radio';

describe('Radio.Group', () => {
  it('derives member checked state from the group value', () => {
    render(
      <Radio.Group value="apple">
        <Radio value="apple">Apple</Radio>
        <Radio value="banana">Banana</Radio>
      </Radio.Group>,
    );
    expect(screen.getByRole('radio', { name: 'Apple' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Banana' })).not.toBeChecked();
  });

  it('publishes the next single selection when a member is picked', () => {
    const onChange = vi.fn();
    render(
      <Radio.Group value="apple" onChange={onChange}>
        <Radio value="apple">Apple</Radio>
        <Radio value="banana">Banana</Radio>
      </Radio.Group>,
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Banana' }));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith('banana');
  });

  it('stays silent when the already-selected member is clicked again', () => {
    const onChange = vi.fn();
    render(
      <Radio.Group value="apple" onChange={onChange}>
        <Radio value="apple">Apple</Radio>
        <Radio value="banana">Banana</Radio>
      </Radio.Group>,
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Apple' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('seeds the initial selection from defaultValue and switches on pick', () => {
    render(
      <Radio.Group defaultValue="apple">
        <Radio value="apple">Apple</Radio>
        <Radio value="banana">Banana</Radio>
      </Radio.Group>,
    );
    expect(screen.getByRole('radio', { name: 'Apple' })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: 'Banana' }));
    expect(screen.getByRole('radio', { name: 'Banana' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Apple' })).not.toBeChecked();
  });

  it('keeps members without a value independent of the group', () => {
    const groupOnChange = vi.fn();
    const memberOnChange = vi.fn();
    render(
      <Radio.Group value="" onChange={groupOnChange}>
        <Radio onChange={memberOnChange}>Solo</Radio>
      </Radio.Group>,
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Solo' }));
    expect(memberOnChange).toHaveBeenCalledOnce();
    expect(groupOnChange).not.toHaveBeenCalled();
  });

  it('still passes the native change event through on group members', () => {
    const memberOnChange = vi.fn();
    render(
      <Radio.Group value="apple">
        <Radio value="apple">Apple</Radio>
        <Radio value="banana" onChange={memberOnChange}>
          Banana
        </Radio>
      </Radio.Group>,
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Banana' }));
    // Group members are controlled by the group, so this is the
    // standard React controlled flow: the handler receives the native
    // event, and consumers read the next selection from Radio.Group
    // onChange.
    expect(memberOnChange).toHaveBeenCalledOnce();
    expect(memberOnChange.mock.calls[0]?.[0].target).toBe(
      screen.getByRole('radio', { name: 'Banana' }),
    );
  });

  it('inherits the group name for native form collection with own-name precedence', () => {
    render(
      <Radio.Group name="fruit">
        <Radio value="apple">Apple</Radio>
        <Radio value="pear" name="pear">
          Pear
        </Radio>
      </Radio.Group>,
    );
    expect(screen.getByRole('radio', { name: 'Apple' })).toHaveAttribute('name', 'fruit');
    expect(screen.getByRole('radio', { name: 'Pear' })).toHaveAttribute('name', 'pear');
  });

  it('inherits disabled from the group', () => {
    render(
      <Radio.Group disabled>
        <Radio value="apple">Apple</Radio>
        <Radio value="banana">Banana</Radio>
      </Radio.Group>,
    );
    expect(screen.getByRole('radio', { name: 'Apple' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Banana' })).toBeDisabled();
  });

  it('lets members inherit the group size with own-size precedence', () => {
    render(
      <Radio.Group size="sm">
        <Radio value="apple">Apple</Radio>
        <Radio value="banana" size="lg">
          Banana
        </Radio>
      </Radio.Group>,
    );
    expect(screen.getByRole('radio', { name: 'Apple' }).closest('.colox-radio')).toHaveClass(
      'colox-radio--sm',
    );
    expect(screen.getByRole('radio', { name: 'Banana' }).closest('.colox-radio')).toHaveClass(
      'colox-radio--lg',
    );
  });

  it('defaults members to md when neither the group nor the member sets a size', () => {
    render(
      <Radio.Group>
        <Radio value="apple">Apple</Radio>
      </Radio.Group>,
    );
    expect(screen.getByRole('radio', { name: 'Apple' }).closest('.colox-radio')).toHaveClass(
      'colox-radio--md',
    );
  });

  it('renders a column radiogroup container with the role', () => {
    const { container } = render(
      <Radio.Group>
        <Radio value="apple">Apple</Radio>
      </Radio.Group>,
    );
    const root = container.querySelector('.colox-radio-group');
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute('role', 'radiogroup');
    expect(root).toHaveClass('colox-radio-group');
  });

  it('serves static defaults outside a group', () => {
    render(<Radio value="solo">Solo</Radio>);
    const input = screen.getByRole('radio', { name: 'Solo' });
    expect(input).not.toBeChecked();
    expect(input).toHaveAttribute('value', 'solo');
  });
});
