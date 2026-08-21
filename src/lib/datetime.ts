export type WeekStartsOn = 'sunday' | 'monday'

export type DateTimeConfig = {
  timezone: string
  locale: string
  weekStartsOn: WeekStartsOn
}

export const DEFAULT_TIMEZONE = 'UTC'
export const DEFAULT_LOCALE = 'en-US'
export const DEFAULT_WEEK_STARTS_ON: WeekStartsOn = 'monday'

export const DEFAULT_DATETIME_CONFIG: DateTimeConfig = {
  timezone: DEFAULT_TIMEZONE,
  locale: DEFAULT_LOCALE,
  weekStartsOn: DEFAULT_WEEK_STARTS_ON,
}

export const TIMEZONE_OPTIONS = [
  'UTC',
  'Pacific/Midway',
  'Pacific/Niue',
  'Pacific/Honolulu',
  'Pacific/Rarotonga',
  'America/Anchorage',
  'Pacific/Gambier',
  'America/Los_Angeles',
  'America/Tijuana',
  'America/Denver',
  'America/Phoenix',
  'America/Chicago',
  'America/Guatemala',
  'America/New_York',
  'America/Bogota',
  'America/Caracas',
  'America/Santiago',
  'America/Buenos_Aires',
  'America/Sao_Paulo',
  'Atlantic/South_Georgia',
  'Atlantic/Azores',
  'Atlantic/Cape_Verde',
  'Europe/London',
  'Europe/Berlin',
  'Africa/Lagos',
  'Europe/Athens',
  'Africa/Cairo',
  'Europe/Moscow',
  'Asia/Riyadh',
  'Asia/Dubai',
  'Asia/Baku',
  'Asia/Karachi',
  'Asia/Tashkent',
  'Asia/Calcutta',
  'Asia/Dhaka',
  'Asia/Almaty',
  'Asia/Jakarta',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Brisbane',
  'Australia/Sydney',
  'Pacific/Guam',
  'Pacific/Noumea',
  'Pacific/Auckland',
  'Pacific/Fiji',
] as const

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

type ZonedParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  weekday: number
}

export function resolveDateTimeConfig(settings?: {
  timezone?: string | null
  locale?: string | null
  weekStartsOn?: string | null
} | null): DateTimeConfig {
  return {
    timezone: safeTimeZone(settings?.timezone || DEFAULT_TIMEZONE),
    locale: safeLocale(settings?.locale || DEFAULT_LOCALE),
    weekStartsOn: settings?.weekStartsOn === 'sunday' ? 'sunday' : 'monday',
  }
}

export function safeTimeZone(timeZone: string): string {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format()
    return timeZone
  } catch {
    return DEFAULT_TIMEZONE
  }
}

export function safeLocale(locale: string): string {
  try {
    new Intl.DateTimeFormat(locale).format()
    return locale
  } catch {
    return DEFAULT_LOCALE
  }
}

export function uses12HourClock(locale: string): boolean {
  try {
    const cycle = new Intl.DateTimeFormat(safeLocale(locale), { hour: 'numeric' }).resolvedOptions()
      .hourCycle
    return cycle === 'h11' || cycle === 'h12'
  } catch {
    return true
  }
}

function zonedParts(date: Date, timeZone: string): ZonedParts {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: safeTimeZone(timeZone),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
    hour12: false,
  })
  const parts: Record<string, string> = {}
  for (const part of dtf.formatToParts(date)) {
    if (part.type !== 'literal') parts[part.type] = part.value
  }
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: WEEKDAY_INDEX[parts.weekday] ?? 0,
  }
}

export function zonedDateToUtc(
  parts: {
    year: number
    month: number
    day: number
    hour?: number
    minute?: number
    second?: number
    millisecond?: number
  },
  timeZone: string,
): Date {
  const tz = safeTimeZone(timeZone)
  const hour = parts.hour ?? 0
  const minute = parts.minute ?? 0
  const second = parts.second ?? 0
  const millisecond = parts.millisecond ?? 0
  let instant = Date.UTC(parts.year, parts.month - 1, parts.day, hour, minute, second, millisecond)

  for (let i = 0; i < 4; i++) {
    const shown = zonedParts(new Date(instant), tz)
    const shownAsUtc = Date.UTC(shown.year, shown.month - 1, shown.day, shown.hour, shown.minute, shown.second)
    const desiredAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, hour, minute, second)
    const delta = desiredAsUtc - shownAsUtc
    if (delta === 0) break
    instant += delta
  }

  return new Date(instant)
}

