import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSettings } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDateSlug(date: Date): string {
  return date.toISOString().split('T')[0]
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  
  const titleTemplate = settings.historyMetaTitle || 'Incident History - {{siteName}}'
  const descriptionTemplate = settings.historyMetaDescription || 'View historical incidents and status updates for {{siteName}}'
  
  const title = titleTemplate.replace(/\{\{siteName\}\}/g, settings.siteName)
  const description = descriptionTemplate.replace(/\{\{siteName\}\}/g, settings.siteName)

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

export default async function HistoryPage() {
  // Redirect to current week (Monday of this week)
  const today = new Date()
  const monday = getMonday(today)
  const weekSlug = formatDateSlug(monday)
  
  redirect(`/history/${weekSlug}`)
}
