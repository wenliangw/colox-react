import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Reset the rendered DOM between tests (globals are off, so auto-cleanup is too).
afterEach(() => {
  cleanup();
});
