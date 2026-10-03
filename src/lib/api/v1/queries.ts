import type { Where } from 'payload'
import { getCachedPayload } from '@/lib/payload'
import type { IncidentListQuery, MaintenanceListQuery } from './schemas'

export const ACTIVE_INCIDENT_WHERE: Where = { status: { not_equals: 'resolved' } }
export const ACTIVE_MAINTENANCE_WHERE: Where = { status: { in: ['upcoming', 'in_progress'] } }

function incidentWhere(query: Omit<IncidentListQuery, 'page' | 'limit'>): Where {
  const and: Where[] = []
  if (query.status === 'active') and.push(ACTIVE_INCIDENT_WHERE)
  else if (query.status) and.push({ status: { equals: query.status } })
  if (query.service) and.push({ 'affectedServices.slug': { equals: query.service } })
  if (query.from) and.push({ createdAt: { greater_than_equal: query.from } })
  if (query.to) and.push({ createdAt: { less_than_equal: query.to } })
  return { and }
}

function maintenanceWhere(query: Omit<MaintenanceListQuery, 'page' | 'limit'>): Where {
  const and: Where[] = []
  if (query.status === 'active') and.push(ACTIVE_MAINTENANCE_WHERE)
  else if (query.status) and.push({ status: { equals: query.status } })
  if (query.service) and.push({ 'affectedServices.slug': { equals: query.service } })
  if (query.from) {
    and.push({
      or: [
        { scheduledEndAt: { greater_than_equal: query.from } },
        { scheduledStartAt: { greater_than_equal: query.from } },
      ],
    })
  }
  if (query.to) and.push({ scheduledStartAt: { less_than_equal: query.to } })
  return { and }
}

export async function findIncidents(query: IncidentListQuery) {
  const payload = await getCachedPayload()
  return payload.find({
    collection: 'incidents',
    where: incidentWhere(query),
    sort: '-createdAt',
    depth: 1,
    page: query.page,
    limit: query.limit,
  })
}

export async function findIncident(shortId: string) {
  const payload = await getCachedPayload()
  const result = await payload.find({
    collection: 'incidents',
    where: { shortId: { equals: shortId } },
    depth: 1,
    limit: 1,
  })
  return result.docs[0] ?? null
}

export async function findMaintenances(query: MaintenanceListQuery) {
  const payload = await getCachedPayload()
  return payload.find({
    collection: 'maintenances',
    where: maintenanceWhere(query),
    // Active ones ascending by start makes the "what's next" read natural; everything else newest first.
    sort: query.status === 'active' || query.status === 'upcoming' ? 'scheduledStartAt' : '-scheduledStartAt',
    depth: 1,
    page: query.page,
    limit: query.limit,
  })
}

export async function findMaintenance(shortId: string) {
  const payload = await getCachedPayload()
  const result = await payload.find({
    collection: 'maintenances',
    where: { shortId: { equals: shortId } },
    depth: 1,
    limit: 1,
  })
  return result.docs[0] ?? null
}

export async function findServicesAndGroups() {
  const payload = await getCachedPayload()
  const [groups, services] = await Promise.all([
    payload.find({ collection: 'service-groups', sort: '_order', pagination: false }),
    payload.find({ collection: 'services', sort: '_order', depth: 1, pagination: false }),
  ])
  return { groups: groups.docs, services: services.docs }
}
