import { test, expect } from '@playwright/test'
import {
  createServiceGroup,
  createService,
  createIncident,
  createMaintenance,
} from '../utils/payload-helpers'

/**
 * Public v1 API, feeds and OpenAPI document.
 */

async function seed() {
  const uid = Date.now()
  const group = await createServiceGroup({ name: `API Group ${uid}`, slug: `api-group-${uid}` })
  const service = await createService({ name: `API Service ${uid}`, slug: `api-service-${uid}`, group: group.id })

  const incident = await createIncident({
    title: `API Incident ${uid}`,
    affectedServices: [service.id],
    updates: [
      { status: 'investigating', message: 'Looking into it' },
      { status: 'identified', message: 'Cause found' },
    ],
  })

  const start = new Date(Date.now() + 2 * 86400 * 1000)
  const end = new Date(start.getTime() + 2 * 3600 * 1000)
  const maintenance = await createMaintenance({
    title: `API Maintenance ${uid}`,
    scheduledStartAt: start.toISOString(),
    scheduledEndAt: end.toISOString(),
    duration: '~2 hours',
    affectedServices: [service.id],
  })

  return { uid, group, service, incident, maintenance }
}

test.describe('GET /api/v1/status', () => {
  test('returns aggregated status with CORS and caching headers', async ({ request }) => {
    const { service, incident, maintenance } = await seed()

    const response = await request.get('/api/v1/status')
    expect(response.status()).toBe(200)
    expect(response.headers()['access-control-allow-origin']).toBe('*')
    expect(response.headers()['cache-control']).toContain('max-age=30')
    expect(response.headers()['etag']).toBeTruthy()

    const { data } = await response.json()
    expect(['operational', 'degraded', 'partial', 'major', 'maintenance']).toContain(data.status)
    expect(typeof data.siteName).toBe('string')

    const groupServices = data.serviceGroups.flatMap((g: { services: Array<{ slug: string }> }) => g.services)
    expect(groupServices.map((s: { slug: string }) => s.slug)).toContain(service.slug)

    expect(data.activeIncidents.map((i: { shortId: string }) => i.shortId)).toContain(incident.shortId)
    expect(data.activeMaintenances.map((m: { shortId: string }) => m.shortId)).toContain(maintenance.shortId)
  })

  test('answers 304 to a matching If-None-Match', async ({ request }) => {
    const first = await request.get('/api/v1/status')
    const etag = first.headers()['etag']
    const second = await request.get('/api/v1/status', { headers: { 'If-None-Match': etag } })
    expect(second.status()).toBe(304)
  })

  test('answers CORS preflight', async ({ request }) => {
    const response = await request.fetch('/api/v1/status', { method: 'OPTIONS' })
    expect(response.status()).toBe(204)
    expect(response.headers()['access-control-allow-methods']).toContain('GET')
  })
})

test.describe('GET /api/v1/incidents', () => {
  test('lists and filters incidents', async ({ request }) => {
    const { service, incident } = await seed()

    const all = await request.get('/api/v1/incidents?limit=100')
    expect(all.status()).toBe(200)
    const body = await all.json()
    expect(body.meta).toMatchObject({ page: 1, limit: 100 })
    const found = body.data.find((i: { shortId: string }) => i.shortId === incident.shortId)
    expect(found).toBeTruthy()
    expect(found.status).toBe('identified')
    expect(found.url).toContain(`/i/${incident.shortId}`)
    expect(found.updates[0].status).toBe('identified') // newest first
    expect(found.affectedServices).toEqual([{ slug: service.slug, name: service.name }])
    expect(found).not.toHaveProperty('id')

    const byService = await request.get(`/api/v1/incidents?service=${service.slug}`)
    const byServiceBody = await byService.json()
    expect(byServiceBody.data.map((i: { shortId: string }) => i.shortId)).toEqual([incident.shortId])

    const resolved = await request.get(`/api/v1/incidents?status=resolved&service=${service.slug}`)
    expect((await resolved.json()).data).toEqual([])
  })

  test('returns a single incident and problem+json for unknown ids', async ({ request }) => {
    const { incident } = await seed()

    const ok = await request.get(`/api/v1/incidents/${incident.shortId}`)
    expect(ok.status()).toBe(200)
    expect((await ok.json()).data.title).toBe(incident.title)

    const missing = await request.get('/api/v1/incidents/does-not-exist')
    expect(missing.status()).toBe(404)
    expect(missing.headers()['content-type']).toContain('application/problem+json')
    expect(await missing.json()).toMatchObject({ status: 404, title: 'Not Found' })
  })

  test('rejects invalid query parameters with 400 problem+json', async ({ request }) => {
    const response = await request.get('/api/v1/incidents?limit=1000&status=bogus')
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.status).toBe(400)
    expect(body.detail).toContain('limit')
    expect(body.detail).toContain('status')
  })
})

