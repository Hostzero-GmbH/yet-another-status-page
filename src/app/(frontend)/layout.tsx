import type { Metadata } from 'next'
import type { Media } from '@/payload-types'
import { getSettings } from '@/lib/payload'
import { getMediaUrl } from '@/lib/utils'
import './globals.css'

function getMediaMimeType(media: number | Media | null | undefined): string | undefined {
  if (!media) return undefined
  if (typeof media === 'number') return undefined
  return media.mimeType || undefined
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()

  const faviconUrl = getMediaUrl(settings.favicon)
  const faviconMimeType = getMediaMimeType(settings.favicon)

  const icons: Metadata['icons'] = {}
  
  if (faviconUrl) {
    // Determine icon type based on mime type or file extension
    if (faviconMimeType?.includes('svg') || faviconUrl.endsWith('.svg')) {
      icons.icon = { url: faviconUrl, type: 'image/svg+xml' }
    } else if (faviconMimeType?.includes('ico') || faviconUrl.endsWith('.ico')) {
      icons.icon = { url: faviconUrl, type: 'image/x-icon' }
    } else {
      icons.icon = faviconUrl
    }
  }

  return {
    title: {
      default: settings.metaTitle || `${settings.siteName} Status`,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.metaDescription || `Real-time status and incident updates for ${settings.siteName} services`,
    icons,
  }
}

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
