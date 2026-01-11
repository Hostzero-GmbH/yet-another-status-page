import { test, expect } from '@playwright/test'
import { 
  createServiceGroup,
  createService,
  createIncident,
} from '../utils/payload-helpers'

/**
 * Incident Detail Page Tests
 * 
 * Tests for incident detail pages, timelines, and navigation.
 */
test.describe('Incident Detail Page', () => {
  test('displays incident details correctly', async ({ page }) => {
    const uniqueId = Date.now()
    const group = await createServiceGroup({ 
      name: `Test Group ${uniqueId}`,
      slug: `test-group-${uniqueId}`
    })
    const service = await createService({ 
      name: `Test API ${uniqueId}`,
      slug: `test-api-${uniqueId}`,
      group: group.id 
    })
    
    const incident = await createIncident({
      title: `Test API Gateway Outage ${uniqueId}`,
      updates: [
        {
          status: 'investigating',
          message: 'We are investigating reports of API failures.',
        },
      ],
      affectedServices: [service.id],
    })
    
    await page.goto(`/i/${incident.shortId}`)
    
    // Check incident title
    await expect(page.getByRole('heading', { name: `Test API Gateway Outage ${uniqueId}` })).toBeVisible()
    
    // Check update message
    await expect(page.getByText('We are investigating reports of API failures.')).toBeVisible()
  })

  test('shows ongoing badge for unresolved incidents', async ({ page }) => {
    const incident = await createIncident({
      title: `Ongoing Test Incident ${Date.now()}`,
      updates: [
        {
          status: 'investigating',
          message: 'Investigating the issue.',
        },
      ],
    })
    
    await page.goto(`/i/${incident.shortId}`)
    
    // Should show ongoing status badge (case insensitive)
    await expect(page.getByText(/ongoing/i).first()).toBeVisible()
  })

  test('shows resolved badge for resolved incidents', async ({ page }) => {
    const incident = await createIncident({
      title: `Resolved Test Incident ${Date.now()}`,
      updates: [
        {
          status: 'investigating',
          message: 'Investigating.',
        },
        {
          status: 'resolved',
          message: 'Issue resolved.',
        },
      ],
    })
    
    await page.goto(`/i/${incident.shortId}`)
    
    // Should show resolved status badge (case insensitive)
    await expect(page.getByText(/resolved/i).first()).toBeVisible()
  })

  test('displays timeline with all updates', async ({ page }) => {
    const incident = await createIncident({
      title: 'Multi-Update Test Incident',
      updates: [
        { status: 'investigating', message: 'Starting investigation.' },
        { status: 'identified', message: 'Root cause identified.' },
        { status: 'monitoring', message: 'Fix deployed, monitoring.' },
        { status: 'resolved', message: 'All systems normal.' },
      ],
    })
    
    await page.goto(`/i/${incident.shortId}`)
    
    // All updates should be visible
    await expect(page.getByText('Starting investigation.')).toBeVisible()
    await expect(page.getByText('Root cause identified.')).toBeVisible()
    await expect(page.getByText('Fix deployed, monitoring.')).toBeVisible()
    await expect(page.getByText('All systems normal.')).toBeVisible()
  })

  test('has back to status link', async ({ page }) => {
    const incident = await createIncident({
      title: 'Navigation Test Incident',
      updates: [{ status: 'investigating', message: 'Test.' }],
    })
    
    await page.goto(`/i/${incident.shortId}`)
    
    // Click back link
    await page.getByRole('link', { name: /Back to status/i }).click()
    
    // Should navigate to home
    await expect(page).toHaveURL('/')
  })

  test('shows 404 for non-existent incident', async ({ page }) => {
    await page.goto('/i/nonexistent123')
    
    // Next.js shows 404 page
    await expect(page.getByText(/not found/i)).toBeVisible()
  })

  test('has correct page title', async ({ page }) => {
    const incident = await createIncident({
      title: 'SEO Title Test Incident',
      updates: [{ status: 'investigating', message: 'Test.' }],
    })
    
    await page.goto(`/i/${incident.shortId}`)
    
    // Page title should contain incident title
    await expect(page).toHaveTitle(/SEO Title Test Incident/i)
  })
})