test.describe('GET /api/v1/maintenances', () => {
  test('lists active maintenances with schedule, description and services', async ({ request }) => {
    const { service, maintenance } = await seed()

    const response = await request.get(`/api/v1/maintenances?status=active&service=${service.slug}`)
    expect(response.status()).toBe(200)
    const { data } = await response.json()
    expect(data).toHaveLength(1)
    expect(data[0]).toMatchObject({
      shortId: maintenance.shortId,
      status: 'upcoming',
      duration: '~2 hours',
      scheduledStartAt: maintenance.scheduledStartAt,
      scheduledEndAt: maintenance.scheduledEndAt,
      descriptionHtml: null,
      descriptionText: null,
      completedAt: null,
      cancelledAt: null,
    })
    expect(data[0].affectedServices).toEqual([{ slug: service.slug, name: service.name }])

    const single = await request.get(`/api/v1/maintenances/${maintenance.shortId}`)
    expect((await single.json()).data.url).toContain(`/m/${maintenance.shortId}`)
  })

  test('date window filters', async ({ request }) => {
    const { service, maintenance } = await seed()
    const start = new Date(maintenance.scheduledStartAt)
    const before = new Date(start.getTime() - 3600 * 1000).toISOString()
    const after = new Date(start.getTime() + 24 * 3600 * 1000).toISOString()

    const inWindow = await request.get(`/api/v1/maintenances?service=${service.slug}&from=${before}&to=${after}`)
    expect((await inWindow.json()).data).toHaveLength(1)

    const outOfWindow = await request.get(`/api/v1/maintenances?service=${service.slug}&to=${before}`)
    expect((await outOfWindow.json()).data).toHaveLength(0)
  })
})

test.describe('GET /api/v1/services', () => {
  test('lists services keyed by slug with group', async ({ request }) => {
    const { group, service } = await seed()
    const response = await request.get('/api/v1/services')
    expect(response.status()).toBe(200)
    const { data } = await response.json()
    const found = data.find((s: { slug: string }) => s.slug === service.slug)
    expect(found).toMatchObject({ name: service.name, status: 'operational', group: { slug: group.slug, name: group.name } })
  })
})

test.describe('OpenAPI', () => {
  test('serves a valid-looking OpenAPI 3.1 document', async ({ request }) => {
    const response = await request.get('/api/v1/openapi.json')
    expect(response.status()).toBe(200)
    const doc = await response.json()
    expect(doc.openapi).toBe('3.1.0')
    expect(Object.keys(doc.paths)).toEqual(
      expect.arrayContaining(['/status', '/incidents', '/incidents/{shortId}', '/maintenances', '/maintenances/{shortId}', '/services']),
    )
    expect(doc.components.schemas.Maintenance.properties.scheduledStartAt.format).toBe('date-time')
    expect(JSON.stringify(doc)).not.toContain('"$schema"')
    expect(doc.security).toEqual([])
  })
})

test.describe('Feeds', () => {
  test('Atom feed contains incidents and maintenances', async ({ request }) => {
    const { incident, maintenance } = await seed()
    const response = await request.get('/feed.atom')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('application/atom+xml')
    const xml = await response.text()
    expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom">')
    expect(xml).toContain(`/i/${incident.shortId}`)
    expect(xml).toContain(`/m/${maintenance.shortId}`)
  })

  test('iCalendar feed contains upcoming maintenance as VEVENT', async ({ request }) => {
    const { maintenance } = await seed()
    const response = await request.get('/maintenances.ics')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/calendar')
    const ics = await response.text()
    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true)
    expect(ics).toContain(`UID:${maintenance.shortId}@`)
    expect(ics).toContain('STATUS:CONFIRMED')
    expect(ics).toMatch(/DTSTART:\d{8}T\d{6}Z/)
  })

  test('status page advertises the feeds', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('link[rel="alternate"][type="application/atom+xml"]')).toHaveAttribute('href', /feed\.atom/)
    await expect(page.locator('link[rel="alternate"][type="text/calendar"]')).toHaveAttribute('href', /maintenances\.ics/)
  })
})