import { vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'

Object.defineProperty(window, 'prompt', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(window, 'alert', {
  writable: true,
  value: vi.fn(),
});

beforeEach(() => {
  vi.clearAllMocks();
});
