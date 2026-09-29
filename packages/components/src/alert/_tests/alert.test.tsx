import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Alert } from '../alert';

/** Render an Alert and return its root element. */
function renderRoot(ui: ReactElement) {
  const { container } = render(ui);
  const root = container.querySelector('.colox-alert');
  if (!root) throw new Error('alert root not found');
  return root;
}

describe('Alert type', () => {
  it.each([
    ['info', 'colox-alert--info'],
    ['success', 'colox-alert--success'],
    ['warning', 'colox-alert--warning'],
    ['error', 'colox-alert--error'],
  ] as const)('defaults the palette to the %s type family', (type, expectedClass) => {
    expect(renderRoot(<Alert type={type} message="hi" />)).toHaveClass(expectedClass);
  });

  it('defaults to info', () => {
    expect(renderRoot(<Alert message="hi" />)).toHaveClass('colox-alert--info');
  });
});

describe('Alert role', () => {
  it.each(['error', 'warning'] as const)('announces %s assertively with role="alert"', (type) => {
    expect(renderRoot(<Alert type={type} message="hi" />)).toHaveAttribute('role', 'alert');
  });

  it.each(['info', 'success'] as const)('announces %s politely with role="status"', (type) => {
    expect(renderRoot(<Alert type={type} message="hi" />)).toHaveAttribute('role', 'status');
  });
});

describe('Alert variant', () => {
  it('defaults to subtle', () => {
    expect(renderRoot(<Alert message="hi" />)).toHaveClass('colox-alert--subtle');
  });

  it.each([
    ['plain', 'colox-alert--plain'],
    ['subtle', 'colox-alert--subtle'],
    ['solid', 'colox-alert--solid'],
    ['outline', 'colox-alert--outline'],
  ] as const)('applies the %s variant class', (variant, expectedClass) => {
    expect(renderRoot(<Alert message="hi" variant={variant} />)).toHaveClass(expectedClass);
  });
});

describe('Alert palette', () => {
  it('lets an explicit palette override the type-derived family', () => {
    expect(renderRoot(<Alert type="success" palette="error" message="hi" />)).toHaveClass(
      'colox-alert--error',
    );
  });

  it.each([
    ['gray', 'colox-alert--gray'],
    ['primary', 'colox-alert--primary'],
    ['info', 'colox-alert--info'],
    ['error', 'colox-alert--error'],
    ['warning', 'colox-alert--warning'],
    ['success', 'colox-alert--success'],
  ] as const)('applies the %s palette class', (palette, expectedClass) => {
    expect(renderRoot(<Alert message="hi" palette={palette} />)).toHaveClass(expectedClass);
  });
});

describe('Alert content', () => {
  it('renders the message and the optional description', () => {
    render(<Alert message="保存成功" description="已写入本地缓存" />);
    expect(screen.getByText('保存成功')).toBeInTheDocument();
    expect(screen.getByText('已写入本地缓存')).toBeInTheDocument();
  });

  it('renders rich ReactNode content in the message', () => {
    render(
      <Alert
        message={
          <span>
            保存失败 <b>请重试</b>
          </span>
        }
      />,
    );
    expect(screen.getByText('请重试')).toBeInTheDocument();
  });

  it('omits the description node when not given', () => {
    const { container } = render(<Alert message="hi" />);
    expect(container.querySelector('.colox-alert__description')).not.toBeInTheDocument();
  });
});

describe('Alert showIcon', () => {
  it('renders the semantic icon by default', () => {
    const { container } = render(<Alert message="hi" />);
    const icon = container.querySelector('.colox-alert__icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('drops the icon when showIcon is false', () => {
    const { container } = render(<Alert message="hi" showIcon={false} />);
    expect(container.querySelector('.colox-alert__icon')).not.toBeInTheDocument();
  });
});

describe('Alert close', () => {
  it('renders no close button by default', () => {
    const { container } = render(<Alert message="hi" />);
    expect(container.querySelector('.colox-alert__close')).not.toBeInTheDocument();
  });

  it('stages the exit on ✕ and fires onClose when the fade ends', () => {
    const onClose = vi.fn();
    render(<Alert message="hi" closeable onClose={onClose} />);
    const close = screen.getByRole('button', { name: 'Close' });

    // Clicking stages the fade — onClose is deferred to the animation
    // end, and the alert still does not hide itself.
    fireEvent.click(close);
    expect(onClose).not.toHaveBeenCalled();
    const root = document.querySelector('.colox-alert');
    expect(root).toHaveClass('colox-alert--exiting');
    expect(screen.getByText('hi')).toBeInTheDocument();

    // The exit animation ends — onClose hands the decision to the parent.
    fireEvent.animationEnd(root!, {});
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('ignores an animation end that is not the root exit', () => {
    const onClose = vi.fn();
    render(<Alert message="hi" closeable onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    // A bubbled child animation must not notify the parent.
    const message = document.querySelector('.colox-alert__message');
    fireEvent.animationEnd(message!, {});
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('Alert action', () => {
  it('renders the action slot', () => {
    render(<Alert message="hi" action={<button type="button">重试</button>} />);
    expect(screen.getByRole('button', { name: '重试' })).toBeInTheDocument();
  });

  it('omits the action slot when not given', () => {
    const { container } = render(<Alert message="hi" />);
    expect(container.querySelector('.colox-alert__action')).not.toBeInTheDocument();
  });
});

describe('Alert passthrough', () => {
  it('merges className and forwards native props', () => {
    render(<Alert message="hi" className="mine" data-testid="alert" />);
    const alert = screen.getByTestId('alert');
    expect(alert).toHaveClass('colox-alert', 'mine');
    expect(alert).toHaveAttribute('data-testid', 'alert');
  });
});
