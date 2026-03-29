import { nextJsConfig } from "@hooneylog/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
const config = [
  ...nextJsConfig,
  {
    ignores: ["fetch_post_content.js", "list_posts.js"],
  },
];

export default config;
