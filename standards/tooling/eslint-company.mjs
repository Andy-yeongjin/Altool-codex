// Adopted rules: engineering.md APP-01/02/07. Peers belong to the consuming app.
export function companyNamingConfig(tseslint, unicorn) {
  return {
    name: 'altool/company-naming',
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { '@typescript-eslint': tseslint.plugin, unicorn },
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'] },
        { selector: 'variable', format: ['camelCase', 'PascalCase'] },
        { selector: 'variable', modifiers: ['const', 'global'], format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'import', format: ['camelCase', 'PascalCase'] },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'interface', format: ['PascalCase'], custom: { regex: '^I[A-Z]', match: false } },
        { selector: 'enumMember', format: ['UPPER_CASE'] },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
        // Only syntactically quoted keys are inherently external/HTML-compatible.
        { selector: 'property', modifiers: ['requiresQuotes'], format: null },
      ],
      'unicorn/filename-case': ['error', { case: 'kebabCase', checkDirectories: false }],
    },
  };
}