export function addZonedDays(date: Date, days: number, timeZone: string): Date {
  const tz = safeTimeZone(timeZone)
  const parts = zonedParts(date, tz)
  const calendar = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days))
  return zonedDateToUtc(
    {
      year: calendar.getUTCFullYear(),
      month: calendar.getUTCMonth() + 1,
      day: calendar.getUTCDate(),
      hour: parts.hour,
      minute: parts.minute,
      second: parts.second,
    },
    tz,
  )
}

export function startOfZonedDay(date: Date, timeZone: string): Date {
  const parts = zonedParts(date, timeZone)
  return zonedDateToUtc(
    { year: parts.year, month: parts.month, day: parts.day, hour: 0, minute: 0, second: 0 },
    timeZone,
  )
}

export function endOfZonedDay(date: Date, timeZone: string): Date {
  const parts = zonedParts(date, timeZone)
  return zonedDateToUtc(
    {
      year: parts.year,
      month: parts.month,
      day: parts.day,
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 999,
    },
    timeZone,
  )
}

export function getWeekStart(date: Date, weekStartsOn: WeekStartsOn, timeZone: string): Date {
  const tz = safeTimeZone(timeZone)
  const parts = zonedParts(date, tz)
  const startDow = weekStartsOn === 'sunday' ? 0 : 1
  const daysBack = (parts.weekday - startDow + 7) % 7
  const calendar = new Date(Date.UTC(parts.year, parts.month - 1, parts.day - daysBack))
  return zonedDateToUtc(
    {
      year: calendar.getUTCFullYear(),
      month: calendar.getUTCMonth() + 1,
      day: calendar.getUTCDate(),
      hour: 0,
      minute: 0,
      second: 0,
    },
    tz,
  )
}

export function formatDateSlug(date: Date, timeZone: string): string {
  const parts = zonedParts(date, timeZone)
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
}

export function parseDateSlug(slug: string): { year: number; month: number; day: number } | null {
  const match = slug.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const probe = new Date(Date.UTC(year, month - 1, day))
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null
  }
  return { year, month, day }
}

export function dateFromSlug(slug: string, timeZone: string): Date | null {
  const parts = parseDateSlug(slug)
  if (!parts) return null
  return zonedDateToUtc({ ...parts, hour: 12 }, timeZone)
}

export function formatDate(date: Date, config: DateTimeConfig): string {
  return date.toLocaleDateString(safeLocale(config.locale), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: safeTimeZone(config.timezone),
  })
}

export function formatShortDate(date: Date, config: DateTimeConfig): string {
  return date.toLocaleDateString(safeLocale(config.locale), {
    month: 'short',
    day: 'numeric',
    timeZone: safeTimeZone(config.timezone),
  })
}

export function formatTime(date: Date, config: DateTimeConfig): string {
  return date.toLocaleTimeString(safeLocale(config.locale), {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: safeTimeZone(config.timezone),
    timeZoneName: 'short',
  })
}

export function formatDateTime(date: Date, config: DateTimeConfig): string {
  return date.toLocaleString(safeLocale(config.locale), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: safeTimeZone(config.timezone),
    timeZoneName: 'short',
  })
}

export function formatNotificationDateTime(date: Date, config: DateTimeConfig): string {
  return date.toLocaleString(safeLocale(config.locale), {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: safeTimeZone(config.timezone),
    timeZoneName: 'short',
  })
}

export function formatTimezoneNotice(timeZone: string): string {
  return `All times in ${safeTimeZone(timeZone)}`
}

export function utcToPickerDate(value: string | Date, timeZone: string): Date {
  const instant = typeof value === 'string' ? new Date(value) : value
  const parts = zonedParts(instant, timeZone)
  return new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
}

export function pickerDateToUtc(pickerDate: Date, timeZone: string): string {
  return zonedDateToUtc(
    {
      year: pickerDate.getFullYear(),
      month: pickerDate.getMonth() + 1,
      day: pickerDate.getDate(),
      hour: pickerDate.getHours(),
      minute: pickerDate.getMinutes(),
      second: pickerDate.getSeconds(),
      millisecond: pickerDate.getMilliseconds(),
    },
    timeZone,
  ).toISOString()
}
