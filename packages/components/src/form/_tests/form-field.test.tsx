import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Form } from '..';
import { Checkbox } from '../../checkbox';
import { Input } from '../../input';
import { Radio } from '../../radio';
import { Select } from '../../select';
import { Switch } from '../../switch';
import { TimePicker } from '../../time-picker';
import type { InputChangePayload } from '../../input';

describe('Form.Field wiring', () => {
  it('wires the label to the control and the value through the family payload', () => {
    const onChange = vi.fn<(payload: InputChangePayload) => void>();
    render(
      <Form>
        <Form.Field name="email">
          <Form.Label>Email</Form.Label>
          <Input onChange={onChange} />
        </Form.Field>
      </Form>,
    );
    const control = screen.getByLabelText('Email');
    expect(control).toHaveAttribute('name', 'email');
    fireEvent.change(control, { target: { value: 'ada@colox.dev' } });
    expect(control).toHaveValue('ada@colox.dev');
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('injects the boolean word into a single Checkbox', () => {
    render(
      <Form>
        <Form.Field name="agree">
          <Form.Label>Agree</Form.Label>
          <Checkbox />
        </Form.Field>
      </Form>,
    );
    const box = screen.getByRole('checkbox') as HTMLInputElement;
    expect(box).not.toBeChecked();
    fireEvent.click(box);
    expect(box).toBeChecked();
    // The group token stays untouched: checked travels, not value.
    expect(box).not.toHaveAttribute('value');
  });

  it('injects the boolean word into Switch and a standalone Radio', () => {
    render(
      <Form>
        <Form.Field name="dark">
          <Form.Label>Dark</Form.Label>
          <Switch />
        </Form.Field>
        <Form.Field name="solo">
          <Form.Label>Solo</Form.Label>
          <Radio />
        </Form.Field>
      </Form>,
    );
    const toggle = screen.getByRole('switch') as HTMLInputElement;
    fireEvent.click(toggle);
    expect(toggle).toBeChecked();
    const radio = screen.getByRole('radio') as HTMLInputElement;
    fireEvent.click(radio);
    expect(radio).toBeChecked();
  });

  it('wires a group control through aria-labelledby', () => {
    render(
      <Form>
        <Form.Field name="fruits">
          <Form.Label>Fruits</Form.Label>
          <Checkbox.Group>
            <Checkbox value="apple">Apple</Checkbox>
            <Checkbox value="banana">Banana</Checkbox>
          </Checkbox.Group>
        </Form.Field>
      </Form>,
    );
    const group = screen.getByRole('group', { name: 'Fruits' });
    expect(group).toHaveAttribute('aria-labelledby');
    expect(screen.getByRole('checkbox', { name: 'Apple' })).toBeInTheDocument();
  });

  it('wires Select through the label and collects its payload value', async () => {
    const onSubmit = vi.fn();
    render(
      <Form onSubmit={onSubmit}>
        <Form.Field name="fruit">
          <Form.Label>Fruit</Form.Label>
          <Select>
            <Select.Option value="apple" text="Apple" />
            <Select.Option value="banana" text="Banana" />
          </Select>
        </Form.Field>
      </Form>,
    );
    const control = screen.getByLabelText('Fruit');
    fireEvent.click(control);
    fireEvent.click(screen.getByRole('option', { name: 'Banana' }));
    expect(control).toHaveTextContent('Banana');
    fireEvent.submit(control.closest('form') as HTMLFormElement);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0]?.[0].values).toEqual({ fruit: 'banana' });
  });

  it('seeds TimePicker with the null word and collects its canonical payload', async () => {
    const onSubmit = vi.fn();
    render(
      <Form onSubmit={onSubmit}>
        <Form.Field name="pickup">
          <Form.Label>Pickup time</Form.Label>
          <TimePicker />
        </Form.Field>
      </Form>,
    );
    const control = screen.getByLabelText('Pickup time');
    expect(control).toHaveAttribute('name', 'pickup');

    // The untouched empty word is null — the time domain's word, like
    // InputNumber and DatePicker.
    fireEvent.submit(control.closest('form') as HTMLFormElement);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0]?.[0].values).toEqual({ pickup: null });

    // A typed complete word commits through the family payload: the
    // canonical spelling lands in the store and in the submit word.
    fireEvent.change(control, { target: { value: '15:30:45' } });
    expect(control).toHaveValue('15:30:45');
    fireEvent.submit(control.closest('form') as HTMLFormElement);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(onSubmit.mock.calls[1]?.[0].values).toEqual({ pickup: '15:30:45' });
  });

  it('marks the control invalid and swaps the described line', async () => {
    render(
      <Form>
        <Form.Field name="email">
          <Form.Label>Email</Form.Label>
          <Input />
          <Form.Hint>We never share it.</Form.Hint>
          <Form.Validate required />
        </Form.Field>
      </Form>,
    );
    const control = screen.getByLabelText('Email');
    const hint = screen.getByText('We never share it.');
    expect(control.getAttribute('aria-describedby')).toBe(hint.id);
    expect(control).not.toHaveAttribute('aria-invalid');
    fireEvent.blur(control);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('此项为必填'));
    expect(screen.queryByText('We never share it.')).toBeNull();
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control.getAttribute('aria-describedby')).toBe(screen.getByRole('alert').id);
  });

  it('renders the error only on the leaf that owns the first failure', async () => {
    render(
      <Form>
        <Form.Field name="code">
          <Form.Label>Code</Form.Label>
          <Input />
          <Form.Validate minLength={4} />
          <Form.Validate pattern={/^\d+$/} message="Digits only" />
        </Form.Field>
      </Form>,
    );
    fireEvent.change(screen.getByLabelText('Code'), { target: { value: 'abc' } });
    fireEvent.blur(screen.getByLabelText('Code'));
    await waitFor(() => expect(screen.getAllByRole('alert')).toHaveLength(1));
    expect(screen.getByRole('alert')).toHaveTextContent('至少 4 个字符');
    fireEvent.change(screen.getByLabelText('Code'), { target: { value: 'abcd' } });
    fireEvent.blur(screen.getByLabelText('Code'));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Digits only'));
  });

  it('gives every hint its own id and names them all', () => {
    render(
      <Form>
        <Form.Field name="city">
          <Form.Label>City</Form.Label>
          <Input />
          <Form.Hint>First line</Form.Hint>
          <Form.Hint>Second line</Form.Hint>
        </Form.Field>
      </Form>,
    );
    const [first, second] = screen.getAllByText(/line/);
    expect(first.id).not.toBe('');
    expect(first.id).not.toBe(second.id);
    expect(screen.getByLabelText('City')).toHaveAttribute(
      'aria-describedby',
      `${first.id} ${second.id}`,
    );
  });

  it('injects the form-wide disabled lock into every control', () => {
    render(
      <Form disabled>
        <Form.Field name="city">
          <Form.Label>City</Form.Label>
          <Input />
        </Form.Field>
        <Form.Field name="agree">
          <Form.Label>Agree</Form.Label>
          <Checkbox />
        </Form.Field>
      </Form>,
    );
    expect(screen.getByLabelText('City')).toBeDisabled();
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('locks a group control through the form-wide disabled', () => {
    render(
      <Form disabled>
        <Form.Field name="fruits">
          <Form.Label>Fruits</Form.Label>
          <Checkbox.Group>
            <Checkbox value="apple">Apple</Checkbox>
          </Checkbox.Group>
        </Form.Field>
      </Form>,
    );
    expect(screen.getByRole('checkbox', { name: 'Apple' })).toBeDisabled();
  });

  it('keeps an author disabled while the form lock is off', () => {
    render(
      <Form>
        <Form.Field name="city">
          <Form.Label>City</Form.Label>
          <Input disabled />
        </Form.Field>
        <Form.Field name="zip">
          <Form.Label>Zip</Form.Label>
          <Input />
        </Form.Field>
      </Form>,
    );
    expect(screen.getByLabelText('City')).toBeDisabled();
    expect(screen.getByLabelText('Zip')).toBeEnabled();
  });

  it('merges the consumer className and style on the field root', () => {
    const { container } = render(
      <Form>
        <Form.Field name="email" className="custom-field" style={{ marginTop: 8 }}>
          <Input />
        </Form.Field>
      </Form>,
    );
    const field = container.querySelector('.colox-form-field');
    expect(field).toHaveClass('custom-field');
    expect(field).toHaveStyle({ marginTop: '8px' });
  });
});

