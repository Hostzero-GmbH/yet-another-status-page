import { getPayload } from 'payload'
import config from '@payload-config'
import type { Metadata } from 'next'
import { UnsubscribeClient } from './UnsubscribeClient'
import type { Setting } from '@/payload-types'

export const dynamic = 'force-dynamic'

async function getSettings() {
  const payload = await getPayload({ config })
  return await payload.findGlobal({
    slug: 'settings',
    depth: 0,
  }) as Setting
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const siteName = settings.siteName || 'Status Page'

  return {
    title: `Unsubscribe - ${siteName}`,
    description: `Manage your subscription preferences for ${siteName} status updates.`,
  }
}

interface UnsubscribePageProps {
  params: Promise<{ token: string }>
}

export default async function UnsubscribePage({ params }: UnsubscribePageProps) {
  const { token } = await params
  const payload = await getPayload({ config })
  const settings = await getSettings()
  const siteName = settings.siteName || 'Status Page'

  // Find subscriber by token
  const result = await payload.find({
    collection: 'subscribers',
    where: {
      unsubscribeToken: {
        equals: token,
      },
    },
    limit: 1,
  })

  const subscriber = result.docs[0]

  if (!subscriber) {
    return (
      <UnsubscribeClient
        siteName={siteName}
        status="not-found"
        token={token}
      />
    )
  }

  if (!subscriber.active) {
    return (
      <UnsubscribeClient
        siteName={siteName}
        status="already-unsubscribed"
        token={token}
      />
    )
  }

  return (
    <UnsubscribeClient
      siteName={siteName}
      status="active"
      token={token}
      subscriberType={subscriber.type}
      subscriberContact={subscriber.type === 'email' ? subscriber.email : subscriber.phone}
    />
  )
}
