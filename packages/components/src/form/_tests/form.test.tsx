import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Form, useForm, useFormContext } from '..';
import { Input } from '../../input';
import type { FormErrors, FormValues } from '../types';

const NameField = ({ required = true }: { required?: boolean } = {}) => (
  <Form.Field name="name">
    <Form.Label>Name</Form.Label>
    <Input placeholder="Ada" />
    <Form.Validate required={required} />
  </Form.Field>
);

const formOf = (label: string) => screen.getByLabelText(label).closest('form') as HTMLFormElement;

describe('Form root', () => {
  it('renders a native form with native validation off', () => {
    const { container } = render(<Form>{null}</Form>);
    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    expect(form).toHaveAttribute('novalidate');
    expect(form).toHaveClass('colox-form');
  });

  it('lays the fields out in a token-keyed column', () => {
    const { container } = render(
      <Form gap="6">
        <NameField />
      </Form>,
    );
    const column = container.querySelector('.colox-form > .colox-stack');
    expect(column).toHaveClass('colox-stack--gap-6', 'colox-stack--column');
  });

  it('submits the collected values when every rule passes', async () => {
    const onSubmit = vi.fn();
    render(
      <Form onSubmit={onSubmit}>
        <NameField />
      </Form>,
    );
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } });
    fireEvent.submit(formOf('Name'));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    const [payload] = onSubmit.mock.calls[0] as [{ values: FormValues }];
    expect(payload.values).toEqual({ name: 'Ada' });
  });

  it('reports the errors instead of submitting when a rule fails', async () => {
    const onSubmit = vi.fn();
    const onInvalid = vi.fn();
    render(
      <Form onSubmit={onSubmit} onInvalid={onInvalid}>
        <NameField />
      </Form>,
    );
    fireEvent.submit(formOf('Name'));
    await waitFor(() => expect(onInvalid).toHaveBeenCalledOnce());
    expect(onSubmit).not.toHaveBeenCalled();
    const [payload] = onInvalid.mock.calls[0] as [{ errors: FormErrors }];
    expect(payload.errors).toEqual({ name: '此项为必填' });
  });

  it('accepts an externally held store and seeds it', async () => {
    const Harness = () => {
      const form = useForm({ name: 'Grace' });
      return (
        <>
          <button type="button" onClick={() => void form.validate()}>
            Check
          </button>
          <Form form={form}>
            <NameField required={false} />
          </Form>
        </>
      );
    };
    render(<Harness />);
    expect(screen.getByLabelText('Name')).toHaveValue('Grace');
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });

  it('follows the validateOn policy', async () => {
    render(
      <Form validateOn="change">
        <NameField />
      </Form>,
    );
    fireEvent.blur(screen.getByLabelText('Name'));
    expect(screen.queryByRole('alert')).toBeNull();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'x' } });
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '' } });
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('此项为必填'));
  });

  it('validates on blur by default', async () => {
    render(
      <Form>
        <NameField />
      </Form>,
    );
    fireEvent.blur(screen.getByLabelText('Name'));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('此项为必填'));
  });

  it('publishes the store to its members', () => {
    const Probe = () => {
      const { store } = useFormContext();
      return <span data-testid="probe">{String(store.getValue('name') ?? '')}</span>;
    };
    render(
      <Form>
        <NameField required={false} />
        <Probe />
      </Form>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('');
  });

  it('overrides the form label placement per field', () => {
    const { container } = render(
      <Form labelPlacement="start" labelWidth="20">
        <Form.Field name="email" labelPlacement="top">
          <Form.Label>Email</Form.Label>
          <Input />
        </Form.Field>
        <Form.Field name="city">
          <Form.Label>City</Form.Label>
          <Input />
        </Form.Field>
      </Form>,
    );
    const fields = container.querySelectorAll('.colox-form-field');
    expect(fields[0]).toHaveClass('colox-form-field--top');
    expect(fields[1]).toHaveClass('colox-form-field--start', 'colox-form-field--label-w-20');
  });

  it('seeds the store from an uncontrolled default', async () => {
    const Harness = () => {
      const form = useForm();
      const [read, setRead] = useState('');
      return (
        <>
          <button type="button" onClick={() => setRead(String(form.getValue('city') ?? ''))}>
            Read
          </button>
          <span data-testid="value">{read}</span>
          <Form form={form}>
            <Form.Field name="city">
              <Input defaultValue="Lisbon" />
            </Form.Field>
          </Form>
        </>
      );
    };
    render(<Harness />);
    await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue('Lisbon'));
    fireEvent.click(screen.getByRole('button', { name: 'Read' }));
    expect(screen.getByTestId('value')).toHaveTextContent('Lisbon');
  });
});
