import { findMaintenances } from '@/lib/api/v1/queries'
import { maintenanceListQuerySchema } from '@/lib/api/v1/schemas'
import { serializeMaintenance } from '@/lib/api/v1/serializers'
import { handle, paginated, parseQuery } from '@/lib/api/v1/respond'

export const dynamic = 'force-dynamic'
export { OPTIONS } from '@/lib/api/v1/respond'

export const GET = handle(async (request) => {
  const query = parseQuery(request, maintenanceListQuerySchema)
  const result = await findMaintenances(query)
  return paginated(request, result, result.docs.map(serializeMaintenance))
})
