import { findServicesAndGroups } from '@/lib/api/v1/queries'
import { serializeService } from '@/lib/api/v1/serializers'
import { handle, json } from '@/lib/api/v1/respond'

export const dynamic = 'force-dynamic'
export { OPTIONS } from '@/lib/api/v1/respond'

export const GET = handle(async (request) => {
  const { services } = await findServicesAndGroups()
  return json(request, { data: services.map(serializeService) })
})
