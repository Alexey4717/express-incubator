/** @type {import('prettier').Config} */
const config = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 80,
  endOfLine: 'auto',
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrderParserPlugins: ['typescript', 'decorators-legacy', 'jsx'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,
  importOrder: [
    '^express$',
    '<THIRD_PARTY_MODULES>',
    '^(@/)?core/(.*)$',
    '^(@/)?modules/(.*)$',
    '^(@/)?app/(.*)$',
    '^[./]',
  ],
};

module.exports = config;
