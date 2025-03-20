module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    'react/display-name': 'off',
    '@typescript-eslint/no-unused-expressions': 'error',
    '@next/next/no-img-element': 'warn',
    'jsx-a11y/alt-text': 'warn'
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['*/public', '*/node_modules/*', '*/.next/*', '*/dist/*']
};
