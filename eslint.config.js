import nesvelConfig from "@nesvel/eslint-config";

export default [
  ...nesvelConfig,
  {
    ignores: ["dist/**", "node_modules/**", "*.config.js", "*.config.ts"],
  },
  {
    rules: {
      // Add any package-specific rule overrides here
    },
  },
];
