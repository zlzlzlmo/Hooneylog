import { globalIgnores } from 'eslint/config';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReact from 'eslint-plugin-react';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';
import pluginNext from '@next/eslint-plugin-next';
import checkFilePlugin from 'eslint-plugin-check-file';
import { config as baseConfig } from './base.js';

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const nextJsConfig = [
  // baseConfig already brings js.recommended, tseslint.recommended and prettier.
  ...baseConfig,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  // React Compiler-powered rules ship in the plugin's own flat preset; spreading
  // `configs.recommended.rules` by hand silently drops the plugin wiring it expects.
  pluginReactHooks.configs.flat.recommended,
  pluginJsxA11y.flatConfigs.recommended,
  {
    plugins: {
      '@next/next': pluginNext,
      'check-file': checkFilePlugin,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/*.{ts,tsx}': 'KEBAB_CASE',
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
      'check-file/folder-naming-convention': [
        'error',
        {
          '**/components/**': 'KEBAB_CASE',
          '**/lib/**': 'KEBAB_CASE',
        },
      ],
    },
  },
  {
    settings: { react: { version: 'detect' } },
    rules: {
      // React scope no longer necessary with new JSX transform.
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  {
    // Global import rules.
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', '../../*', '../../../*', '../../../../*'],
              message: "상대 경로 깊이가 너무 깊습니다. '@/...' 형태의 절대 경로를 사용하세요.",
            },
            {
              // Routes are the top layer: nothing may reach back into them.
              group: ['@/app/*'],
              message: '아키텍처 위반: 하위 레이어에서 라우트(app)를 임포트할 수 없습니다.',
            },
          ],
        },
      ],
    },
  },
  {
    // Server-only data access (lib/notion, lib/views, …) must not be pulled into
    // client components; go through a route handler in `services/` instead.
    files: ['**/components/**', '**/hooks/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/lib/notion', '@/lib/views', '@/lib/view-guard'],
              message:
                '아키텍처 위반: 서버 전용 데이터 접근은 서버 컴포넌트나 route handler에서만 사용하세요 (services/ 경유).',
            },
            {
              group: ['../*', '../../*', '../../../*', '../../../../*'],
              message: "상대 경로 깊이가 너무 깊습니다. '@/...' 형태의 절대 경로를 사용하세요.",
            },
            {
              group: ['@/app/*'],
              message: '아키텍처 위반: 하위 레이어에서 라우트(app)를 임포트할 수 없습니다.',
            },
          ],
        },
      ],
    },
  },
];
