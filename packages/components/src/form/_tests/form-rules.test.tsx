import { useEffect, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Form, useForm } from '..';
import { Checkbox } from '../../checkbox';
import { Input } from '../../input';
import { InputNumber } from '../../input-number';
import type { FormStore } from '../types';

const field = (name: string, rule: React.ReactNode, control: React.ReactNode = <Input />) => (
  <Form.Field name={name}>
    <Form.Label>{name}</Form.Label>
    {control}
    {rule}
  </Form.Field>
);

describe('Form rules', () => {
  it('treats every domain empty word as empty for required', async () => {
    render(
      <Form>
        {field('text', <Form.Validate required />)}
        {field('count', <Form.Validate required />, <InputNumber />)}
        {field('agree', <Form.Validate required />, <Checkbox>Agree</Checkbox>)}
      </Form>,
    );
    fireEvent.submit(screen.getByLabelText('text').closest('form') as HTMLFormElement);
    await waitFor(() => expect(screen.getAllByRole('alert')).toHaveLength(3));
    expect(screen.getAllByRole('alert').map((node) => node.textContent)).toEqual([
      '此项为必填',
      '此项为必填',
      '此项为必填',
    ]);
  });

  it('runs the numeric and length bounds', async () => {
    render(
      <Form>
        {field('age', <Form.Validate min={18} max={30} />, <InputNumber />)}
        {field('bio', <Form.Validate minLength={4} maxLength={6} />)}
      </Form>,
    );
    fireEvent.change(screen.getByLabelText('age'), { target: { value: '12' } });
    fireEvent.blur(screen.getByLabelText('age'));
    await waitFor(() => expect(screen.getByText('不小于 18')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('age'), { target: { value: '40' } });
    fireEvent.blur(screen.getByLabelText('age'));
    await waitFor(() => expect(screen.getByText('不大于 30')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('bio'), { target: { value: 'abc' } });
    fireEvent.blur(screen.getByLabelText('bio'));
    await waitFor(() => expect(screen.getByText('至少 4 个字符')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('bio'), { target: { value: 'abcdefg' } });
    fireEvent.blur(screen.getByLabelText('bio'));
    await waitFor(() => expect(screen.getByText('至多 6 个字符')).toBeInTheDocument());
  });

  it('matches a pattern and honours the message override', async () => {
    render(
      <Form>{field('zip', <Form.Validate pattern={/^\d{5}$/} message="请输入五位邮编" />)}</Form>,
    );
    fireEvent.change(screen.getByLabelText('zip'), { target: { value: 'abc' } });
    fireEvent.blur(screen.getByLabelText('zip'));
    await waitFor(() => expect(screen.getByText('请输入五位邮编')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('zip'), { target: { value: '10001' } });
    fireEvent.blur(screen.getByLabelText('zip'));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });

  it('supports custom and async rules', async () => {
    const validate = vi.fn(async (value: unknown) => {
      await Promise.resolve();
      return value === 'taken' ? 'Already taken' : undefined;
    });
    render(<Form>{field('handle', <Form.Validate validate={validate} />)}</Form>);
    fireEvent.change(screen.getByLabelText('handle'), { target: { value: 'taken' } });
    fireEvent.blur(screen.getByLabelText('handle'));
    await waitFor(() => expect(screen.getByText('Already taken')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('handle'), { target: { value: 'free' } });
    fireEvent.blur(screen.getByLabelText('handle'));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });

  it('re-runs a field when one of its deps changes', async () => {
    render(
      <Form>
        {field('password', <Form.Validate required />)}
        <Form.Field name="confirm">
          <Form.Label>confirm</Form.Label>
          <Input />
          <Form.Validate
            deps={['password']}
            validate={(value, values) => (value === values.password ? undefined : '两次输入不一致')}
          />
        </Form.Field>
      </Form>,
    );
    fireEvent.change(screen.getByLabelText('confirm'), { target: { value: 'a' } });
    fireEvent.blur(screen.getByLabelText('confirm'));
    // password is still empty at this point, so the pair matches
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'b' } });
    await waitFor(() => expect(screen.getByText('两次输入不一致')).toBeInTheDocument());
  });
});

describe('Form store', () => {
  const Harness = ({ children }: { children: (store: FormStore) => React.ReactNode }) => {
    const store = useForm();
    return (
      <>
        {children(store)}
        <Form form={store}>
          {field('name', <Form.Validate required />)}
          {field('city', <Form.Validate required />)}
        </Form>
      </>
    );
  };

  it('reports values, errors and validity through subscribe', async () => {
    const Snapshot = ({ store }: { store: FormStore }) => {
      const [snapshot, setSnapshot] = useState(() => ({
        values: JSON.stringify(store.getValues()),
        valid: store.isValid(),
      }));
      useEffect(
        () =>
          store.subscribe(() =>
            setSnapshot({ values: JSON.stringify(store.getValues()), valid: store.isValid() }),
          ),
        [store],
      );
      return (
        <>
          <span data-testid="values">{snapshot.values}</span>
          <span data-testid="valid">{String(snapshot.valid)}</span>
        </>
      );
    };

    render(
      <Harness>
        {(store) => (
          <>
            <button type="button" onClick={() => void store.validate()}>
              Validate
            </button>
            <Snapshot store={store} />
          </>
        )}
      </Harness>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('values')).toHaveTextContent('{"name":"","city":""}'),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Validate' }));
    await waitFor(() => expect(screen.getAllByRole('alert')).toHaveLength(2));
    expect(screen.getByTestId('valid')).toHaveTextContent('false');
  });

  it('resets the values and clears the errors', async () => {
    render(
      <Harness>
        {(store) => (
          <button
            type="button"
            onClick={() => {
              store.setValue('name', 'Ada');
              void store.validate().then(() => store.reset({ name: 'Grace' }));
            }}
          >
            Reset
          </button>
        )}
      </Harness>,
    );
    fireEvent.change(screen.getByLabelText('name'), { target: { value: 'Ada' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    await waitFor(() => expect(screen.getByLabelText('name')).toHaveValue('Grace'));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows an externally written error on the field error line', async () => {
    render(
      <Harness>
        {(store) => (
          <button type="button" onClick={() => store.setError('name', 'Taken on the server')}>
            Fail
          </button>
        )}
      </Harness>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Fail' }));
    await waitFor(() => expect(screen.getByText('Taken on the server')).toBeInTheDocument());
    expect(screen.getByLabelText('name')).toHaveAttribute('aria-invalid', 'true');
  });
});
