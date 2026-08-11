import { test, expect } from '@playwright/test'
import {
  clearCollection,
  createMaintenance,
  appendMaintenanceUpdate,
  getMaintenance,
  maintenanceIsStoredAs,
  updateSettings,
} from '../utils/payload-helpers'

/**
 * Regression coverage for the maintenance status sync + retention window.
 *
 * These tests exercise the beforeChange hook (status syncs from the latest
 * update, cancelledAt/completedAt get stamped, schedules auto-transition), the
 * afterRead hook (schedules that elapse between writes), and the home page query
 * that keeps terminal-state maintenances visible for `maintenanceTerminalRetentionHours`.
 */
// Tests in this file mutate the shared Settings global (retention hours)
// and rely on a known maintenances list (the home page query has limit: 10).
// Running in parallel races the retention value, so force serial mode.
test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  // Drop any leftover maintenances so the home page's limit: 10 always shows
  // the ones this spec creates.
  await clearCollection('notifications')
  await clearCollection('maintenances')
  // Default retention so individual tests see a known starting value.
  await updateSettings({ maintenanceTerminalRetentionHours: 24 })
})

test.describe('Maintenance status sync', () => {

  test('appending an update syncs parent status and stamps cancelledAt', async () => {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    const maintenance = await createMaintenance({
      title: `Sync Cancelled ${Date.now()}`,
      status: 'upcoming',
      scheduledStartAt: tomorrow,
    })

    await appendMaintenanceUpdate(maintenance.id, {
      status: 'cancelled',
      message: 'Window no longer needed.',
    })

    const updated = await getMaintenance(maintenance.id)
    expect(updated.status).toBe('cancelled')
    expect(updated.cancelledAt).toBeTruthy()
    expect(updated.completedAt).toBeFalsy()
  })

  test('appending a completed update stamps completedAt and clears cancelledAt', async () => {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    const maintenance = await createMaintenance({
      title: `Sync Completed ${Date.now()}`,
      status: 'upcoming',
      scheduledStartAt: tomorrow,
    })

    await appendMaintenanceUpdate(maintenance.id, {
      status: 'cancelled',
      message: 'Cancelled first.',
    })
    const afterCancel = await getMaintenance(maintenance.id)
    expect(afterCancel.cancelledAt).toBeTruthy()

    await appendMaintenanceUpdate(maintenance.id, {
      status: 'completed',
      message: 'Actually finished it.',
    })
    const afterComplete = await getMaintenance(maintenance.id)
    expect(afterComplete.status).toBe('completed')
    expect(afterComplete.completedAt).toBeTruthy()
    expect(afterComplete.cancelledAt).toBeFalsy()
  })
})

test.describe('Maintenance home page rendering', () => {
  test('renders the Cancelled badge and the update message inline', async ({ page }) => {
    const uniqueId = Date.now()
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    const cancelMessage = `Window aborted ${uniqueId}`

    const maintenance = await createMaintenance({
      title: `Cancelled Visible ${uniqueId}`,
      status: 'upcoming',
      scheduledStartAt: tomorrow,
    })
    await appendMaintenanceUpdate(maintenance.id, {
      status: 'cancelled',
      message: cancelMessage,
    })

    await page.goto('/')

    const card = page
      .locator('div')
      .filter({ has: page.getByRole('link', { name: `Cancelled Visible ${uniqueId}` }) })
      .first()

    await expect(card).toBeVisible()
    // Both mobile and desktop badge variants render the label; one is sm:hidden.
    // Asserting on the card text covers both without wrestling with viewport visibility.
    await expect(card).toContainText('Cancelled')
    await expect(card).toContainText(cancelMessage)
  })

  test('renders the In Progress badge and the latest update message', async ({ page }) => {
    const uniqueId = Date.now() + 1
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    const startMessage = `Starting work ${uniqueId}`

    const maintenance = await createMaintenance({
      title: `In Progress Visible ${uniqueId}`,
      status: 'upcoming',
      scheduledStartAt: tomorrow,
    })
    await appendMaintenanceUpdate(maintenance.id, {
      status: 'in_progress',
      message: startMessage,
    })

    await page.goto('/')

    const card = page
      .locator('div')
      .filter({ has: page.getByRole('link', { name: `In Progress Visible ${uniqueId}` }) })
      .first()

    await expect(card).toBeVisible()
    await expect(card).toContainText('In Progress')
    await expect(card).toContainText(startMessage)
  })
})

