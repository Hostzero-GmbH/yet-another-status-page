import { test, expect } from '@playwright/test'
import { 
  createServiceGroup,
  createService,
  createMaintenance,
} from '../utils/payload-helpers'

/**
 * Maintenance Detail Page Tests
 * 
 * Tests for maintenance detail pages and status displays.
 */
test.describe('Maintenance Detail Page', () => {
  test('displays maintenance details correctly', async ({ page }) => {
    const uniqueId = Date.now()
    const group = await createServiceGroup({ 
      name: `Infra ${uniqueId}`,
      slug: `infra-${uniqueId}`
    })
    const service = await createService({ 
      name: `Test DB ${uniqueId}`,
      slug: `test-db-${uniqueId}`,
      group: group.id 
    })
    
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(2, 0, 0, 0)
    
    const maintenance = await createMaintenance({
      title: `Test Database Upgrade ${uniqueId}`,
      status: 'upcoming',
      scheduledStartAt: tomorrow.toISOString(),
      duration: '~2 hours',
      affectedServices: [service.id],
    })
    
    await page.goto(`/m/${maintenance.shortId}`)
    
    // Check maintenance title
    await expect(page.getByRole('heading', { name: `Test Database Upgrade ${uniqueId}` })).toBeVisible()
    
    // Check duration
    await expect(page.getByText('~2 hours').first()).toBeVisible()
  })

  test('shows upcoming status badge', async ({ page }) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const maintenance = await createMaintenance({
      title: `Upcoming Test Maintenance ${Date.now()}`,
      status: 'upcoming',
      scheduledStartAt: tomorrow.toISOString(),
    })
    
    await page.goto(`/m/${maintenance.shortId}`)
    
    // Should show upcoming/scheduled status (first match)
    await expect(page.getByText(/upcoming|scheduled/i).first()).toBeVisible()
  })

  test('shows in progress status badge', async ({ page }) => {
    const now = new Date()
    
    const maintenance = await createMaintenance({
      title: 'Active Test Maintenance',
      status: 'in_progress',
      scheduledStartAt: now.toISOString(),
    })
    
    await page.goto(`/m/${maintenance.shortId}`)
    
    // Should show in progress status
    await expect(page.getByText(/in progress/i)).toBeVisible()
  })

  test('shows completed status badge', async ({ page }) => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const maintenance = await createMaintenance({
      title: `Completed Test Maintenance ${Date.now()}`,
      status: 'completed',
      scheduledStartAt: yesterday.toISOString(),
    })
    
    await page.goto(`/m/${maintenance.shortId}`)
    
    // Should show completed status (first match)
    await expect(page.getByText(/completed/i).first()).toBeVisible()
  })

  test('has back to status link', async ({ page }) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const maintenance = await createMaintenance({
      title: 'Navigation Test Maintenance',
      status: 'upcoming',
      scheduledStartAt: tomorrow.toISOString(),
    })
    
    await page.goto(`/m/${maintenance.shortId}`)
    
    // Click back link
    await page.getByRole('link', { name: /Back to status/i }).click()
    
    // Should navigate to home
    await expect(page).toHaveURL('/')
  })

  test('shows 404 for non-existent maintenance', async ({ page }) => {
    await page.goto('/m/nonexistent456')
    
    // Should show not found page
    await expect(page.getByText(/not found/i)).toBeVisible()
  })

  test('has correct page title', async ({ page }) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const maintenance = await createMaintenance({
      title: 'SEO Maintenance Test',
      status: 'upcoming',
      scheduledStartAt: tomorrow.toISOString(),
    })
    
    await page.goto(`/m/${maintenance.shortId}`)
    
    // Page title should contain maintenance title
    await expect(page).toHaveTitle(/SEO Maintenance Test/i)
  })
})
