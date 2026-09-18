import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Textarea } from '../textarea';

// jsdom reports scrollHeight 0 and does not resolve token-driven computed
// styles, so the measurement inputs are mocked per test. The row math only
// engages when a line-height is computable — the same guard runs in real
// browsers (styles are explicit there, so clamping is live behavior).
const mockScrollHeight = (element: HTMLElement, height: number) => {
  Object.defineProperty(element, 'scrollHeight', {
    configurable: true,
    get: () => height,
  });
};

// The spy delegates to the real computed style (testing-library reads
// getPropertyValue through it) and overrides only the measured fields.
const mockComputedStyle = () => {
  const real = window.getComputedStyle.bind(window);
  return vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
    const computed = real(element);
    return new Proxy(computed, {
      get(target, prop) {
        switch (prop) {
          case 'lineHeight':
            return '22px';
          case 'paddingTop':
          case 'paddingBottom':
            return '8px';
          case 'borderTopWidth':
          case 'borderBottomWidth':
            return '0px';
          case 'boxSizing':
            return 'border-box';
          default:
            return Reflect.get(target, prop, target);
        }
      },
    });
  });
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Textarea autosize', () => {
  it('is on by default: the height follows the content', () => {
    mockComputedStyle();
    render(<Textarea aria-label="Notes" />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    mockScrollHeight(textarea, 96);
    fireEvent.input(textarea);
    expect(textarea.style.height).toBe('96px');
    expect(textarea.style.overflowY).toBe('hidden');
  });

  it('leaves no inline sizing with autoSize={false}', () => {
    render(<Textarea aria-label="Notes" autoSize={false} />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.style.height).toBe('');
    expect(textarea.style.overflowY).toBe('');
  });

  it('raises the baseline with minRows', () => {
    mockComputedStyle();
    render(<Textarea aria-label="Notes" autoSize={{ minRows: 3 }} />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    mockScrollHeight(textarea, 30);
    fireEvent.input(textarea);
    // 3 rows × 22px line-height + 2 × 8px block padding = 82px
    expect(textarea.style.height).toBe('82px');
    expect(textarea.style.overflowY).toBe('hidden');
  });

  it('clamps at maxRows and scrolls inside beyond it', () => {
    mockComputedStyle();
    render(<Textarea aria-label="Notes" autoSize={{ maxRows: 2 }} />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    mockScrollHeight(textarea, 500);
    fireEvent.input(textarea);
    // 2 rows × 22px line-height + 2 × 8px block padding = 60px
    expect(textarea.style.height).toBe('60px');
    expect(textarea.style.overflowY).toBe('auto');
  });

  it('re-measures after the footer clear (uncontrolled path)', () => {
    mockComputedStyle();
    render(<Textarea aria-label="Notes" clearable defaultValue="long" />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    mockScrollHeight(textarea, 40);
    fireEvent.click(screen.getByRole('button', { name: '清除' }));
    expect(textarea.style.height).toBe('40px');
  });
});
