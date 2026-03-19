import '@testing-library/jest-dom';
import { afterEach, beforeEach } from 'vitest';

// Reset localStorage between tests to prevent state bleed
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

// Polyfill crypto.randomUUID for jsdom (Node 22+ has it but ensure availability)
if (typeof crypto === 'undefined' || !crypto.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
      },
    },
  });
}
