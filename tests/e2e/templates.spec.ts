import { test, expect } from '@playwright/test'
import {
  createServiceGroup,
  createService,
  createIncidentTemplate,
  createMaintenanceTemplate,
  listIncidentTemplates,
  listMaintenanceTemplates,
} from '../utils/payload-helpers'

/**
 * Incident & Maintenance Template Tests
 *
 * Tests for the template collections introduced for the "create Incident /
 * Maintenance from a template" feature. Templates are admin-only stores of
 * reusable field values, so these tests exercise the REST API surface that the
 * admin "Apply template" component reads from.
 */
test.describe('Incident Templates', () => {
  test('creates an incident template', async () => {
    const uniqueId = Date.now()
    const template = await createIncidentTemplate({
      name: `API Outage Template ${uniqueId}`,
      title: `API Gateway Outage ${uniqueId}`,
      updates: [
        {
          status: 'investigating',
          message: 'We are investigating reports of API failures.',
        },
      ],
    })

    expect(template.id).toBeTruthy()
    expect(template.name).toBe(`API Outage Template ${uniqueId}`)
    expect(template.title).toBe(`API Gateway Outage ${uniqueId}`)
    expect(template.updates).toHaveLength(1)
    expect(template.updates![0].status).toBe('investigating')
    expect(template.updates![0].message).toBe(
      'We are investigating reports of API failures.',
    )
  })

  test('stores affected services on an incident template', async () => {
    const uniqueId = Date.now()
    const group = await createServiceGroup({
      name: `Template Group ${uniqueId}`,
      slug: `template-group-${uniqueId}`,
    })
    const service = await createService({
      name: `Template API ${uniqueId}`,
      slug: `template-api-${uniqueId}`,
      group: group.id,
    })

    const template = await createIncidentTemplate({
      name: `Affected Services Template ${uniqueId}`,
      title: `Incident ${uniqueId}`,
      affectedServices: [service.id],
    })

    expect(template.affectedServices).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: service.id })]),
    )
  })

  test('lists incident templates', async () => {
    const uniqueId = Date.now()
    await createIncidentTemplate({
      name: `Listable Template ${uniqueId}`,
      title: `Listable Incident ${uniqueId}`,
    })

    const templates = await listIncidentTemplates()
    const match = templates.find((t) => t.name === `Listable Template ${uniqueId}`)

    expect(match).toBeTruthy()
    expect(match!.title).toBe(`Listable Incident ${uniqueId}`)
  })

  test('requires a name and title', async () => {
    const response = await fetch(
      `${process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'}/api/incident-templates`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      },
    )

    expect(response.status).toBe(400)
  })
})

test.describe('Maintenance Templates', () => {
  test('creates a maintenance template', async () => {
    const uniqueId = Date.now()
    const template = await createMaintenanceTemplate({
      name: `DB Upgrade Template ${uniqueId}`,
      title: `Database Upgrade ${uniqueId}`,
      duration: '~2 hours',
      status: 'upcoming',
    })

    expect(template.id).toBeTruthy()
    expect(template.name).toBe(`DB Upgrade Template ${uniqueId}`)
    expect(template.title).toBe(`Database Upgrade ${uniqueId}`)
    expect(template.duration).toBe('~2 hours')
    expect(template.status).toBe('upcoming')
  })

  test('stores schedule options on a maintenance template', async () => {
    const uniqueId = Date.now()
    const template = await createMaintenanceTemplate({
      name: `Schedule Template ${uniqueId}`,
      title: `Scheduled Maintenance ${uniqueId}`,
      autoStartOnSchedule: true,
      autoCompleteOnSchedule: false,
    })

    expect(template.autoStartOnSchedule).toBe(true)
    expect(template.autoCompleteOnSchedule).toBe(false)
  })

  test('stores affected services on a maintenance template', async () => {
    const uniqueId = Date.now()
    const group = await createServiceGroup({
      name: `Maint Template Group ${uniqueId}`,
      slug: `maint-template-group-${uniqueId}`,
    })
    const service = await createService({
      name: `Maint Template DB ${uniqueId}`,
      slug: `maint-template-db-${uniqueId}`,
      group: group.id,
    })

    const template = await createMaintenanceTemplate({
      name: `Affected Maint Template ${uniqueId}`,
      title: `Maintenance ${uniqueId}`,
      affectedServices: [service.id],
    })

    expect(template.affectedServices).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: service.id })]),
    )
  })

  test('lists maintenance templates', async () => {
    const uniqueId = Date.now()
    await createMaintenanceTemplate({
      name: `Listable Maint Template ${uniqueId}`,
      title: `Listable Maintenance ${uniqueId}`,
    })

    const templates = await listMaintenanceTemplates()
    const match = templates.find((t) => t.name === `Listable Maint Template ${uniqueId}`)

    expect(match).toBeTruthy()
    expect(match!.title).toBe(`Listable Maintenance ${uniqueId}`)
  })

  test('requires a name and title', async () => {
    const response = await fetch(
      `${process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'}/api/maintenance-templates`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      },
    )

    expect(response.status).toBe(400)
  })
})