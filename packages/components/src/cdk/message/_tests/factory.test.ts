import { afterEach, describe, expect, it } from 'vitest';
import { MessageFactory, messageFactory, ROOT_SCOPE } from '../factory';

describe('MessageFactory', () => {
  afterEach(() => {
    messageFactory.clearAll();
  });

  it('getOrCreate returns the same store for the same scope', () => {
    expect(messageFactory.getOrCreate('chat')).toBe(messageFactory.getOrCreate('chat'));
  });

  it('returns distinct stores for distinct scopes', () => {
    expect(messageFactory.getOrCreate('chat')).not.toBe(messageFactory.getOrCreate('alerts'));
  });

  it('defaults the scope to root', () => {
    expect(messageFactory.getOrCreate()).toBe(messageFactory.getOrCreate(ROOT_SCOPE));
  });

  it('unregister removes the scope', () => {
    const store = messageFactory.getOrCreate('chat');
    expect(messageFactory.get('chat')).toBe(store);
    messageFactory.unregister('chat');
    expect(messageFactory.get('chat')).toBeUndefined();
  });

  it('shares one scope table across factory instances', () => {
    const a = new MessageFactory();
    const b = new MessageFactory();
    const storeA = a.getOrCreate('shared');
    storeA.add({ variant: 'toast', content: 'hi' });
    const storeB = b.getOrCreate('shared');
    expect(storeB.getSnapshot()).toHaveLength(1);
  });
});
