import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom lacks a few browser APIs that Radix / responsive components touch.
// Use a loosely-typed alias so assigning to always-declared lib.dom globals
// doesn't get narrowed to `never`.
const g = globalThis as unknown as {
  matchMedia?: (query: string) => MediaQueryList;
  ResizeObserver?: unknown;
};

if (!g.matchMedia) {
  g.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

if (!g.ResizeObserver) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  g.ResizeObserver = ResizeObserverStub;
}

// Radix relies on this in some flows; stub if absent.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

afterEach(() => cleanup());
