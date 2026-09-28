import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Notify } from '../index';
import { notifyFactory } from '../factory';
import { NOTIFY_DEFAULT_POSITION, NOTIFY_DEFAULT_STRATEGY } from '../constants/defaults';
import { messageFactory } from '../../cdk/message';

describe('Notify namespace', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    messageFactory.clearAll();
    vi.useRealTimers();
  });

  it('routes into the root scope by default with top-right position', () => {
    Notify.info({ title: 'Sync', content: 'Done' });
    const [entry] = messageFactory.getOrCreate().getSnapshot();
    expect(entry.type).toBe('notify');
    expect(entry.mode).toBe('info');
    expect(entry.position).toBe(NOTIFY_DEFAULT_POSITION);
    expect(entry.title).toBe('Sync');
    expect(entry.content).toBe('Done');
  });

  it('routes into the named scope', () => {
    Notify.error({ content: 'Failed' }, { scope: 'alerts' });
    const [entry] = messageFactory.getOrCreate('alerts').getSnapshot();
    expect(entry.mode).toBe('error');
    expect(messageFactory.getOrCreate().getSnapshot()).toHaveLength(0);
  });

  it('supports all mode shortcuts', () => {
    Notify.success({ content: 'ok' });
    Notify.warning({ content: 'careful' });
    Notify.error({ content: 'bad' });
    const entries = messageFactory.getOrCreate().getSnapshot();
    expect(entries.map((e) => e.mode)).toEqual(['success', 'warning', 'error']);
  });

  it('defaults the palette to the mode and the variant to plain', () => {
    Notify.error({ content: 'bad' });
    const [entry] = messageFactory.getOrCreate().getSnapshot();
    expect(entry.palette).toBe('error');
    expect(entry.variant).toBe('plain');
  });

  it('accepts palette/variant overrides', () => {
    Notify.info({ content: 'hi', palette: 'primary', variant: 'solid' });
    const [entry] = messageFactory.getOrCreate().getSnapshot();
    expect(entry.palette).toBe('primary');
    expect(entry.variant).toBe('solid');
  });

  it('defaults the renderer chrome on: mode icon + close button', () => {
    Notify.info({ title: 't', content: 'c' });
    const [entry] = messageFactory.getOrCreate().getSnapshot();
    expect(entry.showIcon).toBe(true);
    expect(entry.closeable).toBe(true);
  });

  it('honors showIcon and closeable options', () => {
    Notify.info({ title: 't', content: 'c' }, { showIcon: false, closeable: false });
    const [entry] = messageFactory.getOrCreate().getSnapshot();
    expect(entry.showIcon).toBe(false);
    expect(entry.closeable).toBe(false);
  });

  it('passes data through and fires onClose with { id, data }', () => {
    const closed: Array<{ id: string; data?: unknown }> = [];
    const id = Notify.info(
      { title: 'Sync', content: 'Done' },
      {
        data: { file: 'a.md' },
        onClose: (payload) => closed.push(payload),
      },
    );
    expect(messageFactory.getOrCreate().getSnapshot()[0].data).toEqual({ file: 'a.md' });
    Notify.dismiss(id);
    expect(closed).toEqual([{ id, data: { file: 'a.md' } }]);
  });

  it('custom renders arbitrary content', () => {
    Notify.custom('widget');
    const [entry] = messageFactory.getOrCreate().getSnapshot();
    expect(entry.content).toBe('widget');
  });

  it('update patches a live notify by key instantly with a zoom re-mount', () => {
    Notify.info({ content: 'one', key: 'k' });
    Notify.update('k', { content: 'two' });
    // instant: updates never dip the container — the new payload lands
    // right away and the contentVersion bump re-mounts the body node
    // for the zoom entrance
    const [entry] = messageFactory.getOrCreate().getSnapshot();
    expect(entry.content).toBe('two');
    expect(entry.contentVersion).toBe(1);
  });

  it('dismiss closes one notify by id', () => {
    const id = Notify.info({ content: 'a' });
    Notify.dismiss(id);
    expect(messageFactory.getOrCreate().getSnapshot()[0].status).toBe('exiting');
  });

  it('dismiss with no key clears the scope', () => {
    Notify.info({ content: 'a' });
    Notify.info({ content: 'b' });
    Notify.dismiss();
    const entries = messageFactory.getOrCreate().getSnapshot();
    expect(entries.every((e) => e.status === 'exiting')).toBe(true);
  });

  it('defaults to the stack strategy', () => {
    expect(NOTIFY_DEFAULT_STRATEGY).toBe('stack');
    Notify.info({ content: 'a' });
    Notify.info({ content: 'b' });
    expect(messageFactory.getOrCreate().getSnapshot()).toHaveLength(2);
  });

  it('the factory instance is registered as the notify renderer', () => {
    expect(notifyFactory.getRenderer('notify')).toBeDefined();
  });
});
