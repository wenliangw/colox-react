import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tooltip } from '..';

describe('Tooltip channel compilation', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects both channels at once (content prop + Content part)', () => {
    expect(() =>
      render(
        <Tooltip content="props">
          <Tooltip.Trigger>
            <button type="button">x</button>
          </Tooltip.Trigger>
          <Tooltip.Content>composed</Tooltip.Content>
        </Tooltip>,
      ),
    ).toThrow(/either the `content` prop/);
  });

  it('rejects composed mode without a Trigger', () => {
    expect(() =>
      render(
        <Tooltip>
          <Tooltip.Content>orphan</Tooltip.Content>
        </Tooltip>,
      ),
    ).toThrow(/require a <Tooltip\.Trigger>/);
  });

  it('rejects duplicated Triggers', () => {
    expect(() =>
      render(
        <Tooltip>
          <Tooltip.Trigger>
            <button type="button">a</button>
          </Tooltip.Trigger>
          <Tooltip.Trigger>
            <button type="button">b</button>
          </Tooltip.Trigger>
          <Tooltip.Content>body</Tooltip.Content>
        </Tooltip>,
      ),
    ).toThrow(/exactly one <Tooltip\.Trigger>/);
  });

  it('rejects duplicated Content parts', () => {
    expect(() =>
      render(
        <Tooltip>
          <Tooltip.Trigger>
            <button type="button">a</button>
          </Tooltip.Trigger>
          <Tooltip.Content>one</Tooltip.Content>
          <Tooltip.Content>two</Tooltip.Content>
        </Tooltip>,
      ),
    ).toThrow(/at most one <Tooltip\.Content>/);
  });

  it('rejects a Trigger without an element host', () => {
    expect(() =>
      render(
        <Tooltip>
          <Tooltip.Trigger>{'plain text'}</Tooltip.Trigger>
        </Tooltip>,
      ),
    ).toThrow(/requires exactly one element child/);
  });

  it('rejects multiple trigger children in props mode', () => {
    expect(() =>
      render(
        <Tooltip content="hint">
          <button type="button">a</button>
          <button type="button">b</button>
        </Tooltip>,
      ),
    ).toThrow(/exactly one trigger element child/);
  });
});
