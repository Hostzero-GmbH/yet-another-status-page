import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import type { Incident } from '@/payload-types'
import { getIncidentStatus, getIncidentResolvedAt } from '@/collections/Incidents'
import { getCachedPayload, getSettings } from '@/lib/payload'
import { Header } from '@/components/status/Header'
import { Footer } from '@/components/status/Footer'
import { CopyLinkButton } from '@/components/status/CopyLinkButton'
import { IncidentUpdatesTimeline } from '@/components/status/IncidentUpdatesTimeline'
import { cn, getMediaUrl } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{ shortId: string }>
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

async function getIncidentData(shortId: string) {
  const payload = await getCachedPayload()
  const settings = await getSettings()

  const result = await payload.find({
    collection: 'incidents',
    where: {
      shortId: { equals: shortId },
    },
    depth: 1,
    limit: 1,
  })

  if (result.docs.length === 0) {
    return null
  }

  const incident = result.docs[0] as Incident

  const updates = (incident.updates || []).map((update, index) => ({
    id: `${incident.id}-update-${index}`,
    status: update.status as 'investigating' | 'identified' | 'monitoring' | 'resolved',
    message: update.message || '',
    timestamp: formatTime(new Date(update.createdAt)),
    date: formatDate(new Date(update.createdAt)),
  }))

  const affectedServices = (incident.affectedServices || []).map((s) => {
    if (typeof s === 'object' && s !== null) {
      return s.name
    }
    return String(s)
  })

  const resolvedAtDate = getIncidentResolvedAt(incident.updates)

  return {
    settings,
    incident: {
      title: incident.title,
      status: getIncidentStatus(incident.updates),
      affectedServices,
      updates,
      createdAt: formatDate(new Date(incident.createdAt)),
      resolvedAt: resolvedAtDate ? formatDate(new Date(resolvedAtDate)) : null,
    },
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shortId } = await params
  const data = await getIncidentData(shortId)

  if (!data) {
    return { title: 'Incident Not Found' }
  }

  const title = `${data.incident.title} - ${data.settings.siteName}`
  const description = `Incident details and updates for ${data.incident.title}`

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary', title, description },
  }
}

export default async function IncidentPage({ params }: PageProps) {
  const { shortId } = await params
  const data = await getIncidentData(shortId)

  if (!data) {
    notFound()
  }

  const { settings, incident } = data
  const isResolved = incident.status === 'resolved'

  return (
    <div className="min-h-screen bg-background">
      <Header
        siteName={settings.siteName}
        logoLightUrl={getMediaUrl(settings.logoLight)}
        logoDarkUrl={getMediaUrl(settings.logoDark)}
        subtitle="Incident Details"
      />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Back Link & Copy */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to status
          </Link>
          <CopyLinkButton />
        </div>

        {/* Incident Header */}
        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{incident.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Reported on {incident.createdAt}
                {incident.resolvedAt && ` · Resolved on ${incident.resolvedAt}`}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                isResolved
                  ? "bg-status-operational/10 text-status-operational"
                  : "bg-status-degraded/10 text-status-degraded"
              )}
            >
              {isResolved ? "Resolved" : "Ongoing"}
            </span>
          </div>

          {incident.affectedServices.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className="text-sm text-muted-foreground">Affected:</span>
              {incident.affectedServices.map((service) => (
                <span
                  key={service}
                  className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {service}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Updates Timeline */}
        <section className="animate-fade-in">
          <h2 className="mb-6 text-xl font-bold text-foreground">Updates</h2>
          <IncidentUpdatesTimeline updates={incident.updates} />
        </section>
      </main>

      <Footer footerText={settings.footerText} />
    </div>
  )
}
