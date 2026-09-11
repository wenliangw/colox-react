import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../checkbox';

describe('Checkbox.Group', () => {
  it('derives member checked state from the group value', () => {
    render(
      <Checkbox.Group value={['apple']}>
        <Checkbox value="apple">Apple</Checkbox>
        <Checkbox value="banana">Banana</Checkbox>
      </Checkbox.Group>,
    );
    expect(screen.getByRole('checkbox', { name: 'Apple' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Banana' })).not.toBeChecked();
  });

  it('publishes the next selection array when a member toggles on', () => {
    const onChange = vi.fn();
    render(
      <Checkbox.Group value={[]} onChange={onChange}>
        <Checkbox value="apple">Apple</Checkbox>
        <Checkbox value="banana">Banana</Checkbox>
      </Checkbox.Group>,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Banana' }));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(['banana']);
  });

  it('publishes the array without the member when it toggles off', () => {
    const onChange = vi.fn();
    render(
      <Checkbox.Group value={['apple', 'banana']} onChange={onChange}>
        <Checkbox value="apple">Apple</Checkbox>
        <Checkbox value="banana">Banana</Checkbox>
      </Checkbox.Group>,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Apple' }));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(['banana']);
  });

  it('seeds the initial selection from defaultValue and toggles on top', () => {
    render(
      <Checkbox.Group defaultValue={['apple']}>
        <Checkbox value="apple">Apple</Checkbox>
        <Checkbox value="banana">Banana</Checkbox>
      </Checkbox.Group>,
    );
    expect(screen.getByRole('checkbox', { name: 'Apple' })).toBeChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Banana' }));
    expect(screen.getByRole('checkbox', { name: 'Banana' })).toBeChecked();
  });

  it('keeps an explicitly controlled member independent of the group', () => {
    const groupOnChange = vi.fn();
    const memberOnChange = vi.fn();
    render(
      <Checkbox.Group value={[]} onChange={groupOnChange}>
        <Checkbox value="solo" checked onChange={memberOnChange}>
          Solo
        </Checkbox>
      </Checkbox.Group>,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Solo' }));
    expect(memberOnChange).toHaveBeenCalledOnce();
    expect(groupOnChange).not.toHaveBeenCalled();
  });

  it('still passes the native change event through on group members', () => {
    const memberOnChange = vi.fn();
    render(
      <Checkbox.Group value={[]}>
        <Checkbox value="apple" onChange={memberOnChange}>
          Apple
        </Checkbox>
      </Checkbox.Group>,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Apple' }));
    // The member is controlled by the group, so this is the standard
    // React controlled flow: the handler receives the native event, and
    // consumers read the next selection from Checkbox.Group onChange.
    expect(memberOnChange).toHaveBeenCalledOnce();
    expect(memberOnChange.mock.calls[0]?.[0].target).toBe(
      screen.getByRole('checkbox', { name: 'Apple' }),
    );
  });

  it('inherits the group name for native form collection with own-name precedence', () => {
    render(
      <Checkbox.Group name="fruit">
        <Checkbox value="apple">Apple</Checkbox>
        <Checkbox value="pear" name="pear">
          Pear
        </Checkbox>
      </Checkbox.Group>,
    );
    expect(screen.getByRole('checkbox', { name: 'Apple' })).toHaveAttribute('name', 'fruit');
    expect(screen.getByRole('checkbox', { name: 'Pear' })).toHaveAttribute('name', 'pear');
  });

  it('inherits disabled from the group', () => {
    render(
      <Checkbox.Group disabled>
        <Checkbox value="apple">Apple</Checkbox>
        <Checkbox value="banana">Banana</Checkbox>
      </Checkbox.Group>,
    );
    expect(screen.getByRole('checkbox', { name: 'Apple' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Banana' })).toBeDisabled();
  });

  it('lets members inherit the group size with own-size precedence', () => {
    render(
      <Checkbox.Group size="sm">
        <Checkbox value="apple">Apple</Checkbox>
        <Checkbox value="banana" size="lg">
          Banana
        </Checkbox>
      </Checkbox.Group>,
    );
    expect(screen.getByRole('checkbox', { name: 'Apple' }).closest('.colox-checkbox')).toHaveClass(
      'colox-checkbox--sm',
    );
    expect(screen.getByRole('checkbox', { name: 'Banana' }).closest('.colox-checkbox')).toHaveClass(
      'colox-checkbox--lg',
    );
  });

  it('defaults members to md when neither the group nor the member sets a size', () => {
    render(
      <Checkbox.Group>
        <Checkbox value="apple">Apple</Checkbox>
      </Checkbox.Group>,
    );
    expect(screen.getByRole('checkbox', { name: 'Apple' }).closest('.colox-checkbox')).toHaveClass(
      'colox-checkbox--md',
    );
  });

  it('renders a column group container with the role', () => {
    const { container } = render(
      <Checkbox.Group>
        <Checkbox value="apple">Apple</Checkbox>
      </Checkbox.Group>,
    );
    const root = container.querySelector('.colox-checkbox-group');
    expect(root).not.toBeNull();
    expect(root).toHaveAttribute('role', 'group');
    expect(root).toHaveClass('colox-checkbox-group');
  });

  it('serves static defaults outside a group', () => {
    render(<Checkbox value="solo">Solo</Checkbox>);
    const input = screen.getByRole('checkbox', { name: 'Solo' });
    expect(input).not.toBeChecked();
    expect(input).toHaveAttribute('value', 'solo');
  });
});
