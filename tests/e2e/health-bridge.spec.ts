import { test, expect } from '@playwright/test';

test.describe.skip('Health Bridge App - Critical User Flows', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('/');
  });

  test('should display landing page correctly', async ({ page }) => {
    // Test basic page load and key elements
    await expect(page).toHaveTitle(/Health Bridge/);
    
    // Check for key navigation elements
    const loginButton = page.getByRole('button', { name: /login/i });
    await expect(loginButton).toBeVisible();
  });

  test('patient login flow', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Login');
    
    // Fill login form
    await page.fill('[data-testid=email]', 'patient@test.com');
    await page.fill('[data-testid=password]', 'password123');
    
    // Submit form
    await page.click('[data-testid=login-button]');
    
    // Should redirect to patient dashboard
    await expect(page).toHaveURL(/.*dashboard.*patient/);
    await expect(page.getByText('Patient Dashboard')).toBeVisible();
  });

  test('doctor login flow', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Login');
    
    // Fill login form with doctor credentials
    await page.fill('[data-testid=email]', 'doctor@test.com');
    await page.fill('[data-testid=password]', 'doctor123');
    
    // Submit form
    await page.click('[data-testid=login-button]');
    
    // Should redirect to doctor portal
    await expect(page).toHaveURL(/.*dashboard.*doctor/);
    await expect(page.getByText('Doctor Portal')).toBeVisible();
  });

  test('appointment booking flow', async ({ page }) => {
    // Login as patient first
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'patient@test.com');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=login-button]');
    
    // Navigate to appointments
    await page.click('[data-testid=appointments-nav]');
    
    // Book new appointment
    await page.click('[data-testid=book-appointment]');
    
    // Fill appointment form
    await page.selectOption('[data-testid=doctor-select]', 'Dr. Smith');
    await page.fill('[data-testid=appointment-date]', '2024-01-15');
    await page.fill('[data-testid=appointment-time]', '10:00');
    await page.fill('[data-testid=appointment-notes]', 'Regular checkup');
    
    // Submit appointment
    await page.click('[data-testid=confirm-booking]');
    
    // Verify appointment created
    await expect(page.getByText('Appointment booked successfully')).toBeVisible();
  });

  test('responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check mobile navigation
    const mobileMenu = page.getByRole('button', { name: /menu/i });
    await expect(mobileMenu).toBeVisible();
    
    // Test mobile menu functionality
    await mobileMenu.click();
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('accessibility - keyboard navigation', async ({ page }) => {
    // Test tab navigation through key elements
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /login/i })).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /register/i })).toBeFocused();
  });

  test('health records access (authenticated)', async ({ page }) => {
    // Login as patient
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'patient@test.com');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=login-button]');
    
    // Navigate to health records
    await page.click('[data-testid=health-records-nav]');
    
    // Verify health records page loads
    await expect(page.getByText('Health Records')).toBeVisible();
    await expect(page.getByTestId('health-records-list')).toBeVisible();
  });
});

test.describe.skip('Health Bridge App - Error Handling', () => {
  
  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Try invalid credentials
    await page.fill('[data-testid=email]', 'invalid@test.com');
    await page.fill('[data-testid=password]', 'wrongpassword');
    await page.click('[data-testid=login-button]');
    
    // Should show error message
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/**', route => route.abort());
    
    await page.goto('/dashboard/patient');
    
    // Should show error state
    await expect(page.getByText('Unable to load data')).toBeVisible();
  });
});