describe('Form required mark', () => {
  it('derives the mark from a required rule and injects aria-required', () => {
    const { container } = render(
      <Form>
        <Form.Field name="email">
          <Form.Label>Email</Form.Label>
          <Input />
          <Form.Validate required />
        </Form.Field>
        <Form.Field name="city">
          <Form.Label>City</Form.Label>
          <Input />
        </Form.Field>
      </Form>,
    );
    const labels = container.querySelectorAll('.colox-form-label');
    expect(labels).toHaveLength(2);
    // Default position 'start': the mark leads the label text.
    expect(labels[0]?.firstElementChild).toHaveClass('colox-form-label__required');
    expect(container.querySelectorAll('.colox-form-label__required')).toHaveLength(1);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText('City')).not.toHaveAttribute('aria-required');
  });

  it('renders the mark after the text on the end position and overrides per field', () => {
    const { container } = render(
      <Form requiredMarkPosition="end">
        <Form.Field name="email">
          <Form.Label>Email</Form.Label>
          <Input />
          <Form.Validate required />
        </Form.Field>
        <Form.Field name="city" requiredMarkPosition="start">
          <Form.Label>City</Form.Label>
          <Input />
          <Form.Validate required />
        </Form.Field>
      </Form>,
    );
    const labels = container.querySelectorAll('.colox-form-label');
    expect(labels[0]?.lastElementChild).toHaveClass('colox-form-label__required');
    expect(labels[1]?.firstElementChild).toHaveClass('colox-form-label__required');
  });

  it('hides the mark per label while the programmatic verdict stays', () => {
    const { container } = render(
      <Form>
        <Form.Field name="email">
          <Form.Label showRequiredMark={false}>Email</Form.Label>
          <Input />
          <Form.Validate required />
        </Form.Field>
      </Form>,
    );
    expect(container.querySelector('.colox-form-label__required')).toBeNull();
    // Hiding the star is a visual choice: the field is still required.
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-required', 'true');
  });
});

