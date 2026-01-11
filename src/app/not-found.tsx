import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { getSettings } from '@/lib/payload'
import './(frontend)/globals.css'
import { Header } from '@/components/status/Header'
import { Footer } from '@/components/status/Footer'
import { getMediaUrl } from '@/lib/utils'

export default async function NotFound() {
  let siteName = 'Status'
  let footerText: unknown = null
  let logoLightUrl: string | undefined
  let logoDarkUrl: string | undefined

  try {
    const settings = await getSettings()

    siteName = settings.siteName || 'Status'
    footerText = settings.footerText
    logoLightUrl = getMediaUrl(settings.logoLight)
    logoDarkUrl = getMediaUrl(settings.logoDark)
  } catch {
    // Use defaults if settings can't be fetched
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <div className="flex min-h-screen flex-col">
          <Header
            siteName={siteName}
            logoLightUrl={logoLightUrl}
            logoDarkUrl={logoDarkUrl}
          />

          <main className="flex flex-1 items-center justify-center px-4">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle className="h-14 w-14 text-destructive" />
                </div>
              </div>

              <h1 className="mb-2 text-6xl font-bold text-foreground">404</h1>
              <p className="mb-2 text-xl font-medium text-foreground">Page Not Found</p>
              <p className="mb-8 text-muted-foreground">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </p>

              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                ← Back to Status Page
              </Link>
            </div>
          </main>

          <Footer footerText={footerText} />
        </div>
      </body>
    </html>
  )
}
