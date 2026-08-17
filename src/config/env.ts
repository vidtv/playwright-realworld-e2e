import dotenv from 'dotenv';

dotenv.config();

export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://demo.playwright.dev/todomvc',
  isCI: !!process.env.CI,
} as const;
