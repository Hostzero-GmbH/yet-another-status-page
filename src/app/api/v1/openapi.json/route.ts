import { getSettings } from '@/lib/payload'
import { buildOpenApiDocument } from '@/lib/api/v1/openapi'
import { handle, json } from '@/lib/api/v1/respond'

export const dynamic = 'force-dynamic'
export { OPTIONS } from '@/lib/api/v1/respond'

export const GET = handle(async (request) => {
  const settings = await getSettings()
  return json(request, buildOpenApiDocument(settings.siteName))
})
