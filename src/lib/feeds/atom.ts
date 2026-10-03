import type { Incident, Maintenance } from '@/payload-types'
import { incidentStatusConfig, maintenanceStatusConfig } from '@/lib/status-config'
import { lexicalToHtml } from '@/lib/lexical'
import { getServerUrl } from '@/lib/utils'

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

interface Entry {
  id: string
  title: string
  url: string
  published: string
  updated: string
  html: string
}

function updatesHtml(
  updates: Array<{ status: string; message: string; createdAt: string }>,
  labels: Record<string, { label: string }>,
): string {
  return [...updates]
    .reverse()
    .map(
      (u) =>
        `<p><strong>${esc(labels[u.status]?.label ?? u.status)}</strong> <small>${esc(u.createdAt)}</small><br>${esc(u.message).replace(/\n/g, '<br>')}</p>`,
    )
    .join('')
}

/** Latest of document save and newest update, so reschedules and backdated updates both behave. */
function latestUpdateAt(doc: { updates?: Array<{ createdAt: string }> | null; updatedAt: string }): string {
  const last = doc.updates?.[doc.updates.length - 1]
  return last && last.createdAt > doc.updatedAt ? last.createdAt : doc.updatedAt
}

export function incidentEntry(doc: Incident): Entry {
  const url = `${getServerUrl()}/i/${doc.shortId}`
  const label = incidentStatusConfig[doc.status]?.label ?? doc.status
  return {
    id: url,
    title: `[${label}] ${doc.title}`,
    url,
    published: doc.createdAt,
    updated: latestUpdateAt(doc),
    html: updatesHtml(doc.updates ?? [], incidentStatusConfig),
  }
}

export function maintenanceEntry(doc: Maintenance): Entry {
  const url = `${getServerUrl()}/m/${doc.shortId}`
  const label = maintenanceStatusConfig[doc.status]?.label ?? doc.status
  const schedule = `<p>Scheduled: ${esc(doc.scheduledStartAt)}${doc.scheduledEndAt ? ` – ${esc(doc.scheduledEndAt)}` : ''}${doc.duration ? ` (${esc(doc.duration)})` : ''}</p>`
  return {
    id: url,
    title: `[Maintenance ${label}] ${doc.title}`,
    url,
    published: doc.createdAt,
    updated: latestUpdateAt(doc),
    html: schedule + (lexicalToHtml(doc.description) ?? '') + updatesHtml(doc.updates ?? [], maintenanceStatusConfig),
  }
}

/** Entries are expected sorted newest first. */
export function renderAtom(siteName: string, selfPath: string, entries: Entry[]): string {
  const base = getServerUrl()
  const updated = entries[0]?.updated ?? new Date().toISOString()

  const items = entries
    .map(
      (e) => `  <entry>
    <id>${esc(e.id)}</id>
    <title>${esc(e.title)}</title>
    <link rel="alternate" type="text/html" href="${esc(e.url)}"/>
    <published>${esc(e.published)}</published>
    <updated>${esc(e.updated)}</updated>
    <content type="html">${esc(e.html)}</content>
  </entry>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${esc(base)}/</id>
  <title>${esc(siteName)} Status</title>
  <link rel="alternate" type="text/html" href="${esc(base)}/"/>
  <link rel="self" type="application/atom+xml" href="${esc(base)}${selfPath}"/>
  <updated>${esc(updated)}</updated>
  <author><name>${esc(siteName)}</name></author>
  <generator>Yet Another Status Page</generator>
${items}
</feed>
`
}
