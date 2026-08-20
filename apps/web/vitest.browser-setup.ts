// next/link reads process.env at module scope; the browser has no `process`.
(globalThis as unknown as { process: { env: Record<string, string> } }).process ??= {
  env: { NODE_ENV: 'test' },
};

import '@testing-library/jest-dom/vitest';
// Real stylesheet, real browser: the layout assertions measure the shipped CSS.
import './src/app/globals.css';
