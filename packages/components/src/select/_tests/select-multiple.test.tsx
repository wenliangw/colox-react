import { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Select } from '../select';
import { countFittingTags } from '../utils/tag-fitting';

// A fragment member block: the compiler walks fragments, arrays and
// custom wrappers (the member leaf never renders itself).
const FruitOptions = (
  <>
    <Select.Option value="apple" text="Apple" />
    <Select.Option value="banana" text="Banana" />
    <Select.Option value="cherry" text="Cherry" disabled />
    <Select.Option value="date" text="Date" />
  </>
);

const renderFruits = (props: object = {}) =>
  render(
    <Select mode="multiple" placeholder="Pick fruits" {...props}>
      {FruitOptions}
    </Select>,
  );

describe('Select multiple choosing', () => {
  it('keeps the panel open after a pick and adds chips', () => {
    const onChange = vi.fn();
    renderFruits({ onChange });
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    fireEvent.click(screen.getByRole('option', { name: 'Apple' }));

    expect(combobox).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Remove Apple' })).toBeInTheDocument();

    expect(onChange).toHaveBeenCalledTimes(1);
    const [payload] = onChange.mock.calls[0];
    expect(payload.value).toEqual(['apple']);
    expect(payload).toMatchObject({
      option: { value: 'apple', text: 'Apple', disabled: false },
    });
    expect(payload.event.target).toHaveAttribute('aria-label', 'Apple');
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true');
  });

  it('toggles members out of the selection on a second pick', () => {
    renderFruits({ defaultValue: ['apple', 'banana'] });
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    fireEvent.click(screen.getByRole('option', { name: 'Apple' }));
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.queryByRole('button', { name: 'Remove Apple' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Remove Banana' })).toBeInTheDocument();
  });

  it('keeps the focus on the control after a click pick', () => {
    renderFruits();
    const combobox = screen.getByRole('combobox');
    combobox.focus();
    fireEvent.click(combobox);
    fireEvent.click(screen.getByRole('option', { name: 'Banana' }));
    expect(combobox).toHaveFocus();
  });

  it('removes a chip via its remove button', () => {
    const onChange = vi.fn();
    renderFruits({ defaultValue: ['apple', 'banana'], onChange });
    fireEvent.click(screen.getByRole('button', { name: 'Remove Banana' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const [payload] = onChange.mock.calls[0];
    expect(payload.value).toEqual(['apple']);
    expect(payload).toMatchObject({
      option: { value: 'banana', text: 'Banana', disabled: false },
    });
    expect(payload.event.target).toHaveAttribute('aria-label', 'Remove Banana');
  });

  it('ignores disabled members', () => {
    const onChange = vi.fn();
    renderFruits({ onChange });
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Cherry' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows member text as the chip label even under a rich render', () => {
    render(
      <Select mode="multiple" defaultValue={['apple']}>
        <Select.Option value="apple" text="Apple">
          <strong>🍏 Apple</strong>
        </Select.Option>
      </Select>,
    );
    expect(screen.getByRole('button', { name: 'Remove Apple' })).toBeInTheDocument();
    expect(screen.queryByText('🍏 Apple')).toBeNull();
  });

  it('clears every chip with one click and an empty array payload', () => {
    const onChange = vi.fn();
    renderFruits({ defaultValue: ['apple', 'banana'], clearable: true, onChange });
    const clear = screen.getByRole('button', { name: 'Clear selection' });
    fireEvent.click(clear);
    expect(onChange).toHaveBeenCalledTimes(1);
    const [payload] = onChange.mock.calls[0];
    expect(payload).toMatchObject({ value: [], option: undefined });
    expect(screen.queryByRole('button', { name: 'Remove Apple' })).toBeNull();
  });

  it('shows the placeholder through the control while empty', () => {
    renderFruits();
    const combobox = screen.getByRole('combobox');
    expect(combobox.tagName).toBe('INPUT');
    expect(combobox).toHaveValue('');
    expect(combobox).toHaveAttribute('placeholder', 'Pick fruits');
  });

  it('filters the members while typing in multiple mode', () => {
    renderFruits({ showSearch: true });
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    fireEvent.change(combobox, { target: { value: 'an' } });
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Apple' })).toBeNull();
    expect(screen.queryByRole('option', { name: 'Date' })).toBeNull();
  });
});

describe('Select multiple keyboard', () => {
  it('appends via ArrowDown + Enter and keeps the panel open', () => {
    const onChange = vi.fn();
    renderFruits({ onChange });
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    fireEvent.keyDown(combobox, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledTimes(1);
    const [payload] = onChange.mock.calls[0];
    expect(payload.value).toEqual(['apple']);
    expect(payload).toMatchObject({
      option: { value: 'apple', text: 'Apple', disabled: false },
    });
    expect(payload.event.key).toBe('Enter');
    expect(combobox).toHaveAttribute('aria-expanded', 'true');
  });

  it('removes on Enter over the highlighted chosen option', () => {
    const onChange = vi.fn();
    renderFruits({ defaultValue: ['apple'], onChange });
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    // Chosen apple is the walk start; Enter toggles it back out.
    fireEvent.keyDown(combobox, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledTimes(1);
    const [payload] = onChange.mock.calls[0];
    expect(payload.value).toEqual([]);
    expect(payload).toMatchObject({
      option: { value: 'apple', text: 'Apple', disabled: false },
    });
    expect(combobox).toHaveAttribute('aria-expanded', 'true');
  });

  it('removes the last chip on an empty-query Backspace', () => {
    const onChange = vi.fn();
    renderFruits({ defaultValue: ['apple', 'banana'], onChange });
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Backspace' });

    expect(onChange).toHaveBeenCalledTimes(1);
    const [payload] = onChange.mock.calls[0];
    expect(payload.value).toEqual(['apple']);
    expect(payload).toMatchObject({
      option: { value: 'banana', text: 'Banana', disabled: false },
    });
    expect(payload.event.key).toBe('Backspace');
  });

  it('does not remove chips on Backspace while a query is typed', () => {
    const onChange = vi.fn();
    renderFruits({ defaultValue: ['apple'], onChange });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'ap' } });
    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Backspace' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clears the query on Escape without losing the selection', () => {
    const onChange = vi.fn();
    renderFruits({ defaultValue: ['apple'], onChange });
    const combobox = screen.getByRole('combobox');
    fireEvent.click(combobox);
    fireEvent.change(combobox, { target: { value: 'ap' } });
    expect(combobox).toHaveValue('ap');

    fireEvent.keyDown(combobox, { key: 'Escape' });
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('stands on the field after walks and picks', () => {
    renderFruits();
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveClass(
      'colox-select__option--active',
    );
    fireEvent.keyDown(combobox, { key: 'Enter' });
    expect(combobox).toHaveValue('');
    expect(combobox).toHaveAttribute('aria-expanded', 'true');
  });

  it('marks the walking rows as active on the control', () => {
    renderFruits();
    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    expect(combobox).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Apple' }).id,
    );
  });
});

describe('Select multiple open/close', () => {
  it('opens the panel on a shell click outside the control', () => {
    renderFruits();
    const shell = screen.getByRole('combobox').closest('.colox-select');
    expect(shell).not.toBeNull();
    fireEvent.click(shell as HTMLElement);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('stays closed when clicking a chip remove while closed', () => {
    renderFruits({ defaultValue: ['apple'] });
    fireEvent.click(screen.getByRole('button', { name: 'Remove Apple' }));
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('closes on outside pointerdown', () => {
    renderFruits();
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});

describe('Select multiple form collection', () => {
  it('mounts one hidden input per value', () => {
    const { container } = renderFruits({
      name: 'fruits',
      defaultValue: ['apple', 'banana'],
    });
    const hidden = container.querySelectorAll<HTMLInputElement>('input[type="hidden"]');
    expect(hidden).toHaveLength(2);
    expect(Array.from(hidden).map((input) => input.value)).toEqual(['apple', 'banana']);
    expect(Array.from(hidden).every((input) => input.name === 'fruits')).toBe(true);
  });
});

describe('Select multiple states', () => {
  it('disables the control and every chip remove', () => {
    renderFruits({ disabled: true, defaultValue: ['apple'] });
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove Apple' })).toBeDisabled();
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('inherits the shell size tier', () => {
    renderFruits({ size: 'sm' });
    expect(screen.getByRole('combobox').closest('.colox-select')).toHaveClass('colox-select--sm');
  });
});

describe('Select multiple refs', () => {
  it('exposes the search control', () => {
    const ref = createRef<HTMLInputElement | HTMLButtonElement>();
    renderFruits({ ref });
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

describe('Select multiple tag folding', () => {
  it('counts every chip while they fit the row', () => {
    expect(countFittingTags([40, 40, 40], 4, 200, 32)).toBe(3);
  });

  it('folds the tail once the badge needs room', () => {
    // Total 216 > 200; with the badge reserved only three chips end
    // before the 164px fold limit.
    expect(countFittingTags([40, 40, 40, 40, 40], 4, 200, 32)).toBe(3);
  });

  it('folds even the first chip when it cannot fit alone', () => {
    expect(countFittingTags([300], 4, 200, 32)).toBe(0);
  });

  it('returns zero for an empty selection', () => {
    expect(countFittingTags([], 4, 200, 32)).toBe(0);
  });

  it('keeps the overflow badge hidden while nothing overflows', () => {
    // jsdom has no layout (clientWidth 0), so the row shows every chip
    // and the +M badge stays hidden.
    renderFruits({ defaultValue: ['apple', 'banana'] });
    expect(screen.getByRole('button', { name: 'Remove Apple' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Banana' })).toBeInTheDocument();
    expect(document.querySelector('.colox-select__tag-overflow')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('recounts against the inner budget and re-expands when the shell widens', () => {
    // Regression guard: the fold budget is the inner width minus the
    // constant reservations (control CSS floor, trailing, gaps). The
    // trap is a control whose *current* width (greedily absorbing the
    // space freed by the fold — mocked to 220 here) enters the budget:
    // the count then feeds on its own layout and collapses into a lone
    // +M badge.
    const observers: Array<{ callback: () => void }> = [];
    class CapturingResizeObserver {
      public readonly callback: () => void;
      constructor(callback: () => void) {
        this.callback = callback;
        observers.push(this);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', CapturingResizeObserver);

    const { container } = render(
      <Select
        mode="multiple"
        defaultValue={['o1', 'o2', 'o3', 'o4', 'o5', 'o6']}
        placeholder="Pick items"
      >
        <Select.Option value="o1" text="One" />
        <Select.Option value="o2" text="Two" />
        <Select.Option value="o3" text="Three" />
        <Select.Option value="o4" text="Four" />
        <Select.Option value="o5" text="Five" />
        <Select.Option value="o6" text="Six" />
      </Select>,
    );
    const inner = container.querySelector('.colox-select__inner') as HTMLElement;
    const row = container.querySelector('.colox-select__tags') as HTMLElement;
    const control = container.querySelector('.colox-select__control') as HTMLElement;
    const trailing = container.querySelector('.colox-select__trailing') as HTMLElement;
    const badge = container.querySelector('.colox-select__tag-overflow') as HTMLElement;

    const defineWidth = (
      el: HTMLElement,
      prop: 'clientWidth' | 'offsetWidth',
      value: () => number,
    ) => {
      Object.defineProperty(el, prop, { configurable: true, get: value });
    };
    let innerWidth = 260;
    defineWidth(inner, 'clientWidth', () => innerWidth);
    // The greedy control width: far beyond its 2ch floor — must not
    // affect the budget at all.
    defineWidth(control, 'offsetWidth', () => 220);
    defineWidth(trailing, 'offsetWidth', () => 20);
    defineWidth(badge, 'offsetWidth', () => 26);
    Array.from(row.querySelectorAll('.colox-select__tag')).forEach((chip) => {
      defineWidth(chip as HTMLElement, 'offsetWidth', () => 44);
    });

    const realGetComputedStyle = window.getComputedStyle;
    const getComputedStyle = vi
      .spyOn(window, 'getComputedStyle')
      .mockImplementation((el: Element) => {
        const base = realGetComputedStyle(el);
        if (el === inner) {
          return { ...base, columnGap: '4px' } as CSSStyleDeclaration;
        }
        if (el === control) {
          return { ...base, minWidth: '8px' } as CSSStyleDeclaration;
        }
        return base;
      });

    // budget = 260 - 8 (floor, not the 220 current width) - 20 - 8
    // = 224; chips 44 with gap 0: 6 x 44 = 264 > 224 -> fold pass
    // limit 224 - 26 = 198 -> 4 chips fit, 2 slide under the badge.
    act(() => {
      for (const { callback } of observers) {
        callback();
      }
    });
    let chips = Array.from(row.querySelectorAll('.colox-select__tag')) as HTMLElement[];
    expect(chips.filter((chip) => !chip.hasAttribute('aria-hidden'))).toHaveLength(4);
    expect(chips.filter((chip) => chip.hasAttribute('aria-hidden'))).toHaveLength(2);
    expect(badge).not.toHaveAttribute('aria-hidden');
    expect(badge.textContent).toBe('+2');

    // Widening the inner (not the row!) grows the slice back up.
    innerWidth = 340;
    act(() => {
      for (const { callback } of observers) {
        callback();
      }
    });
    chips = Array.from(row.querySelectorAll('.colox-select__tag')) as HTMLElement[];
    expect(chips.filter((chip) => !chip.hasAttribute('aria-hidden'))).toHaveLength(6);
    expect(badge).toHaveAttribute('aria-hidden', 'true');

    getComputedStyle.mockRestore();
    vi.unstubAllGlobals();
  });
});
