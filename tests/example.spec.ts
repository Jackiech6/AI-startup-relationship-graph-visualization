import { test, expect } from '@playwright/test'

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/')

  // Check that the page loads
  await expect(page).toHaveTitle(/AI Startup Ecosystem Graph/i)

  // Check for main heading
  const heading = page.getByRole('heading', { name: /AI Startup Ecosystem Graph/i })
  await expect(heading).toBeVisible()

  // Check for phase 1 completion message
  const message = page.getByText(/Phase 1 Setup Complete/i)
  await expect(message).toBeVisible()
})

test('page has proper structure', async ({ page }) => {
  await page.goto('/')

  // Check that main element exists
  const main = page.locator('main')
  await expect(main).toBeVisible()
})

