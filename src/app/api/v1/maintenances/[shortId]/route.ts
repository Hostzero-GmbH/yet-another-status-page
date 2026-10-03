import { findMaintenance } from '@/lib/api/v1/queries'
import { serializeMaintenance } from '@/lib/api/v1/serializers'
import { handle, json, notFound } from '@/lib/api/v1/respond'

export const dynamic = 'force-dynamic'
export { OPTIONS } from '@/lib/api/v1/respond'

export const GET = handle(async (request, ctx: { params: Promise<{ shortId: string }> }) => {
  const { shortId } = await ctx.params
  const doc = await findMaintenance(shortId)
  if (!doc) return notFound('maintenance', shortId)
  return json(request, { data: serializeMaintenance(doc) })
})
