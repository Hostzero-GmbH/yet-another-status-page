import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { getIncidentStatus } from '@/collections/Incidents'
import { getCachedPayload, getSettings } from '@/lib/payload'
import { Header } from '@/components/status/Header'
import { Footer } from '@/components/status/Footer'
import { IncidentTimelineWithLinks } from '@/components/status/IncidentTimeline'
import { cn, getMediaUrl } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type ServiceStatus = 'operational' | 'degraded' | 'partial' | 'major' | 'maintenance'

interface PageProps {
  params: Promise<{ date: string }>
}

function parseDate(dateSlug: string): Date | null {
  const match = dateSlug.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  
  const [, year, month, day] = match
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  
  if (isNaN(date.getTime())) return null
  if (date.getFullYear() !== parseInt(year)) return null
  if (date.getMonth() !== parseInt(month) - 1) return null
  if (date.getDate() !== parseInt(day)) return null
  
  return date
}

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function formatDateSlug(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date: dateSlug } = await params
  const parsedDate = parseDate(dateSlug)
  
  if (!parsedDate) {
    return { title: 'Week Not Found' }
  }
  
  const settings = await getSettings()
  const monday = getMonday(parsedDate)
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)
  
  const weekRange = `${formatShortDate(monday)} - ${formatShortDate(sunday)}`
  
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
  const parsedDate = parseDate(dateSlug)
  if (!parsedDate) return null
  
  const monday = getMonday(parsedDate)
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  
  const payload = await getCachedPayload()
  const settings = await getSettings()

  const incidents = await payload.find({
    collection: 'incidents',
    where: {
      createdAt: {
        greater_than_equal: monday.toISOString(),
        less_than_equal: sunday.toISOString(),
      },
    },
    sort: '-createdAt',
    limit: 500,
  })

  // Group incidents by day
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
    const date = new Date(monday)
    date.setDate(date.getDate() + i)
    incidentsByDay.set(formatDate(date), { incidents: [], dateSlug: formatDateSlug(date) })
  }

  incidents.docs.forEach((incident) => {
    const createdAt = new Date(incident.createdAt)
    const dateKey = formatDate(createdAt)

    if (incidentsByDay.has(dateKey)) {
      const updates = (incident.updates || []).map((update, index) => ({
        id: `${incident.id}-update-${index}`,
        status: update.status as 'investigating' | 'identified' | 'monitoring' | 'resolved',
        message: update.message || '',
        timestamp: formatTime(new Date(update.createdAt)),
      }))

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

  const prevMonday = new Date(monday)
  prevMonday.setDate(prevMonday.getDate() - 7)
  
  const nextMonday = new Date(monday)
  nextMonday.setDate(nextMonday.getDate() + 7)
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentMonday = getMonday(today)
  
  const hasNextWeek = nextMonday <= currentMonday

  return {
    settings,
    weekStart: formatShortDate(monday),
    weekEnd: formatShortDate(sunday),
    incidents: weekIncidents,
    prevWeekSlug: formatDateSlug(prevMonday),
    nextWeekSlug: hasNextWeek ? formatDateSlug(nextMonday) : null,
    isCurrentWeek: formatDateSlug(monday) === formatDateSlug(currentMonday),
  }
}

export default async function WeekPage({ params }: PageProps) {
  const { date: dateSlug } = await params
  const data = await getWeekData(dateSlug)

  if (!data) {
    notFound()
  }

  const { settings, weekStart, weekEnd, incidents, prevWeekSlug, nextWeekSlug, isCurrentWeek } = data
  const totalIncidents = incidents.reduce((sum, day) => sum + day.incidents.length, 0)

  return (
    <div className="min-h-screen bg-background">
      <Header
        siteName={settings.siteName}
        logoLightUrl={getMediaUrl(settings.logoLight)}
        logoDarkUrl={getMediaUrl(settings.logoDark)}
        subtitle="Incident History"
      />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
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
            <h1 className="text-2xl font-bold text-foreground">
              {isCurrentWeek ? "This Week" : "Incident History"}
            </h1>
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

      <Footer footerText={settings.footerText} />
    </div>
  )
}