describe('Form.Field validation tree', () => {
  it('requires exactly one control child', () => {
    expect(() =>
      render(
        <Form>
          <Form.Field name="empty">
            <Form.Label>Empty</Form.Label>
          </Form.Field>
        </Form>,
      ),
    ).toThrow('Form.Field requires exactly one control child.');
  });

  it('rejects several control children', () => {
    expect(() =>
      render(
        <Form>
          <Form.Field name="two">
            <Input />
            <Input />
          </Form.Field>
        </Form>,
      ),
    ).toThrow('Form.Field accepts exactly one control child.');
  });

  it('rejects host elements as the control', () => {
    expect(() =>
      render(
        <Form>
          <Form.Field name="host">
            <input />
          </Form.Field>
        </Form>,
      ),
    ).toThrow('Form.Field needs a component as its control');
  });

  it('rejects several labels', () => {
    expect(() =>
      render(
        <Form>
          <Form.Field name="labels">
            <Form.Label>One</Form.Label>
            <Form.Label>Two</Form.Label>
            <Input />
          </Form.Field>
        </Form>,
      ),
    ).toThrow('Form.Field accepts at most one Form.Label.');
  });

  it('requires the members to sit inside their parents', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Form.Label>Loose</Form.Label>)).toThrow(
      'Form.Label / Form.Hint / Form.Validate must be rendered inside a <Form.Field>.',
    );
    expect(() =>
      render(
        <Form.Field name="loose">
          <Input />
        </Form.Field>,
      ),
    ).toThrow('Form members must be rendered inside a <Form>.');
    spy.mockRestore();
  });

  it('cascades the form size only into controls that declared none', () => {
    render(
      <Form size="sm">
        <Form.Field name="org">
          <Form.Label>Org</Form.Label>
          <Input />
        </Form.Field>
        <Form.Field name="mail">
          <Form.Label>Mail</Form.Label>
          <Input size="lg" />
        </Form.Field>
      </Form>,
    );
    expect(screen.getByLabelText('Org').closest('.colox-input')).toHaveClass('colox-input--sm');
    // A state class: the control's own word wins over the form's.
    expect(screen.getByLabelText('Mail').closest('.colox-input')).toHaveClass('colox-input--lg');
  });

  it('leaves the controls on their family default without a form size', () => {
    render(
      <Form>
        <Form.Field name="org">
          <Form.Label>Org</Form.Label>
          <Input />
        </Form.Field>
      </Form>,
    );
    expect(screen.getByLabelText('Org').closest('.colox-input')).toHaveClass('colox-input--md');
  });

  it('appends the colon piece while keeping the label text clean', () => {
    render(
      <Form colon>
        <Form.Field name="name">
          <Form.Label>Name</Form.Label>
          <Input />
          <Form.Validate required />
        </Form.Field>
      </Form>,
    );
    const label = screen.getByText('Name').closest('label') as HTMLLabelElement;
    // CSS-painted, never a text node: the queryable name stays clean.
    expect(label.textContent).toBe('Name');
    const colon = label.querySelector('.colox-form-label__colon');
    expect(colon).not.toBeNull();
    expect(colon).toHaveAttribute('aria-hidden', 'true');
  });

  it('turns the colon off per field', () => {
    render(
      <Form colon>
        <Form.Field name="plain">
          <Form.Label>Plain</Form.Label>
          <Input />
        </Form.Field>
        <Form.Field name="overridden" colon={false}>
          <Form.Label>Overridden</Form.Label>
          <Input />
        </Form.Field>
      </Form>,
    );
    expect(
      screen.getByText('Plain').closest('label')?.querySelector('.colox-form-label__colon'),
    ).not.toBeNull();
    expect(
      screen.getByText('Overridden').closest('label')?.querySelector('.colox-form-label__colon'),
    ).toBeNull();
  });
});
