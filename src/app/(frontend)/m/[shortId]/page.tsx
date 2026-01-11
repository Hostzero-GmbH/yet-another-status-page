import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Wrench, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import type { Maintenance } from '@/payload-types'
import { getCachedPayload, getSettings } from '@/lib/payload'
import { Header } from '@/components/status/Header'
import { Footer } from '@/components/status/Footer'
import { CopyLinkButton } from '@/components/status/CopyLinkButton'
import { MaintenanceUpdatesTimeline } from '@/components/status/MaintenanceUpdatesTimeline'
import { RichText } from '@/components/RichText'
import { cn, getMediaUrl } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{ shortId: string }>
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

const statusConfig: Record<string, { label: string; className: string; icon: typeof Wrench }> = {
  upcoming: { label: "Upcoming", className: "bg-status-maintenance/10 text-status-maintenance", icon: Clock },
  in_progress: { label: "In Progress", className: "bg-status-degraded/10 text-status-degraded", icon: Wrench },
  completed: { label: "Completed", className: "bg-status-operational/10 text-status-operational", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground", icon: AlertTriangle },
}

async function getMaintenanceData(shortId: string) {
  const payload = await getCachedPayload()
  const settings = await getSettings()

  const result = await payload.find({
    collection: 'maintenances',
    where: {
      shortId: { equals: shortId },
    },
    depth: 1,
    limit: 1,
  })

  if (result.docs.length === 0) {
    return null
  }

  const maintenance = result.docs[0] as Maintenance

  const scheduledStart = new Date(maintenance.scheduledStartAt)
  const scheduledEnd = maintenance.scheduledEndAt ? new Date(maintenance.scheduledEndAt) : null

  let durationText = maintenance.duration || ''
  if (!durationText && scheduledEnd) {
    const durationMs = scheduledEnd.getTime() - scheduledStart.getTime()
    const durationHours = Math.round(durationMs / (1000 * 60 * 60))
    durationText = `~${durationHours} hour${durationHours !== 1 ? 's' : ''}`
  }

  const updates = (maintenance.updates || []).map((update, index) => ({
    id: `${maintenance.id}-update-${index}`,
    status: update.status,
    message: update.message || '',
    dateTime: formatDateTime(new Date(update.createdAt)),
  }))

  const affectedServices = (maintenance.affectedServices || []).map((s) => {
    if (typeof s === 'object' && s !== null) {
      return s.name
    }
    return String(s)
  })

  return {
    settings,
    maintenance: {
      title: maintenance.title,
      description: maintenance.description,
      status: maintenance.status,
      scheduledAt: formatDateTime(scheduledStart),
      duration: durationText,
      affectedServices,
      updates,
    },
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shortId } = await params
  const data = await getMaintenanceData(shortId)

  if (!data) {
    return { title: 'Maintenance Not Found' }
  }

  const title = `${data.maintenance.title} - ${data.settings.siteName}`
  const description = `Scheduled maintenance: ${data.maintenance.title}`

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary', title, description },
  }
}

export default async function MaintenancePage({ params }: PageProps) {
  const { shortId } = await params
  const data = await getMaintenanceData(shortId)

  if (!data) {
    notFound()
  }

  const { settings, maintenance } = data
  const status = statusConfig[maintenance.status] || statusConfig.upcoming
  const StatusIcon = status.icon

  return (
    <div className="min-h-screen bg-background">
      <Header
        siteName={settings.siteName}
        logoLightUrl={getMediaUrl(settings.logoLight)}
        logoDarkUrl={getMediaUrl(settings.logoDark)}
        subtitle="Maintenance Details"
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

        {/* Maintenance Header */}
        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-status-maintenance/10">
              <Wrench className="h-6 w-6 text-status-maintenance" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{maintenance.title}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {maintenance.scheduledAt}
                    </span>
                    {maintenance.duration && <span>Duration: {maintenance.duration}</span>}
                  </div>
                </div>
                <span className={cn("rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5", status.className)}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </span>
              </div>

              {maintenance.description && typeof maintenance.description === 'object' && (
                <div className="mt-4 text-sm text-muted-foreground">
                  <RichText content={maintenance.description} />
                </div>
              )}

              {maintenance.affectedServices.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="text-sm text-muted-foreground">Affected services:</span>
                  {maintenance.affectedServices.map((service) => (
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
          </div>
        </div>

        {/* Updates Timeline */}
        <MaintenanceUpdatesTimeline updates={maintenance.updates} />
      </main>

      <Footer footerText={settings.footerText} />
    </div>
  )
}
