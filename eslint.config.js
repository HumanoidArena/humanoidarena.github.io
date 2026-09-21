import js from "@eslint/js";
import globals from "globals";

/**
 * The page's scripts, checked for correctness only. Formatting is not enforced: the
 * content tables in `js/` are hand-aligned so they read as tables.
 */
export default [
  {
    files: ["js/**/*.js"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.browser },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
];
