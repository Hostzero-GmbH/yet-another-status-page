import { test, expect } from '@playwright/test'
import { createIncident } from '../utils/payload-helpers'
import {
  DEFAULT_TIMEZONE,
  DEFAULT_WEEK_STARTS_ON,
  addZonedDays,
  formatDateSlug,
  getWeekStart,
} from '../../src/lib/datetime'

/**
 * History Page Tests
 *
 * Tests for incident history navigation and week views.
 * Note: /history redirects to /history/[date] with previous week's start
 * (current week is shown on the main status page).
 */

function getPreviousWeekStart(): Date {
  const currentWeekStart = getWeekStart(new Date(), DEFAULT_WEEK_STARTS_ON, DEFAULT_TIMEZONE)
  return addZonedDays(currentWeekStart, -7, DEFAULT_TIMEZONE)
}

function getPreviousWeekSlug(): string {
  return formatDateSlug(getPreviousWeekStart(), DEFAULT_TIMEZONE)
}

function getPreviousWeekDate(): Date {
  const weekStart = getPreviousWeekStart()
  return addZonedDays(weekStart, 3, DEFAULT_TIMEZONE)
}

test.describe('History Page', () => {
  test('week page loads correctly', async ({ page }) => {
    const weekSlug = getPreviousWeekSlug()
    await page.goto(`/history/${weekSlug}`)
    
    // Should show week heading
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('has back to status link', async ({ page }) => {
    const weekSlug = getPreviousWeekSlug()
    await page.goto(`/history/${weekSlug}`)
    
    // Click back link
    const backLink = page.getByRole('link', { name: /Back to current status/i })
    await expect(backLink).toBeVisible()
    await backLink.click()
    
    // Should navigate to home
    await expect(page).toHaveURL('/')
  })

  test('shows navigation between weeks', async ({ page }) => {
    const weekSlug = getPreviousWeekSlug()
    await page.goto(`/history/${weekSlug}`)
    
    // Should have previous week navigation
    await expect(page.getByRole('link', { name: /Previous week/i })).toBeVisible()
  })

  test('redirects current week to previous week', async ({ page }) => {
    const currentWeekStart = getWeekStart(new Date(), DEFAULT_WEEK_STARTS_ON, DEFAULT_TIMEZONE)
    const currentWeekSlug = formatDateSlug(currentWeekStart, DEFAULT_TIMEZONE)
    
    // Navigate to current week
    await page.goto(`/history/${currentWeekSlug}`)
    
    // Should redirect to previous week
    const previousWeekSlug = getPreviousWeekSlug()
    await expect(page).toHaveURL(`/history/${previousWeekSlug}`)
  })
})

test.describe('History Week Page', () => {
  test('displays incidents for the week', async ({ page }) => {
    const uniqueId = Date.now()
    const previousWeekDate = getPreviousWeekDate()
    
    // Create an incident dated in the previous week
    await createIncident({
      title: `Weekly History Test Incident ${uniqueId}`,
      updates: [{ 
        status: 'resolved', 
        message: 'Fixed.',
        createdAt: previousWeekDate.toISOString(),
      }],
      // Set incident creation date to previous week
      createdAt: previousWeekDate.toISOString(),
    })
    
    // Navigate to previous week (where history starts)
    const weekSlug = getPreviousWeekSlug()
    await page.goto(`/history/${weekSlug}`)
    
    // Should show the incident
    await expect(page.getByText(`Weekly History Test Incident ${uniqueId}`)).toBeVisible()
  })

  test('shows no incidents message when week is empty', async ({ page }) => {
    const pastDate = new Date()
    pastDate.setUTCFullYear(pastDate.getUTCFullYear() - 2)
    const weekStart = getWeekStart(pastDate, DEFAULT_WEEK_STARTS_ON, DEFAULT_TIMEZONE)
    const dateSlug = formatDateSlug(weekStart, DEFAULT_TIMEZONE)
    
    await page.goto(`/history/${dateSlug}`)
    
    // Should show no incidents message (use first() to handle multiple matches)
    await expect(page.getByText(/No incidents reported/i).first()).toBeVisible()
  })

  test('incidents link to detail pages', async ({ page }) => {
    const uniqueId = Date.now()
    const previousWeekDate = getPreviousWeekDate()
    
    const incident = await createIncident({
      title: `Clickable History Link ${uniqueId}`,
      updates: [{ 
        status: 'resolved', 
        message: 'Done.',
        createdAt: previousWeekDate.toISOString(),
      }],
      // Set incident creation date to previous week
      createdAt: previousWeekDate.toISOString(),
    })
    
    // Navigate to previous week
    const weekSlug = getPreviousWeekSlug()
    await page.goto(`/history/${weekSlug}`)
    
    // Click on incident
    await page.getByText(`Clickable History Link ${uniqueId}`).first().click()
    
    // Should navigate to incident detail page
    await expect(page).toHaveURL(new RegExp(`/i/${incident.shortId}`))
  })
})
