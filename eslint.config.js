import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      playwright,
    },
    rules: {
      // Required await before test.step() and Promise
      '@typescript-eslint/await-thenable': 'error',
      
      // Ban on using String instead of string
      '@typescript-eslint/no-wrapper-object-types': 'error',

      // Required await before assertions and Playwright actions
      'playwright/missing-playwright-await': 'error',
    },
  }
);