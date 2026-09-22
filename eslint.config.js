import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['node_modules/', 'playwright-report/', 'test-results/', 'dist/'],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off',
    },
  }
);