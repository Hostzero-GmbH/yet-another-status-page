import { getSettings } from '@/lib/payload'
import { computeOverallStatus } from '@/lib/status-data'
import { findIncidents, findMaintenances, findServicesAndGroups } from '@/lib/api/v1/queries'
import { serializeIncident, serializeMaintenance, serializeServiceGroups } from '@/lib/api/v1/serializers'
import { handle, json } from '@/lib/api/v1/respond'
import type { PublicStatus } from '@/lib/api/v1/schemas'

export const dynamic = 'force-dynamic'
export { OPTIONS } from '@/lib/api/v1/respond'

export const GET = handle(async (request) => {
  const [settings, { groups, services }, incidents, maintenances] = await Promise.all([
    getSettings(),
    findServicesAndGroups(),
    findIncidents({ status: 'active', page: 1, limit: 50 }),
    findMaintenances({ status: 'active', page: 1, limit: 50 }),
  ])

  const body: PublicStatus = {
    status: computeOverallStatus(services, settings),
    message: settings.customStatusMessage || null,
    siteName: settings.siteName,
    serviceGroups: serializeServiceGroups(groups, services),
    activeIncidents: incidents.docs.map(serializeIncident),
    activeMaintenances: maintenances.docs.map(serializeMaintenance),
  }

  return json(request, { data: body })
})
