import { findIncidents } from '@/lib/api/v1/queries'
import { incidentListQuerySchema } from '@/lib/api/v1/schemas'
import { serializeIncident } from '@/lib/api/v1/serializers'
import { handle, paginated, parseQuery } from '@/lib/api/v1/respond'

export const dynamic = 'force-dynamic'
export { OPTIONS } from '@/lib/api/v1/respond'

export const GET = handle(async (request) => {
  const query = parseQuery(request, incidentListQuerySchema)
  const result = await findIncidents(query)
  return paginated(request, result, result.docs.map(serializeIncident))
})
