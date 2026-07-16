import baseConfig from "../../eslint.config.js";

export default [
  ...baseConfig,
  {
    files: ["**/*.ts"],
    rules: {
      "@typescript-eslint/no-var-requires": "off", // Разрешить require()
    },
  },
];
