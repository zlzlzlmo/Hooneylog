import js from "@eslint/js";
import { globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import pluginNext from "@next/eslint-plugin-next";
import checkFilePlugin from "eslint-plugin-check-file";
import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const nextJsConfig = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  {
    plugins: {
      "@next/next": pluginNext,
      "check-file": checkFilePlugin,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules,
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/*.{ts,tsx}": "KEBAB_CASE"
        },
        {
          "ignoreMiddleExtensions": true
        }
      ],
      "check-file/folder-naming-convention": [
        "error",
        {
          "**/components/**": "KEBAB_CASE",
          "**/lib/**": "KEBAB_CASE"
        }
      ]
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "react-hooks/exhaustive-deps": "error"
    },
  },
  {
    // Global Import Rules
    rules: {
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["../*", "../../*", "../../../*", "../../../../*"],
              "message": "상대 경로 깊이가 너무 깊습니다. '@/...' 형태의 절대 경로를 사용하세요."
            }
          ]
        }
      ]
    }
  },
  {
    // Domain Layer Constraints
    files: ["**/lib/domain/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["@/lib/infrastructure/*", "@/lib/actions/*", "@/app/*", "@supabase/*"],
              "message": "아키텍처 위반: 도메인 계층(domain)은 순수해야 하며 다른 레이어에 의존할 수 없습니다."
            }
          ]
        }
      ]
    }
  },
  {
    // UI Layer Constraints (app, components)
    files: ["**/app/**", "**/components/**", "**/test/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["@/lib/infrastructure/!(supabase)/**"],
              "message": "아키텍처 위반: UI 계층(app, components)에서 구체적 인프라 구현체에 직접 의존할 수 없습니다. lib/actions를 사용하세요."
            },
            {
              "group": ["@/app/*"],
              "message": "아키텍처 위반: 계층 간 역참조가 발생했습니다. 상위 레이어를 임포트할 수 없습니다."
            }
          ]
        }
      ]
    }
  }
];
