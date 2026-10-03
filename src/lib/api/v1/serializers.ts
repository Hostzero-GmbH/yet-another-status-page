import type { Incident, Maintenance, Service, ServiceGroup } from '@/payload-types'
import { lexicalToHtml, lexicalToText } from '@/lib/lexical'
import { getServerUrl } from '@/lib/utils'
import { computeOverallStatus } from '@/lib/status-data'
import type { PublicIncident, PublicMaintenance, PublicService, PublicServiceGroup } from './schemas'

type Populated<T> = Exclude<T, number>

function serviceRefs(services: Incident['affectedServices']): Array<{ slug: string; name: string }> {
  // Relationship fields must be fetched with depth >= 1; unpopulated ids carry no slug.
  return (services ?? [])
    .filter((s): s is Populated<typeof s> => typeof s === 'object' && s !== null)
    .map((s) => ({ slug: s.slug, name: s.name }))
}

function newestFirst<T extends { createdAt: string }>(updates: T[] | null | undefined): T[] {
  return [...(updates ?? [])].reverse()
}

export function serializeIncident(doc: Incident): PublicIncident {
  const shortId = doc.shortId ?? ''
  return {
    shortId,
    title: doc.title,
    status: doc.status,
    url: `${getServerUrl()}/i/${shortId}`,
    affectedServices: serviceRefs(doc.affectedServices),
    updates: newestFirst(doc.updates).map((u) => ({
      status: u.status,
      message: u.message,
      createdAt: u.createdAt,
    })),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    resolvedAt: doc.resolvedAt ?? null,
  }
}

export function serializeMaintenance(doc: Maintenance): PublicMaintenance {
  const shortId = doc.shortId ?? ''
  return {
    shortId,
    title: doc.title,
    status: doc.status,
    url: `${getServerUrl()}/m/${shortId}`,
    descriptionHtml: lexicalToHtml(doc.description),
    descriptionText: lexicalToText(doc.description),
    scheduledStartAt: doc.scheduledStartAt,
    scheduledEndAt: doc.scheduledEndAt ?? null,
    duration: doc.duration ?? null,
    affectedServices: serviceRefs(doc.affectedServices),
    updates: newestFirst(doc.updates).map((u) => ({
      status: u.status,
      message: u.message,
      createdAt: u.createdAt,
    })),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    completedAt: doc.completedAt ?? null,
    cancelledAt: doc.cancelledAt ?? null,
  }
}

function serviceBase(doc: Service): Omit<PublicService, 'group'> {
  return {
    slug: doc.slug,
    name: doc.name,
    description: doc.description ?? null,
    status: doc.status,
    updatedAt: doc.updatedAt,
  }
}

export function serializeService(doc: Service): PublicService {
  const group = typeof doc.group === 'object' && doc.group !== null ? doc.group : null
  return {
    ...serviceBase(doc),
    group: { slug: group?.slug ?? '', name: group?.name ?? '' },
  }
}

export function serializeServiceGroups(groups: ServiceGroup[], services: Service[]): PublicServiceGroup[] {
  return groups
    .map((group) => {
      const members = services.filter((s) => {
        const sg = s.group
        return typeof sg === 'object' && sg !== null ? sg.id === group.id : sg === group.id
      })
      return {
        slug: group.slug,
        name: group.name,
        description: group.description ?? null,
        status: computeOverallStatus(members, {}),
        services: members.map(serviceBase),
      }
    })
    .filter((group) => group.services.length > 0)
}
