import { findIncident } from '@/lib/api/v1/queries'
import { serializeIncident } from '@/lib/api/v1/serializers'
import { handle, json, notFound } from '@/lib/api/v1/respond'

export const dynamic = 'force-dynamic'
export { OPTIONS } from '@/lib/api/v1/respond'

export const GET = handle(async (request, ctx: { params: Promise<{ shortId: string }> }) => {
  const { shortId } = await ctx.params
  const doc = await findIncident(shortId)
  if (!doc) return notFound('incident', shortId)
  return json(request, { data: serializeIncident(doc) })
})
