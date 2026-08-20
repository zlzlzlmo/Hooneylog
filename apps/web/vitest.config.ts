import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import path from 'path';

const alias = { '@': path.resolve(__dirname, './src') };

// The browser project renders real components against the real stylesheet, so
// the two Next modules that need a Next runtime are swapped for local stubs.
// Order matters: Vite matches aliases in order, so the specific entries must come
// before the '@' prefix or they never win.
const browserAlias = {
  '@/components/layout/site-footer': path.resolve(__dirname, './src/test/stubs/site-footer.tsx'),
  'next/image': path.resolve(__dirname, './src/test/stubs/next-image.tsx'),
  'next/navigation': path.resolve(__dirname, './src/test/stubs/next-navigation.ts'),
  ...alias,
};

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  test: {
    projects: [
      {
        plugins: [react()],
        resolve: { alias },
        test: {
          name: 'unit',
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
          globals: true,
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/**/*.browser.test.{ts,tsx}'],
        },
      },
      {
        plugins: [react()],
        resolve: { alias: browserAlias },
        test: {
          name: 'browser',
          globals: true,
          include: ['src/**/*.browser.test.{ts,tsx}'],
          setupFiles: ['./vitest.browser-setup.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            screenshotFailures: false,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
