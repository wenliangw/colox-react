import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toast } from '../index';
import { toastFactory } from '../factory';
import { TOAST_DEFAULT_POSITION, TOAST_DEFAULT_STRATEGY } from '../constants/defaults';
import { messageFactory } from '../../cdk/message';
import { Notify } from '../../notify';

describe('Toast namespace', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    messageFactory.clearAll();
    vi.useRealTimers();
  });

  it('routes into the root scope by default with top-center position', () => {
    Toast.info('Saved');
    const root = messageFactory.getOrCreate();
    const [entry] = root.getSnapshot();
    expect(entry.type).toBe('toast');
    expect(entry.mode).toBe('info');
    expect(entry.position).toBe(TOAST_DEFAULT_POSITION);
    expect(entry.content).toBe('Saved');
  });

  it('routes into the named scope', () => {
    Toast.error('Failed', { scope: 'chat' });
    const chat = messageFactory.getOrCreate('chat');
    const [entry] = chat.getSnapshot();
    expect(entry.mode).toBe('error');
    expect(messageFactory.getOrCreate().getSnapshot()).toHaveLength(0);
  });

  it('supports all tone shortcuts', () => {
    Toast.success('ok', { strategy: 'stack' });
    Toast.warning('careful', { strategy: 'stack' });
    Toast.error('bad', { strategy: 'stack' });
    const entries = messageFactory.getOrCreate().getSnapshot();
    expect(entries.map((e) => e.mode)).toEqual(['success', 'warning', 'error']);
  });

  it('defaults the palette to the tone and the variant to plain', () => {
    Toast.error('bad');
    const [entry] = messageFactory.getOrCreate().getSnapshot();
    expect(entry.palette).toBe('error');
    expect(entry.variant).toBe('plain');
  });

  it('defaults the renderer chrome on: tone icon + close button', () => {
    Toast.info('saved');
    const [entry] = messageFactory.getOrCreate().getSnapshot();
    expect(entry.showIcon).toBe(true);
    expect(entry.closeable).toBe(true);
  });

  it('honors showIcon and closeable', () => {
    Toast.info('text-only', { showIcon: false, closeable: false });
    const [entry] = messageFactory.getOrCreate().getSnapshot();
    expect(entry.showIcon).toBe(false);
    expect(entry.closeable).toBe(false);
  });

  it('update can toggle the chrome eagerly', () => {
    Toast.info('one', { key: 'k', showIcon: false });
    Toast.update('k', { closeable: false });
    const [entry] = messageFactory.getOrCreate().getSnapshot();
    expect(entry.showIcon).toBe(false);
    expect(entry.closeable).toBe(false);
  });

  it('accepts palette/variant/strategy overrides', () => {
    Toast.info('primary toast', { palette: 'primary', variant: 'solid', strategy: 'stack' });
    const [entry] = messageFactory.getOrCreate().getSnapshot();
    expect(entry.palette).toBe('primary');
    expect(entry.variant).toBe('solid');
    expect(entry.strategy).toBe('stack');
  });

  it('custom renders arbitrary content', () => {
    Toast.custom('widget');
    const [entry] = messageFactory.getOrCreate().getSnapshot();
    expect(entry.content).toBe('widget');
  });

  it('update patches a live toast by key instantly with a zoom re-mount', () => {
    Toast.info('one', { key: 'k' });
    Toast.update('k', { content: 'two' });
    // instant: updates never dip the container — the new payload lands
    // right away and the contentVersion bump re-mounts the content node
    // for the zoom entrance
    const [entry] = messageFactory.getOrCreate().getSnapshot();
    expect(entry.content).toBe('two');
    expect(entry.contentVersion).toBe(1);
  });

  it('passes data through and fires onClose with { id, data }', () => {
    const closed: Array<{ id: string; data?: unknown }> = [];
    const id = Toast.info('saved', {
      key: 'k',
      data: { file: 'a.md' },
      onClose: (payload) => closed.push(payload),
    });
    expect(messageFactory.getOrCreate().getSnapshot()[0].data).toEqual({ file: 'a.md' });
    Toast.dismiss(id);
    expect(closed).toEqual([{ id, data: { file: 'a.md' } }]);
  });

  it('onClose fires when a newer toast replaces the previous one', () => {
    const closed: string[] = [];
    Toast.info('first', {
      key: 'k',
      data: 'first',
      onClose: (payload) => closed.push(String(payload.data)),
    });
    Toast.info('second', { key: 'k', data: 'second' });
    // the replacement lands instantly — the previous payload's job
    // ended right away, and the new payload is already live
    expect(closed).toEqual(['first']);
    const [entry] = messageFactory.getOrCreate().getSnapshot();
    expect(entry.content).toBe('second');
    expect(entry.data).toBe('second');
  });

  it('does not recurse when onClose re-adds a toast (the story demo: close → onClose → Toast.info)', () => {
    let closes = 0;
    const id = Toast.info('This toast reports its own close.', {
      data: 'trace-42',
      onClose: () => {
        closes += 1;
        // the demo's follow-up lands in the same single slot — it must
        // not re-fire this same onClose (that used to recurse forever)
        if (closes === 1) {
          Toast.info('Closed: trace-42');
        }
      },
    });
    // the corner close button calls dismiss(id) — the same path
    Toast.dismiss(id);
    expect(closes).toBe(1);
    const [entry] = messageFactory.getOrCreate().getSnapshot();
    expect(entry.content).toBe('Closed: trace-42');
  });

  it('dismiss closes one toast by id', () => {
    const id = Toast.info('a');
    Toast.dismiss(id);
    expect(messageFactory.getOrCreate().getSnapshot()[0].status).toBe('exiting');
  });

  it('dismiss with no key clears the scope', () => {
    Toast.info('a', { strategy: 'stack' });
    Toast.info('b', { strategy: 'stack' });
    Toast.dismiss();
    const entries = messageFactory.getOrCreate().getSnapshot();
    expect(entries.every((e) => e.status === 'exiting')).toBe(true);
  });

  it('toast and notify share the same scope container', () => {
    Toast.info('toast msg', { scope: 'shared' });
    Notify.info({ title: 't', content: 'notify msg' }, { scope: 'shared' });
    const shared = messageFactory.getOrCreate('shared');
    const faces = shared
      .getSnapshot()
      .map((e) => e.type)
      .sort();
    expect(faces).toEqual(['notify', 'toast']);
  });

  it('defaults to the single strategy', () => {
    expect(TOAST_DEFAULT_STRATEGY).toBe('single');
    const id = Toast.info('a');
    const nextId = Toast.info('b');
    const [entry] = messageFactory.getOrCreate().getSnapshot();
    // single: the newcomer replaces IN PLACE instantly — one toast,
    // same identity, new payload already live with the zoom re-mount
    expect(entry.id).toBe(id);
    expect(nextId).toBe(id);
    expect(entry.content).toBe('b');
    expect(entry.status).toBe('shown');
    expect(entry.contentVersion).toBe(1);
    expect(messageFactory.getOrCreate().getSnapshot()).toHaveLength(1);
  });

  it('single strategy ignores palette/variant — one toast per position', () => {
    Toast.info('a', { variant: 'solid' });
    Toast.info('b', { palette: 'primary', variant: 'outline' });
    const entries = messageFactory.getOrCreate().getSnapshot();
    expect(entries).toHaveLength(1);
    expect(entries[0].content).toBe('b');
    expect(entries[0].palette).toBe('primary');
    expect(entries[0].variant).toBe('outline');
  });

  it('stack strategy piles toasts up', () => {
    Toast.info('a', { strategy: 'stack' });
    Toast.info('b', { strategy: 'stack' });
    const entries = messageFactory.getOrCreate().getSnapshot();
    expect(entries).toHaveLength(2);
    expect(entries.every((e) => e.status === 'shown')).toBe(true);
  });

  it('the factory instance is registered as the toast renderer', () => {
    expect(toastFactory.getRenderer('toast')).toBeDefined();
  });
});
