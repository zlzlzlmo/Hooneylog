import '@testing-library/jest-dom';
import { vi } from 'vitest';

// The header reads the route on every page, so every component test would
// otherwise have to stub next/navigation itself. Tests that care about a
// specific route override these with vi.mocked(...).
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));
