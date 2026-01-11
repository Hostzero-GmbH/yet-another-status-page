import { test, expect } from '@playwright/test'

/**
 * Theme Toggle Tests
 * 
 * Tests for dark/light mode switching and persistence.
 */
test.describe('Theme Toggle', () => {
  test('toggles between light and dark mode', async ({ page }) => {
    await page.goto('/')
    
    const html = page.locator('html')
    
    // Find the theme toggle button by aria-label
    const themeToggle = page.getByRole('button', { name: /Switch to (light|dark) theme/i })
    await expect(themeToggle).toBeVisible()
    
    // Get initial state
    const initiallyDark = await html.evaluate(el => el.classList.contains('dark'))
    
    // Click to toggle
    await themeToggle.click()
    
    // State should have changed
    const afterToggle = await html.evaluate(el => el.classList.contains('dark'))
    expect(afterToggle).toBe(!initiallyDark)
    
    // Toggle back
    await page.getByRole('button', { name: /Switch to (light|dark) theme/i }).click()
    
    // Should be back to initial state
    const afterSecondToggle = await html.evaluate(el => el.classList.contains('dark'))
    expect(afterSecondToggle).toBe(initiallyDark)
  })

  test('persists theme preference across page loads', async ({ page }) => {
    await page.goto('/')
    
    const html = page.locator('html')
    
    // Get initial state
    const initiallyDark = await html.evaluate(el => el.classList.contains('dark'))
    
    // Toggle theme
    await page.getByRole('button', { name: /Switch to (light|dark) theme/i }).click()
    
    // Verify it changed
    const afterToggle = await html.evaluate(el => el.classList.contains('dark'))
    expect(afterToggle).toBe(!initiallyDark)
    
    // Reload page
    await page.reload()
    
    // Wait for page to load
    await page.waitForSelector('button')
    
    // Theme should persist
    const afterReload = await html.evaluate(el => el.classList.contains('dark'))
    expect(afterReload).toBe(!initiallyDark)
  })

  test('theme persists across navigation', async ({ page }) => {
    await page.goto('/')
    
    const html = page.locator('html')
    
    // Set to dark mode if not already
    const initiallyDark = await html.evaluate(el => el.classList.contains('dark'))
    if (!initiallyDark) {
      await page.getByRole('button', { name: /Switch to dark theme/i }).click()
      await expect(html).toHaveClass(/dark/)
    }
    
    // Navigate to history page
    await page.getByRole('link', { name: /View incident history/i }).click()
    
    // Should be on history page (redirects to /history/[date])
    await expect(page).toHaveURL(/\/history\//)
    
    // Theme should still be dark
    await expect(html).toHaveClass(/dark/)
    
    // Navigate back (text is "Back to current status" on history page)
    await page.getByRole('link', { name: /Back to current status/i }).click()
    
    // Theme should still be dark
    await expect(html).toHaveClass(/dark/)
  })
})

test.describe('Theme Toggle - System Preference', () => {
  test('respects system dark mode preference', async ({ page }) => {
    // Emulate dark color scheme
    await page.emulateMedia({ colorScheme: 'dark' })
    
    // Clear localStorage to use system preference
    await page.addInitScript(() => {
      localStorage.removeItem('theme')
    })
    
    await page.goto('/')
    
    // Wait for client hydration
    await page.waitForTimeout(500)
    
    // Should respect system preference (dark)
    const html = page.locator('html')
    await expect(html).toHaveClass(/dark/)
  })

  test('respects system light mode preference', async ({ page }) => {
    // Emulate light color scheme
    await page.emulateMedia({ colorScheme: 'light' })
    
    // Clear localStorage to use system preference
    await page.addInitScript(() => {
      localStorage.removeItem('theme')
    })
    
    await page.goto('/')
    
    // Wait for client hydration
    await page.waitForTimeout(500)
    
    // Should respect system preference (light)
    const html = page.locator('html')
    await expect(html).not.toHaveClass(/dark/)
  })
})
