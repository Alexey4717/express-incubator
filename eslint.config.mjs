import tsESLint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';
import importPlugin from 'eslint-plugin-import';

import importConventionsPlugin from './eslint-rules/import-conventions.mjs';

export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/*.js',
      '**/*.mjs',
      '**/*.cjs',
    ],
  },
  {
    files: ['src/**/*.ts', '__tests__/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsESLint,
      import: importPlugin,
      boundaries,
      'import-conventions': importConventionsPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.eslint.json' },
      },
      'boundaries/elements': [
        { type: 'entry', pattern: 'src/index.ts', mode: 'file' },
        { type: 'core', pattern: 'src/core/**/*', mode: 'file' },
        { type: 'module', pattern: 'src/modules/**/*', mode: 'file' },
        { type: 'app', pattern: 'src/app/**/*', mode: 'file' },
        { type: 'test', pattern: '__tests__/**/*', mode: 'file' },
      ],
    },
    rules: {
      ...tsESLint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-var-requires': 'off',
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          message: '${from.type} is not allowed to import ${dependency.type}',
          rules: [
            { from: ['core'], allow: ['core'] },
            { from: ['module'], allow: ['core', 'module'] },
            { from: ['app'], allow: ['core', 'module', 'app'] },
            { from: ['entry'], allow: ['app', 'core'] },
            { from: ['test'], allow: ['core', 'module', 'app', 'entry'] },
          ],
        },
      ],
      'import-conventions/import-conventions': 'error',
    },
  },
  eslintConfigPrettier,
];
