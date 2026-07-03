import { nextJsConfig } from "@hooneylog/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
const config = [
  ...nextJsConfig,
  {
    // One-off Notion helper scripts (CommonJS, run manually via node).
    ignores: ["scripts/**"],
  },
];

export default config;
