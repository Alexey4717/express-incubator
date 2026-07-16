import tsESLint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import {FlatCompat} from '@eslint/eslintrc'; // Для поддержки legacy-конфигов (если нужно)

const compat = new FlatCompat();

export default [
    // Базовый ESLint (JS/TS)
    {
        files: ['**/*.{js,ts,tsx}'],
        ignores: ['**/dist/**', '**/.next/**', '**/node_modules/**'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: './tsconfig.json',
            },
        },
        plugins: {
            '@typescript-eslint': tsESLint,
        },
        rules: {
            ...tsESLint.configs['recommended'].rules,
            '@typescript-eslint/no-unused-vars': 'warn',
        },
    },

    {
        files: ['**/*.ts'],
        rules: {
            '@typescript-eslint/no-var-requires': 'off', // Разрешить require()
        },
    },

    // Prettier
    eslintConfigPrettier,
];
