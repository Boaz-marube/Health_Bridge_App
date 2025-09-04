import { test, expect } from '@playwright/test';

// E2E tests for Health Bridge App
// Currently disabled until features are implemented

test.describe.skip('Health Bridge App - Basic Tests', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Health Bridge/);
  });

  // Add more tests here as features are developed
  // Remove .skip when ready to test actual features
});