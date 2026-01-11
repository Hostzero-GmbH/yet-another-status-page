import { test, expect } from '@playwright/test'
import { createIncident } from '../utils/payload-helpers'

/**
 * History Page Tests
 * 
 * Tests for incident history navigation and week views.
 * Note: /history redirects to /history/[date] with current week's Monday.
 * We test the week pages directly to avoid redirect timing issues.
 */

function getCurrentWeekSlug(): string {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1) // Monday
  const monday = new Date(today.setDate(diff))
  return monday.toISOString().split('T')[0]
}

test.describe('History Page', () => {
  test('week page loads correctly', async ({ page }) => {
    const weekSlug = getCurrentWeekSlug()
    await page.goto(`/history/${weekSlug}`)
    
    // Should show week heading
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('has back to status link', async ({ page }) => {
    const weekSlug = getCurrentWeekSlug()
    await page.goto(`/history/${weekSlug}`)
    
    // Click back link
    const backLink = page.getByRole('link', { name: /Back to current status/i })
    await expect(backLink).toBeVisible()
    await backLink.click()
    
    // Should navigate to home
    await expect(page).toHaveURL('/')
  })

  test('shows navigation between weeks', async ({ page }) => {
    const weekSlug = getCurrentWeekSlug()
    await page.goto(`/history/${weekSlug}`)
    
    // Should have previous week navigation
    await expect(page.getByRole('link', { name: /Previous week/i })).toBeVisible()
  })
})

test.describe('History Week Page', () => {
  test('displays incidents for the week', async ({ page }) => {
    const uniqueId = Date.now()
    
    // Create an incident for today
    await createIncident({
      title: `Weekly History Test Incident ${uniqueId}`,
      updates: [{ status: 'resolved', message: 'Fixed.' }],
    })
    
    // Navigate directly to current week
    const weekSlug = getCurrentWeekSlug()
    await page.goto(`/history/${weekSlug}`)
    
    // Should show the incident
    await expect(page.getByText(`Weekly History Test Incident ${uniqueId}`)).toBeVisible()
  })

  test('shows no incidents message when week is empty', async ({ page }) => {
    // Navigate to a past date with no incidents
    const pastDate = new Date()
    pastDate.setFullYear(pastDate.getFullYear() - 2)
    const day = pastDate.getDay()
    const diff = pastDate.getDate() - day + (day === 0 ? -6 : 1)
    pastDate.setDate(diff)
    const dateSlug = pastDate.toISOString().split('T')[0]
    
    await page.goto(`/history/${dateSlug}`)
    
    // Should show no incidents message (use first() to handle multiple matches)
    await expect(page.getByText(/No incidents reported/i).first()).toBeVisible()
  })

  test('incidents link to detail pages', async ({ page }) => {
    const uniqueId = Date.now()
    
    const incident = await createIncident({
      title: `Clickable History Link ${uniqueId}`,
      updates: [{ status: 'resolved', message: 'Done.' }],
    })
    
    // Navigate directly to current week
    const weekSlug = getCurrentWeekSlug()
    await page.goto(`/history/${weekSlug}`)
    
    // Click on incident
    await page.getByText(`Clickable History Link ${uniqueId}`).first().click()
    
    // Should navigate to incident detail page
    await expect(page).toHaveURL(new RegExp(`/i/${incident.shortId}`))
  })
})
