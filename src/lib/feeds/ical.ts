import type { Maintenance } from '@/payload-types'
import { lexicalToText } from '@/lib/lexical'
import { getServerUrl } from '@/lib/utils'

const escapeText = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

const toIcsDate = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')

/** RFC 5545 §3.1: lines longer than 75 octets are folded with CRLF + single space. */
function fold(line: string): string {
  const bytes = Buffer.from(line, 'utf8')
  if (bytes.length <= 75) return line
  const parts: string[] = []
  let start = 0
  while (start < bytes.length) {
    let end = Math.min(start + (start === 0 ? 75 : 74), bytes.length)
    // Don't split a multi-byte UTF-8 sequence.
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--
    parts.push(bytes.subarray(start, end).toString('utf8'))
    start = end
  }
  return parts.join('\r\n ')
}

const icsStatus: Record<Maintenance['status'], string> = {
  upcoming: 'CONFIRMED',
  in_progress: 'CONFIRMED',
  completed: 'CONFIRMED',
  cancelled: 'CANCELLED',
}

function event(doc: Maintenance, host: string): string[] {
  const url = `${getServerUrl()}/m/${doc.shortId}`
  const services = (doc.affectedServices ?? [])
    .filter((s): s is Exclude<typeof s, number> => typeof s === 'object' && s !== null)
    .map((s) => s.name)
  const description = [
    lexicalToText(doc.description),
    services.length ? `Affected services: ${services.join(', ')}` : null,
    doc.duration ? `Expected duration: ${doc.duration}` : null,
    url,
  ]
    .filter(Boolean)
    .join('\n\n')

  const lines = [
    'BEGIN:VEVENT',
    `UID:${doc.shortId}@${host}`,
    `DTSTAMP:${toIcsDate(doc.updatedAt)}`,
    `DTSTART:${toIcsDate(doc.scheduledStartAt)}`,
    doc.scheduledEndAt ? `DTEND:${toIcsDate(doc.scheduledEndAt)}` : null,
    `SUMMARY:${escapeText(doc.title)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${url}`,
    `STATUS:${icsStatus[doc.status]}`,
    // Must increase on any change (reschedules included), so derive it from updatedAt rather than counting updates.
    `SEQUENCE:${Math.floor(new Date(doc.updatedAt).getTime() / 1000)}`,
    'END:VEVENT',
  ]
  return lines.filter((l): l is string => l !== null)
}

export function renderIcs(siteName: string, maintenances: Maintenance[]): string {
  const host = new URL(getServerUrl()).host
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Yet Another Status Page//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(siteName)} Maintenance`,
    'X-PUBLISHED-TTL:PT1H',
    ...maintenances.flatMap((m) => event(m, host)),
    'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}