test.describe('Maintenance retention window', () => {
  test('cancelled maintenance disappears from home once retention is zero', async ({ page }) => {
    const uniqueId = Date.now() + 2
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString()

    await updateSettings({ maintenanceTerminalRetentionHours: 24 })

    const maintenance = await createMaintenance({
      title: `Retention Window ${uniqueId}`,
      status: 'upcoming',
      scheduledStartAt: tomorrow,
    })
    await appendMaintenanceUpdate(maintenance.id, {
      status: 'cancelled',
      message: `Calling it off ${uniqueId}`,
    })

    await page.goto('/')
    await expect(
      page.getByRole('link', { name: `Retention Window ${uniqueId}` }),
    ).toBeVisible()

    // Drop retention to zero → cancelledAt is now <= cutoff, card is filtered out.
    await updateSettings({ maintenanceTerminalRetentionHours: 0 })

    await page.goto('/')
    await expect(
      page.getByRole('link', { name: `Retention Window ${uniqueId}` }),
    ).toHaveCount(0)

    // Restore default for following tests / runs.
    await updateSettings({ maintenanceTerminalRetentionHours: 24 })
  })
})

// Runs last so the maintenances it creates don't crowd out the home page cards
// asserted above (that query has limit: 10).
test.describe('Maintenance schedule auto-transition', () => {
  test('a start time already in the past is stored as in_progress on create', async () => {
    const maintenance = await createMaintenance({
      title: `Past Start ${Date.now()}`,
      status: 'upcoming',
      scheduledStartAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      scheduledEndAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    })

    expect(maintenance.status).toBe('in_progress')
    expect(await maintenanceIsStoredAs(maintenance.id, 'in_progress')).toBe(true)
  })

  test('an end time already in the past is stored as completed and stamps completedAt', async () => {
    const maintenance = await createMaintenance({
      title: `Past End ${Date.now()}`,
      status: 'upcoming',
      scheduledStartAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      scheduledEndAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    })

    expect(maintenance.status).toBe('completed')
    expect(maintenance.completedAt).toBeTruthy()
    expect(await maintenanceIsStoredAs(maintenance.id, 'completed')).toBe(true)
  })

  test('the auto-schedule checkboxes suppress the transition', async () => {
    const maintenance = await createMaintenance({
      title: `No Auto Schedule ${Date.now()}`,
      status: 'upcoming',
      scheduledStartAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      scheduledEndAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      autoStartOnSchedule: false,
      autoCompleteOnSchedule: false,
    })

    expect(maintenance.status).toBe('upcoming')
    expect(await maintenanceIsStoredAs(maintenance.id, 'upcoming')).toBe(true)
  })

  test('a start time that elapses after creation transitions on read and is persisted', async () => {
    test.setTimeout(60_000)

    const maintenance = await createMaintenance({
      title: `Elapsing Start ${Date.now()}`,
      status: 'upcoming',
      scheduledStartAt: new Date(Date.now() + 5000).toISOString(),
    })
    expect(maintenance.status).toBe('upcoming')

    // afterRead reports the transition to the caller immediately, but schedules the
    // write out of band — so read first, then check what actually landed in the column.
    await expect
      .poll(
        async () => {
          const read = await getMaintenance(maintenance.id)
          return read.status === 'in_progress' && (await maintenanceIsStoredAs(maintenance.id, 'in_progress'))
        },
        { timeout: 30_000 },
      )
      .toBe(true)
  })
})
