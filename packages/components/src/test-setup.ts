import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// The cdk positioning layer (autoUpdate) needs a ResizeObserver; jsdom
// ships none, so tests run on a no-op stub — the position math itself
// resolves to zero coordinates and never blocks assertions.
if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

// Reset the rendered DOM between tests (globals are off, so auto-cleanup is too).
afterEach(() => {
  cleanup();
});
