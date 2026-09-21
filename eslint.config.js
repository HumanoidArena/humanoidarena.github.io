import globals from "globals";

/**
 * Correctness only: a typo'd import or an unused binding, which on this page would
 * otherwise surface only in the browser console.
 *
 * Formatting is deliberately not enforced. The renderers in `js/` are hand-aligned
 * so the content tables read as tables, and a formatter would reflow them into a
 * large diff that fights the repo's own layout.
 */
export default [
  {
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.browser },
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": "error",
      "no-redeclare": "error",
      "no-self-assign": "error",
      "no-unreachable": "error",
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "always"],
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
];
