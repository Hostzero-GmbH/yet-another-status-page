import type { Metadata } from 'next'
import Link from 'next/link'
import { getIncidentStatus } from '@/collections/Incidents'
import { getCachedPayload, getSettings } from '@/lib/payload'
import { getMediaUrl } from '@/lib/utils'
import { Header } from '@/components/status/Header'
import { Footer } from '@/components/status/Footer'
import { Subscribe } from '@/components/status/SubscribeDialog'
import { StatusBanner } from '@/components/status/StatusBanner'
import { ServiceGroup } from '@/components/status/ServiceGroup'
import { MaintenanceCard } from '@/components/status/MaintenanceCard'
import { IncidentTimelineWithLinks } from '@/components/status/IncidentTimeline'
import { StatusLegend } from '@/components/status/StatusLegend'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type ServiceStatus = 'operational' | 'degraded' | 'partial' | 'major' | 'maintenance'

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatDateSlug(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatDateTime(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' at ' + date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  
  const title = settings.metaTitle || `${settings.siteName} Status`
  const description = settings.metaDescription || `Real-time status and incident updates for ${settings.siteName} services`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

async function getStatusData() {
  const payload = await getCachedPayload()
  const settings = await getSettings()

  const serviceGroups = await payload.find({
    collection: 'service-groups',
    depth: 2,
    sort: '_order',
    limit: 100,
  })

  const services = await payload.find({
    collection: 'services',
    depth: 1,
    sort: '_order',
    limit: 100,
  })

  const maintenances = await payload.find({
    collection: 'maintenances',
    where: {
      status: { not_equals: 'completed' },
    },
    sort: 'scheduledStart',
    limit: 10,
  })

  const incidents = await payload.find({
    collection: 'incidents',
    sort: '-createdAt',
    limit: 50,
  })

  // Group services by service group
  const groupedServices = serviceGroups.docs.map((group) => {
    const groupServices = services.docs.filter((service) => {
      const serviceGroup = service.group
      if (typeof serviceGroup === 'object' && serviceGroup !== null) {
        return serviceGroup.id === group.id
      }
      return serviceGroup === group.id
    })

    return {
      name: group.name,
      services: groupServices.map((service) => ({
        name: service.name,
        status: (service.status || 'operational') as ServiceStatus,
        description: service.description || undefined,
      })),
    }
  }).filter((group) => group.services.length > 0)

  // Format maintenances
  const formattedMaintenances = maintenances.docs.map((m) => {
    const scheduledStart = new Date(m.scheduledStartAt)
    const scheduledEnd = m.scheduledEndAt ? new Date(m.scheduledEndAt) : null
    
    let durationText = m.duration || ''
    if (!durationText && scheduledEnd) {
      const durationMs = scheduledEnd.getTime() - scheduledStart.getTime()
      const durationHours = Math.round(durationMs / (1000 * 60 * 60))
      durationText = `~${durationHours} hour${durationHours !== 1 ? 's' : ''}`
    }

    return {
      id: String(m.id),
      shortId: m.shortId || '',
      title: m.title,
      description: m.description,
      scheduledAt: formatDateTime(scheduledStart),
      duration: durationText,
      affectedServices: (m.affectedServices || []).map((s) => {
        if (typeof s === 'object' && s !== null) {
          return s.name
        }
        return String(s)
      }),
      status: m.status as 'upcoming' | 'in_progress' | 'completed',
    }
  })

  // Group incidents by day
  const incidentsByDay = new Map<string, { incidents: typeof formattedIncidents, dateSlug: string }>()

  for (let i = 0; i < 5; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    incidentsByDay.set(formatDate(date), { incidents: [], dateSlug: formatDateSlug(date) })
  }

  const formattedIncidents = incidents.docs.map((incident) => ({
    id: String(incident.id),
    shortId: incident.shortId || '',
    title: incident.title,
    status: getIncidentStatus(incident.updates) as ServiceStatus,
    updates: (incident.updates || []).map((update, index) => ({
      id: `${incident.id}-update-${index}`,
      status: update.status as 'investigating' | 'identified' | 'monitoring' | 'resolved',
      message: update.message || '',
      timestamp: formatTime(new Date(update.createdAt)),
    })),
    createdAt: new Date(incident.createdAt),
  }))

  formattedIncidents.forEach((incident) => {
    const dateKey = formatDate(incident.createdAt)
    if (incidentsByDay.has(dateKey)) {
      incidentsByDay.get(dateKey)!.incidents.push(incident)
    }
  })

  const pastIncidents = Array.from(incidentsByDay.entries()).map(
    ([date, { incidents, dateSlug }]) => ({
      date,
      dateSlug,
      incidents: incidents.map(({ createdAt: _createdAt, ...rest }) => rest),
    })
  )

  // Calculate overall status
  const allStatuses = services.docs.map((s) => s.status || 'operational')
  let overallStatus: ServiceStatus = 'operational'

  if (allStatuses.some((s) => s === 'major')) {
    overallStatus = 'major'
  } else if (allStatuses.some((s) => s === 'partial')) {
    overallStatus = 'partial'
  } else if (allStatuses.some((s) => s === 'degraded')) {
    overallStatus = 'degraded'
  } else if (allStatuses.some((s) => s === 'maintenance')) {
    overallStatus = 'maintenance'
  }

  if (settings.maintenanceModeEnabled) {
    overallStatus = 'maintenance'
  }

  return {
    settings,
    overallStatus,
    serviceGroups: groupedServices,
    maintenances: formattedMaintenances,
    pastIncidents,
  }
}

export default async function StatusPage() {
  const { settings, overallStatus, serviceGroups, maintenances, pastIncidents } = await getStatusData()

  return (
    <div className="min-h-screen bg-background">
      <Header
        siteName={settings.siteName}
        logoLightUrl={getMediaUrl(settings.logoLight)}
        logoDarkUrl={getMediaUrl(settings.logoDark)}
      >
        <Subscribe />
      </Header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Status Banner */}
        <section className="mb-8 animate-fade-in">
          <StatusBanner status={overallStatus} />
        </section>

        {/* Service Groups */}
        <section className="mb-10 space-y-4">
          {serviceGroups.map((group, index) => (
            <div
              key={group.name}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ServiceGroup name={group.name} services={group.services} />
            </div>
          ))}
        </section>

        {/* Status Legend */}
        <section className="mb-10">
          <StatusLegend />
        </section>

        {/* Scheduled Maintenance */}
        {maintenances.length > 0 && (
          <section className="mb-10 animate-fade-in">
            <h2 className="mb-4 text-xl font-bold text-foreground">Scheduled Maintenance</h2>
            <div className="space-y-4">
              {maintenances.map((maintenance) => (
                <MaintenanceCard key={maintenance.id} maintenance={maintenance} />
              ))}
            </div>
          </section>
        )}

        {/* Past Incidents */}
        <section className="animate-fade-in">
          <h2 className="mb-6 text-xl font-bold text-foreground">Past Incidents</h2>
          <IncidentTimelineWithLinks days={pastIncidents} />
          <div className="mt-6 text-center">
            <Link
              href="/history"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              ← View incident history
            </Link>
          </div>
        </section>
      </main>

      <Footer footerText={settings.footerText} />
    </div>
  )
}
