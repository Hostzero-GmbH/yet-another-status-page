import type { Where } from 'payload'
import type { Service, Setting } from '@/payload-types'

export type ServiceStatus = Service['status']

/**
 * Maintenances shown on the status page: anything not finished, plus terminal ones
 * that ended within the configured retention window.
 */
export function visibleMaintenanceWhere(settings: Pick<Setting, 'maintenanceTerminalRetentionHours'>): Where {
  const retentionHours = settings.maintenanceTerminalRetentionHours ?? 24
  const cutoff = new Date(Date.now() - retentionHours * 3600 * 1000).toISOString()

  return {
    or: [
      { status: { equals: 'upcoming' } },
      { status: { equals: 'in_progress' } },
      {
        and: [{ status: { equals: 'cancelled' } }, { cancelledAt: { greater_than: cutoff } }],
      },
      {
        and: [{ status: { equals: 'completed' } }, { completedAt: { greater_than: cutoff } }],
      },
    ],
  }
}

const severityOrder: ServiceStatus[] = ['major', 'partial', 'degraded', 'maintenance']

/** Worst service status wins; the global maintenance mode flag overrides everything. */
export function computeOverallStatus(
  services: Array<Pick<Service, 'status'>>,
  settings: Pick<Setting, 'maintenanceModeEnabled'>,
): ServiceStatus {
  if (settings.maintenanceModeEnabled) return 'maintenance'
  const statuses = new Set(services.map((s) => s.status || 'operational'))
  return severityOrder.find((status) => statuses.has(status)) ?? 'operational'
}
