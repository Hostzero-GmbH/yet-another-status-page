import { test, expect } from '@playwright/test'
import { 
  createServiceGroup, 
  createService,
  createIncident,
} from '../utils/payload-helpers'

/**
 * Status Page Tests
 * 
 * Tests for the main status page functionality.
 */
test.describe('Status Page', () => {
  test('displays status banner', async ({ page }) => {
    await page.goto('/')
    
    // Check for status banner - it should be visible with one of the expected status messages
    // (may not be "operational" if other tests created outage services)
    const statusBanner = page.locator('.rounded-lg.px-6.py-4')
    await expect(statusBanner).toBeVisible()
  })

  test('displays service groups and services', async ({ page }) => {
    await page.goto('/')
    
    // Seeded data includes "API Services" and "Web Applications" groups
    // Use first() since there might be multiple matches
    await expect(page.getByText('API Services').first()).toBeVisible()
    await expect(page.getByText('Web Applications').first()).toBeVisible()
    
    // Check for seeded services
    await expect(page.getByText('REST API').first()).toBeVisible()
    await expect(page.getByText('Dashboard').first()).toBeVisible()
  })

  test('displays subscribe button', async ({ page }) => {
    await page.goto('/')
    
    // Subscribe button exists
    const subscribeButton = page.getByRole('button', { name: /Subscribe/i })
    await expect(subscribeButton).toBeVisible()
  })

  test('displays past incidents section', async ({ page }) => {
    await page.goto('/')
    
    // Past incidents heading
    await expect(page.getByRole('heading', { name: 'Past Incidents' })).toBeVisible()
  })

  test('has link to incident history', async ({ page }) => {
    await page.goto('/')
    
    // Link to history page
    const historyLink = page.getByRole('link', { name: /View incident history/i })
    await expect(historyLink).toBeVisible()
  })

  test('shows status legend', async ({ page }) => {
    await page.goto('/')
    
    // Check for legend labels (grid on mobile, flex on desktop)
    await expect(page.getByText('Operational').first()).toBeVisible()
    await expect(page.getByText('Degraded Performance').first()).toBeVisible()
    await expect(page.getByText('Partial Outage').first()).toBeVisible()
    await expect(page.getByText('Major Outage').first()).toBeVisible()
    await expect(page.getByText('Maintenance').first()).toBeVisible()
  })
})

test.describe('Status Page - Different Status Levels', () => {
  // Note: These tests create services that persist between tests
  // Major outage takes precedence over partial outage
  // So we only test the higher priority status

  test('shows major outage status when service has major outage', async ({ page }) => {
    // Create a service with major outage using unique slug
    const uniqueId = Date.now()
    const group = await createServiceGroup({ 
      name: `Test Major ${uniqueId}`,
      slug: `test-major-${uniqueId}`
    })
    await createService({ 
      name: `Major Outage Service ${uniqueId}`,
      slug: `major-outage-${uniqueId}`,
      status: 'major',
      group: group.id 
    })

    await page.goto('/')
    
    // Should show major outage message
    await expect(page.getByText('Major system outage in progress')).toBeVisible()
  })
})

test.describe('Status Page - Active Incidents', () => {
  test('displays active incident with investigating status', async ({ page }) => {
    const uniqueId = Date.now()
    const group = await createServiceGroup({ 
      name: `Test Active ${uniqueId}`,
      slug: `test-active-${uniqueId}`
    })
    const service = await createService({ 
      name: `Affected Service ${uniqueId}`,
      slug: `affected-service-${uniqueId}`,
      group: group.id 
    })

    await createIncident({
      title: `Active Test Incident ${uniqueId}`,
      updates: [
        {
          status: 'investigating',
          message: 'We are investigating this issue.',
        },
      ],
      affectedServices: [service.id],
    })

    await page.goto('/')
    
    // Should show the incident in past incidents
    await expect(page.getByText(`Active Test Incident ${uniqueId}`)).toBeVisible()
  })

  test('incident links to detail page', async ({ page }) => {
    const uniqueId = Date.now()

    const incident = await createIncident({
      title: `Clickable Incident ${uniqueId}`,
      updates: [{ status: 'investigating', message: 'Testing.' }],
    })

    await page.goto('/')
    
    // Click on the incident title (use first() in case of duplicates)
    await page.getByText(`Clickable Incident ${uniqueId}`).first().click()
    
    // Should navigate to incident detail page
    await expect(page).toHaveURL(new RegExp(`/i/${incident.shortId}`))
  })
})

test.describe('Status Page - Responsive Design', () => {
  test('displays correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    
    // Status banner should still be visible (check for the container)
    const statusBanner = page.locator('.rounded-lg.px-6.py-4')
    await expect(statusBanner).toBeVisible()
    
    // Subscribe button should be visible (icon-only on mobile, uses aria-label)
    await expect(page.getByLabel('Subscribe to updates')).toBeVisible()
  })
})
