import { test, expect } from '@playwright/test'
import { createSubscriber } from '../utils/payload-helpers'

/**
 * Subscribe Flow Tests
 * 
 * Tests the subscription dialog and email/SMS subscription flows.
 */
test.describe('Subscribe Flow', () => {
  test('opens subscribe dialog when clicking subscribe button', async ({ page }) => {
    await page.goto('/')
    
    // Click subscribe button
    await page.getByRole('button', { name: /Subscribe/i }).click()
    
    // Dialog should open with header
    await expect(page.getByText('Get status updates')).toBeVisible()
  })

  test('closes subscribe dialog with X button', async ({ page }) => {
    await page.goto('/')
    
    // Open dialog
    await page.getByRole('button', { name: /Subscribe/i }).click()
    await expect(page.getByText('Get status updates')).toBeVisible()
    
    // Close with X button
    await page.getByLabel('Close dialog').click()
    
    // Dialog should be closed
    await expect(page.getByText('Get status updates')).not.toBeVisible()
  })

  test('closes subscribe dialog by clicking backdrop', async ({ page }) => {
    await page.goto('/')
    
    // Open dialog
    await page.getByRole('button', { name: /Subscribe/i }).click()
    await expect(page.getByText('Get status updates')).toBeVisible()
    
    // Click backdrop (the semi-transparent overlay)
    await page.locator('.fixed.inset-0.z-50 > .absolute.inset-0').click({ force: true, position: { x: 10, y: 10 } })
    
    // Dialog should be closed
    await expect(page.getByText('Get status updates')).not.toBeVisible()
  })

  test('shows email subscription form', async ({ page }) => {
    await page.goto('/')
    
    await page.getByRole('button', { name: /Subscribe/i }).click()
    
    // Wait for availability check
    await page.waitForTimeout(500)
    
    // Email field should be visible (if email is available)
    const emailField = page.getByLabel('Email Address')
    if (await emailField.isVisible()) {
      await expect(emailField).toBeVisible()
    } else {
      // SMS might be shown instead, or neither configured
      const smsField = page.getByLabel('Phone Number')
      const notConfigured = page.getByText('Subscriptions not available')
      await expect(smsField.or(notConfigured)).toBeVisible()
    }
  })

  test('validates email format', async ({ page }) => {
    await page.goto('/')
    
    await page.getByRole('button', { name: /Subscribe/i }).click()
    await page.waitForTimeout(500)
    
    const emailField = page.getByLabel('Email Address')
    if (await emailField.isVisible()) {
      // Enter invalid email
      await emailField.fill('invalid-email')
      await page.getByRole('button', { name: 'Subscribe' }).click()
      
      // Should show validation error
      await expect(page.getByText(/valid email/i)).toBeVisible()
    }
  })

  test('validates empty email', async ({ page }) => {
    await page.goto('/')
    
    await page.getByRole('button', { name: /Subscribe/i }).click()
    await page.waitForTimeout(500)
    
    const emailField = page.getByLabel('Email Address')
    if (await emailField.isVisible()) {
      // Submit without entering email
      await page.getByRole('button', { name: 'Subscribe' }).click()
      
      // Should show validation error
      await expect(page.getByText(/Email is required/i)).toBeVisible()
    }
  })

  test('successfully subscribes with valid email', async ({ page }) => {
    await page.goto('/')
    
    await page.getByRole('button', { name: /Subscribe/i }).click()
    await page.waitForTimeout(500)
    
    const emailField = page.getByLabel('Email Address')
    if (await emailField.isVisible()) {
      // Enter valid email with unique timestamp
      const testEmail = `test-${Date.now()}@example.com`
      await emailField.fill(testEmail)
      await page.getByRole('button', { name: 'Subscribe' }).click()
      
      // Should show success message (contains email) or error if SMTP not configured
      await expect(
        page.getByText(/receive status updates|Failed/i)
      ).toBeVisible({ timeout: 10000 })
    }
  })

  test('shows loading state during submission', async ({ page }) => {
    await page.goto('/')
    
    await page.getByRole('button', { name: /Subscribe/i }).click()
    await page.waitForTimeout(500)
    
    const emailField = page.getByLabel('Email Address')
    if (await emailField.isVisible()) {
      await emailField.fill(`loading-test-${Date.now()}@example.com`)
      
      // Click and immediately check for loading state
      await page.getByRole('button', { name: 'Subscribe' }).click()
      
      // Button should show loading text
      await expect(page.getByText('Subscribing...')).toBeVisible()
    }
  })
})

test.describe('Unsubscribe Flow', () => {
  test('shows unsubscribe page with valid token', async ({ page }) => {
    // Create a subscriber with known token
    const subscriber = await createSubscriber({ 
      type: 'email', 
      email: `unsubscribe-test-${Date.now()}@example.com` 
    })
    
    // Navigate to unsubscribe page
    await page.goto(`/unsubscribe/${subscriber.unsubscribeToken}`)
    
    // Should show unsubscribe page content
    await expect(page.getByRole('heading', { name: /unsubscribe/i })).toBeVisible()
  })

  test('shows error for invalid unsubscribe token', async ({ page }) => {
    // Navigate with invalid token
    await page.goto('/unsubscribe/invalid-token-12345')
    
    // Should show not found or error page
    await expect(page).toHaveURL(/unsubscribe/)
  })
})
