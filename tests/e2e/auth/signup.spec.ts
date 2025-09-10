import { test, expect } from '@playwright/test'

test.describe('Signup Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup')
  })

  test('should display signup form', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Sign Up')
    await expect(page.locator('select[name="userType"]')).toBeVisible()
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })

  test('should allow role selection', async ({ page }) => {
    await page.locator('select[name="userType"]').selectOption('doctor')
    await expect(page.locator('select[name="userType"]')).toHaveValue('doctor')
  })
})