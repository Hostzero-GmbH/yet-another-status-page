import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import type { Incident } from '@/payload-types'
import { getIncidentStatus } from '@/collections/Incidents'
import { getCachedPayload, getSettings } from '@/lib/payload'
import { Header } from '@/components/status/Header'
import { Footer } from '@/components/status/Footer'
import { IncidentTimelineWithLinks } from '@/components/status/IncidentTimeline'
import { cn, getMediaUrl } from '@/lib/utils'
import {
  addZonedDays,
  dateFromSlug,
  endOfZonedDay,
  formatDate,
  formatDateSlug,
  formatShortDate,
  formatTime,
  getWeekStart,
  resolveDateTimeConfig,
  startOfZonedDay,
} from '@/lib/datetime'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type ServiceStatus = 'operational' | 'degraded' | 'partial' | 'major' | 'maintenance'

interface PageProps {
  params: Promise<{ date: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date: dateSlug } = await params
  const settings = await getSettings()
  const dt = resolveDateTimeConfig(settings)
  const parsedDate = dateFromSlug(dateSlug, dt.timezone)
  
  if (!parsedDate) {
    return { title: 'Week Not Found' }
  }
  
  const weekStart = getWeekStart(parsedDate, dt.weekStartsOn, dt.timezone)
  const weekEnd = addZonedDays(weekStart, 6, dt.timezone)
  const weekRange = `${formatShortDate(weekStart, dt)} - ${formatShortDate(weekEnd, dt)}`
  
  const titleTemplate = settings.historyMetaTitle || 'Incidents: {{date}} - {{siteName}}'
  const descriptionTemplate = settings.historyMetaDescription || 'Status updates and incidents for {{siteName}} during {{date}}'
  
  const title = titleTemplate
    .replace(/\{\{date\}\}/g, weekRange)
    .replace(/\{\{siteName\}\}/g, settings.siteName)
  const description = descriptionTemplate
    .replace(/\{\{date\}\}/g, weekRange)
    .replace(/\{\{siteName\}\}/g, settings.siteName)

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary', title, description },
  }
}

async function getWeekData(dateSlug: string) {
  const settings = await getSettings()
  const dt = resolveDateTimeConfig(settings)
  const parsedDate = dateFromSlug(dateSlug, dt.timezone)
  if (!parsedDate) return null
  
  const weekStart = getWeekStart(parsedDate, dt.weekStartsOn, dt.timezone)
  const weekEnd = addZonedDays(weekStart, 6, dt.timezone)
  const rangeStart = startOfZonedDay(weekStart, dt.timezone)
  const rangeEnd = endOfZonedDay(weekEnd, dt.timezone)
  
  const payload = await getCachedPayload()

  const incidents = await payload.find({
    collection: 'incidents',
    where: {
      createdAt: {
        greater_than_equal: rangeStart.toISOString(),
        less_than_equal: rangeEnd.toISOString(),
      },
    },
    sort: '-createdAt',
    limit: 500,
  })

  const incidentsByDay = new Map<string, { incidents: Array<{
    id: string;
    shortId: string;
    title: string;
    status: ServiceStatus;
    updates: Array<{
      id: string;
      status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
      message: string;
      timestamp: string;
    }>;
  }>, dateSlug: string }>()
  
  for (let i = 0; i < 7; i++) {
    const date = addZonedDays(weekStart, i, dt.timezone)
    incidentsByDay.set(formatDate(date, dt), { incidents: [], dateSlug: formatDateSlug(date, dt.timezone) })
  }

  incidents.docs.forEach((incident: Incident) => {
    const createdAt = new Date(incident.createdAt)
    const dateKey = formatDate(createdAt, dt)

    if (incidentsByDay.has(dateKey)) {
      const updates = (incident.updates || []).map((update: Incident['updates'][number], index: number) => ({
        id: `${incident.id}-update-${index}`,
        status: update.status as 'investigating' | 'identified' | 'monitoring' | 'resolved',
        message: update.message || '',
        timestamp: formatTime(new Date(update.createdAt), dt),
      })).reverse()

      incidentsByDay.get(dateKey)!.incidents.push({
        id: String(incident.id),
        shortId: incident.shortId || '',
        title: incident.title,
        status: getIncidentStatus(incident.updates) as ServiceStatus,
        updates,
      })
    }
  })

  const weekIncidents = Array.from(incidentsByDay.entries())
    .map(([date, { incidents, dateSlug }]) => ({ date, dateSlug, incidents }))
    .reverse()

  const prevWeekStart = addZonedDays(weekStart, -7, dt.timezone)
  const nextWeekStart = addZonedDays(weekStart, 7, dt.timezone)
  const currentWeekStart = getWeekStart(new Date(), dt.weekStartsOn, dt.timezone)
  const previousWeekStart = addZonedDays(currentWeekStart, -7, dt.timezone)
  
  const isCurrentWeek = formatDateSlug(weekStart, dt.timezone) === formatDateSlug(currentWeekStart, dt.timezone)
  const hasNextWeek = nextWeekStart < currentWeekStart

  return {
    settings,
    weekStart: formatShortDate(weekStart, dt),
    weekEnd: formatShortDate(weekEnd, dt),
    incidents: weekIncidents,
    prevWeekSlug: formatDateSlug(prevWeekStart, dt.timezone),
    nextWeekSlug: hasNextWeek ? formatDateSlug(nextWeekStart, dt.timezone) : null,
    isCurrentWeek,
    previousWeekSlug: formatDateSlug(previousWeekStart, dt.timezone),
  }
}

export default async function WeekPage({ params }: PageProps) {
  const { date: dateSlug } = await params
  const data = await getWeekData(dateSlug)

  if (!data) {
    notFound()
  }

  // Redirect current week to previous week (current week is shown on main page)
  if (data.isCurrentWeek) {
    redirect(`/history/${data.previousWeekSlug}`)
  }

  const { settings, weekStart, weekEnd, incidents, prevWeekSlug, nextWeekSlug } = data
  const totalIncidents = incidents.reduce((sum, day) => sum + day.incidents.length, 0)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        siteName={settings.siteName}
        logoLightUrl={getMediaUrl(settings.logoLight)}
        logoDarkUrl={getMediaUrl(settings.logoDark)}
        subtitle="Incident History"
      />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to current status
          </Link>
        </div>

        {/* Title and Week Range */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Incident History</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {totalIncidents === 0
                ? "No incidents reported"
                : `${totalIncidents} incident${totalIncidents !== 1 ? "s" : ""} reported`}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{weekStart} – {weekEnd}</span>
          </div>
        </div>

        {/* Timeline */}
        <section className="mb-8 animate-fade-in">
          <IncidentTimelineWithLinks days={incidents} />
        </section>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-border pt-6">
          <Link
            href={`/history/${prevWeekSlug}`}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2",
              "text-sm font-medium text-foreground transition-all",
              "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous week
          </Link>

          {nextWeekSlug ? (
            <Link
              href={`/history/${nextWeekSlug}`}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2",
                "text-sm font-medium text-foreground transition-all",
                "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              Next week
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2",
                "text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed"
              )}
            >
              Next week
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </main>

      <Footer footerText={settings.footerText} timezone={settings.timezone} />
    </div>
  )
}
