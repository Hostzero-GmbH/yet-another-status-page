import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Setting } from '@/payload-types'

/**
 * Cached Payload instance getter
 * React's cache() ensures we only create one instance per request
 */
export const getCachedPayload = cache(async () => {
  return getPayload({ config })
})

/**
 * Cached settings getter
 * Deduplicates settings fetches within a single request
 */
export const getSettings = cache(async (): Promise<Setting> => {
  const payload = await getCachedPayload()
  return payload.findGlobal({
    slug: 'settings',
    depth: 1,
  }) as Promise<Setting>
})
