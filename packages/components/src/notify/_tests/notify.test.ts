import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Notify } from '../index';
import { notifyFactory, NOTIFY_DEFAULT_POSITION } from '../api';
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
    expect(entry.variant).toBe('notify');
    expect(entry.type).toBe('info');
    expect(entry.position).toBe(NOTIFY_DEFAULT_POSITION);
    expect(entry.title).toBe('Sync');
    expect(entry.content).toBe('Done');
  });

  it('routes into the named scope', () => {
    Notify.error({ content: 'Failed' }, { scope: 'alerts' });
    const [entry] = messageFactory.getOrCreate('alerts').getSnapshot();
    expect(entry.type).toBe('error');
    expect(messageFactory.getOrCreate().getSnapshot()).toHaveLength(0);
  });

  it('supports all tone shortcuts', () => {
    Notify.success({ content: 'ok' });
    Notify.warning({ content: 'careful' });
    Notify.error({ content: 'bad' });
    const entries = messageFactory.getOrCreate().getSnapshot();
    expect(entries.map((e) => e.type)).toEqual(['success', 'warning', 'error']);
  });

  it('custom renders arbitrary content', () => {
    Notify.custom('widget');
    const [entry] = messageFactory.getOrCreate().getSnapshot();
    expect(entry.content).toBe('widget');
  });

  it('update patches a live notify by key', () => {
    Notify.info({ content: 'one', key: 'k' });
    Notify.update('k', { content: 'two' });
    const [entry] = messageFactory.getOrCreate().getSnapshot();
    expect(entry.content).toBe('two');
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

  it('the factory instance is registered as the notify renderer', () => {
    expect(notifyFactory.getRenderer('notify')).toBeDefined();
  });
});
