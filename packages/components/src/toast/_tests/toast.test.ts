import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toast } from '../index';
import { toastFactory, TOAST_DEFAULT_POSITION } from '../api';
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
    expect(entry.variant).toBe('toast');
    expect(entry.type).toBe('info');
    expect(entry.position).toBe(TOAST_DEFAULT_POSITION);
    expect(entry.content).toBe('Saved');
  });

  it('routes into the named scope', () => {
    Toast.error('Failed', { scope: 'chat' });
    const chat = messageFactory.getOrCreate('chat');
    const [entry] = chat.getSnapshot();
    expect(entry.type).toBe('error');
    expect(messageFactory.getOrCreate().getSnapshot()).toHaveLength(0);
  });

  it('supports all tone shortcuts', () => {
    Toast.success('ok');
    Toast.warning('careful');
    Toast.error('bad');
    const entries = messageFactory.getOrCreate().getSnapshot();
    expect(entries.map((e) => e.type)).toEqual(['success', 'warning', 'error']);
  });

  it('custom renders arbitrary content', () => {
    Toast.custom('widget');
    const [entry] = messageFactory.getOrCreate().getSnapshot();
    expect(entry.content).toBe('widget');
  });

  it('update patches a live toast by key', () => {
    Toast.info('one', { key: 'k' });
    Toast.update('k', { content: 'two' });
    const [entry] = messageFactory.getOrCreate().getSnapshot();
    expect(entry.content).toBe('two');
  });

  it('dismiss closes one toast by id', () => {
    const id = Toast.info('a');
    Toast.dismiss(id);
    expect(messageFactory.getOrCreate().getSnapshot()[0].status).toBe('exiting');
  });

  it('dismiss with no key clears the scope', () => {
    Toast.info('a');
    Toast.info('b');
    Toast.dismiss();
    const entries = messageFactory.getOrCreate().getSnapshot();
    expect(entries.every((e) => e.status === 'exiting')).toBe(true);
  });

  it('toast and notify share the same scope container', () => {
    Toast.info('toast msg', { scope: 'shared' });
    Notify.info({ title: 't', content: 'notify msg' }, { scope: 'shared' });
    const shared = messageFactory.getOrCreate('shared');
    const variants = shared
      .getSnapshot()
      .map((e) => e.variant)
      .sort();
    expect(variants).toEqual(['notify', 'toast']);
  });

  it('the factory instance is registered as the toast renderer', () => {
    expect(toastFactory.getRenderer('toast')).toBeDefined();
  });
});
