import { test, expect } from '@playwright/test'

test.describe('Role Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup')
  })

  test('should display role dropdown', async ({ page }) => {
    await expect(page.locator('select[name="userType"]')).toBeVisible()
    await expect(page.locator('select[name="userType"]')).toHaveValue('patient')
  })

  test('should change role selection', async ({ page }) => {
    await page.locator('select[name="userType"]').selectOption('staff')
    await expect(page.locator('select[name="userType"]')).toHaveValue('staff')
  })
})