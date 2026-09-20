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

  it('lets a field override the validation policy', async () => {
    render(
      <Form validateOn="change">
        <Form.Field name="name">
          <Form.Label>Name</Form.Label>
          <Input />
          <Form.Validate required message="Name is required" />
        </Form.Field>
        <Form.Field name="mail" validateOn="blur">
          <Form.Label>Mail</Form.Label>
          <Input />
          <Form.Validate required message="Mail is required" />
        </Form.Field>
      </Form>,
    );
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'x' } });
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '' } });
    await waitFor(() => expect(screen.getByText('Name is required')).toBeInTheDocument());
    // The overridden field does not follow the form's change policy…
    fireEvent.change(screen.getByLabelText('Mail'), { target: { value: 'x' } });
    fireEvent.change(screen.getByLabelText('Mail'), { target: { value: '' } });
    expect(screen.queryByText('Mail is required')).toBeNull();
    // …it validates on its own blur trigger.
    fireEvent.blur(screen.getByLabelText('Mail'));
    await waitFor(() => expect(screen.getByText('Mail is required')).toBeInTheDocument());
  });

  it('focuses the first invalid control when a submit fails', async () => {
    render(
      <Form>
        <Form.Field name="first">
          <Form.Label>First</Form.Label>
          <Input />
          <Form.Validate required />
        </Form.Field>
        <Form.Field name="second">
          <Form.Label>Second</Form.Label>
          <Input />
          <Form.Validate required />
        </Form.Field>
      </Form>,
    );
    fireEvent.submit(formOf('First'));
    await waitFor(() => expect(screen.getAllByRole('alert')).toHaveLength(2));
    expect(screen.getByLabelText('First')).toHaveFocus();
  });

  it('skips the failed-submit focus when focusOnInvalid is off', async () => {
    render(
      <Form focusOnInvalid={false}>
        <Form.Field name="first">
          <Form.Label>First</Form.Label>
          <Input />
          <Form.Validate required />
        </Form.Field>
      </Form>,
    );
    fireEvent.submit(formOf('First'));
    await waitFor(() => expect(screen.getAllByRole('alert')).toHaveLength(1));
    expect(screen.getByLabelText('First')).not.toHaveFocus();
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

  it('aligns the start-placement label text along the labelAlign axis', () => {
    const { container } = render(
      <Form labelPlacement="start" labelAlign="end">
        <Form.Field name="email" labelAlign="justify">
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
    expect(fields[0]).toHaveClass('colox-form-field--label-align-justify');
    expect(fields[1]).toHaveClass('colox-form-field--label-align-end');
  });

  it('defaults the label alignment to start', () => {
    const { container } = render(
      <Form labelPlacement="start">
        <Form.Field name="email">
          <Form.Label>Email</Form.Label>
          <Input />
        </Form.Field>
      </Form>,
    );
    expect(container.querySelector('.colox-form-field')).toHaveClass(
      'colox-form-field--label-align-start',
    );
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

  it('restores the uncontrolled seeds on reset so store and controls agree', async () => {
    const Harness = () => {
      const form = useForm();
      const [read, setRead] = useState('');
      return (
        <>
          <button type="button" onClick={() => form.reset()}>
            Reset
          </button>
          <button type="button" onClick={() => setRead(JSON.stringify(form.getValues()))}>
            Read
          </button>
          <span data-testid="values">{read}</span>
          <Form form={form}>
            <Form.Field name="city">
              <Form.Label>City</Form.Label>
              <Input defaultValue="Lisbon" />
            </Form.Field>
            <Form.Field name="snack">
              <Form.Label>Snack</Form.Label>
              <Input defaultValue="chips" />
            </Form.Field>
          </Form>
        </>
      );
    };
    render(<Harness />);
    await waitFor(() => expect(screen.getByLabelText('City')).toHaveValue('Lisbon'));
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Porto' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    await waitFor(() => expect(screen.getByLabelText('City')).toHaveValue('Lisbon'));
    fireEvent.click(screen.getByRole('button', { name: 'Read' }));
    // The store reads the restored seeds again — not an empty map while
    // the controls show their defaults.
    expect(screen.getByTestId('values')).toHaveTextContent('{"city":"Lisbon","snack":"chips"}');
  });

  it('reset with a partial map restores the uncovered fields from their seeds', () => {
    const Harness = () => {
      const form = useForm();
      return (
        <>
          <button type="button" onClick={() => form.reset({ city: 'Faro' })}>
            Reset
          </button>
          <Form form={form}>
            <Form.Field name="city">
              <Form.Label>City</Form.Label>
              <Input defaultValue="Lisbon" />
            </Form.Field>
            <Form.Field name="count">
              <Form.Label>Count</Form.Label>
              <Input defaultValue="one" />
            </Form.Field>
          </Form>
        </>
      );
    };
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('City')).toHaveValue('Faro');
    expect(screen.getByLabelText('Count')).toHaveValue('one');
  });

  it('keeps the useForm initial values over control seeds on reset', () => {
    const Harness = () => {
      const form = useForm({ city: 'Braga' });
      const [read, setRead] = useState('');
      return (
        <>
          <button type="button" onClick={() => form.reset()}>
            Reset
          </button>
          <button type="button" onClick={() => setRead(JSON.stringify(form.getValues()))}>
            Read
          </button>
          <span data-testid="values">{read}</span>
          <Form form={form}>
            <Form.Field name="city">
              <Form.Label>City</Form.Label>
              <Input defaultValue="Lisbon" />
            </Form.Field>
          </Form>
        </>
      );
    };
    render(<Harness />);
    expect(screen.getByLabelText('City')).toHaveValue('Braga');
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Porto' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    fireEvent.click(screen.getByRole('button', { name: 'Read' }));
    expect(screen.getByTestId('values')).toHaveTextContent('{"city":"Braga"}');
  });

  it('stops running the rules of an unmounted field', async () => {
    const runGone = vi.fn();
    const Harness = () => {
      const form = useForm();
      const [show, setShow] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setShow(false)}>
            Hide
          </button>
          <button type="button" onClick={() => void form.validate()}>
            Check
          </button>
          <Form form={form}>
            <Form.Field name="city">
              <Input />
            </Form.Field>
            {show ? (
              <Form.Field name="gone">
                <Input />
                <Form.Validate
                  validate={() => {
                    runGone();
                    return 'gone';
                  }}
                />
              </Form.Field>
            ) : null}
          </Form>
        </>
      );
    };
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    await waitFor(() => expect(runGone).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: 'Hide' }));
    fireEvent.click(screen.getByRole('button', { name: 'Check' }));
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(runGone).toHaveBeenCalledTimes(1);
  });
});
