import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Textarea } from '../textarea';

const mockScrollHeight = (element: HTMLElement, height: number) => {
  Object.defineProperty(element, 'scrollHeight', {
    configurable: true,
    get: () => height,
  });
};

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

// jsdom has no layout: the box reads zero, so the drag math starts from a
// mocked bounding box (real browsers read the live box).
const mockBox = (element: HTMLElement, height: number) =>
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 320,
    bottom: height,
    width: 320,
    height,
    toJSON: () => ({}),
  } as DOMRect);

// Pointer events are dispatched as MouseEvents so the tests stay
// independent of jsdom's PointerEvent support; React synthesizes the
// pointer event types from the event name.
const pointerDown = (element: Element, clientY: number) =>
  fireEvent(element, new MouseEvent('pointerdown', { bubbles: true, cancelable: true, clientY }));
const pointerMove = (clientY: number) =>
  fireEvent(window, new MouseEvent('pointermove', { clientY }));
const pointerUp = () => fireEvent(window, new MouseEvent('pointerup', {}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Textarea resize handle', () => {
  it('renders in the unbounded growth worlds only', () => {
    const { rerender } = render(<Textarea aria-label="Notes" />);
    expect(screen.getByRole('button', { name: 'Resize textarea' })).toBeInTheDocument();
    rerender(<Textarea aria-label="Notes" autoSize={{ minRows: 3 }} />);
    expect(screen.getByRole('button', { name: 'Resize textarea' })).toBeInTheDocument();
    rerender(<Textarea aria-label="Notes" autoSize={{ maxRows: 4 }} />);
    expect(screen.queryByRole('button', { name: 'Resize textarea' })).toBeNull();
    rerender(<Textarea aria-label="Notes" autoSize={{ minRows: 2, maxRows: 4 }} />);
    expect(screen.queryByRole('button', { name: 'Resize textarea' })).toBeNull();
    rerender(<Textarea aria-label="Notes" autoSize={false} />);
    expect(screen.queryByRole('button', { name: 'Resize textarea' })).toBeNull();
  });

  it('drags the height but never below the content floor', () => {
    mockComputedStyle();
    render(<Textarea aria-label="Notes" />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    const handle = screen.getByRole('button', { name: 'Resize textarea' });
    mockScrollHeight(textarea, 40);
    mockBox(textarea, 50);
    pointerDown(handle, 100);
    pointerMove(190);
    expect(textarea.style.height).toBe('140px'); // 50 + 90
    pointerMove(60);
    expect(textarea.style.height).toBe('40px'); // 50 - 40, clamped to the floor
    pointerUp();
  });

  it('keeps the dragged height as the minimum across typing', () => {
    mockComputedStyle();
    render(<Textarea aria-label="Notes" />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    const handle = screen.getByRole('button', { name: 'Resize textarea' });
    mockScrollHeight(textarea, 40);
    mockBox(textarea, 50);
    pointerDown(handle, 100);
    pointerMove(190);
    pointerUp();
    expect(textarea.style.height).toBe('140px');
    fireEvent.input(textarea);
    expect(textarea.style.height).toBe('140px'); // the manual minimum outlives keystrokes
  });

  it('steps one row per arrow key and floors at the content height', () => {
    mockComputedStyle();
    render(<Textarea aria-label="Notes" />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    const handle = screen.getByRole('button', { name: 'Resize textarea' });
    mockScrollHeight(textarea, 40);
    mockBox(textarea, 50);
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    expect(textarea.style.height).toBe('72px'); // 50 + one 22px row
    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    expect(textarea.style.height).toBe('40px'); // 50 - 22 → floored at the content
  });

  it('is inert when disabled', () => {
    render(<Textarea aria-label="Notes" disabled />);
    expect(screen.getByRole('button', { name: 'Resize textarea' })).toBeDisabled();
  });
});
