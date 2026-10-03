import { z } from 'zod'
import { incidentStatusOptions } from '@/collections/Incidents'
import { maintenanceStatusOptions } from '@/collections/Maintenances'
import { serviceStatusOptions } from '@/collections/Services'

const enumValues = <T extends readonly { value: string }[]>(options: T) =>
  options.map((o) => o.value) as [T[number]['value'], ...T[number]['value'][]]

export const serviceStatusSchema = z.enum(enumValues(serviceStatusOptions)).meta({ id: 'ServiceStatus' })
export const incidentStatusSchema = z.enum(enumValues(incidentStatusOptions)).meta({ id: 'IncidentStatus' })
export const maintenanceStatusSchema = z.enum(enumValues(maintenanceStatusOptions)).meta({ id: 'MaintenanceStatus' })

const dateTime = z.iso.datetime({ offset: true }).describe('ISO 8601 timestamp in UTC')

export const serviceRefSchema = z
  .object({
    slug: z.string(),
    name: z.string(),
  })
  .meta({ id: 'ServiceRef', description: 'Reference to a service' })

export const serviceSchema = z
  .object({
    slug: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    status: serviceStatusSchema,
    group: z.object({ slug: z.string(), name: z.string() }),
    updatedAt: dateTime,
  })
  .meta({ id: 'Service' })

export const serviceGroupSchema = z
  .object({
    slug: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    status: serviceStatusSchema.describe('Worst status among the services in this group'),
    services: z.array(serviceSchema.omit({ group: true })),
  })
  .meta({ id: 'ServiceGroup' })

export const incidentUpdateSchema = z
  .object({
    status: incidentStatusSchema,
    message: z.string(),
    createdAt: dateTime,
  })
  .meta({ id: 'IncidentUpdate' })

export const incidentSchema = z
  .object({
    shortId: z.string().describe('Stable public identifier, also used in permalinks'),
    title: z.string(),
    status: incidentStatusSchema,
    url: z.url().describe('Permalink to the incident on the status page'),
    affectedServices: z.array(serviceRefSchema),
    updates: z.array(incidentUpdateSchema).describe('Newest first'),
    createdAt: dateTime,
    updatedAt: dateTime,
    resolvedAt: dateTime.nullable(),
  })
  .meta({ id: 'Incident' })

export const maintenanceUpdateSchema = z
  .object({
    status: maintenanceStatusSchema,
    message: z.string(),
    createdAt: dateTime,
  })
  .meta({ id: 'MaintenanceUpdate' })

export const maintenanceSchema = z
  .object({
    shortId: z.string().describe('Stable public identifier, also used in permalinks'),
    title: z.string(),
    status: maintenanceStatusSchema,
    url: z.url().describe('Permalink to the maintenance on the status page'),
    descriptionHtml: z.string().nullable().describe('Description rendered as sanitized HTML'),
    descriptionText: z.string().nullable().describe('Description as plain text'),
    scheduledStartAt: dateTime,
    scheduledEndAt: dateTime.nullable(),
    duration: z.string().nullable().describe('Human-readable expected duration, e.g. "~2 hours"'),
    affectedServices: z.array(serviceRefSchema),
    updates: z.array(maintenanceUpdateSchema).describe('Newest first'),
    createdAt: dateTime,
    updatedAt: dateTime,
    completedAt: dateTime.nullable(),
    cancelledAt: dateTime.nullable(),
  })
  .meta({ id: 'Maintenance' })

export const statusSchema = z
  .object({
    status: serviceStatusSchema.describe('Overall status; the worst status of any service, or "maintenance" when maintenance mode is enabled'),
    message: z.string().nullable().describe('Custom status message set by the operator'),
    siteName: z.string(),
    serviceGroups: z.array(serviceGroupSchema),
    activeIncidents: z.array(incidentSchema).describe('Incidents that are not resolved'),
    activeMaintenances: z.array(maintenanceSchema).describe('Maintenances that are upcoming or in progress'),
  })
  .meta({ id: 'Status' })

export const paginationMetaSchema = z
  .object({
    page: z.int().min(1),
    limit: z.int().min(1),
    total: z.int().min(0),
    totalPages: z.int().min(0),
  })
  .meta({ id: 'PaginationMeta' })

export const problemSchema = z
  .object({
    type: z.string().describe('URI reference identifying the problem type'),
    title: z.string(),
    status: z.int(),
    detail: z.string().optional(),
  })
  .meta({ id: 'Problem', description: 'RFC 9457 problem details' })

// Query parameters

const page = z.coerce.number().int().min(1).default(1)
const limit = z.coerce.number().int().min(1).max(100).default(25)
const service = z.string().optional().describe('Only items affecting the service with this slug')
const from = z.iso.datetime({ offset: true }).optional()
const to = z.iso.datetime({ offset: true }).optional()

export const incidentListQuerySchema = z.object({
  status: z
    .enum(['active', ...enumValues(incidentStatusOptions)])
    .optional()
    .describe('"active" matches every status except "resolved"'),
  service,
  from: from.describe('Only incidents created at or after this time'),
  to: to.describe('Only incidents created at or before this time'),
  page,
  limit,
})

export const maintenanceListQuerySchema = z.object({
  status: z
    .enum(['active', ...enumValues(maintenanceStatusOptions)])
    .optional()
    .describe('"active" matches "upcoming" and "in_progress"'),
  service,
  from: from.describe('Only maintenances that end (or start) at or after this time'),
  to: to.describe('Only maintenances that start at or before this time'),
  page,
  limit,
})

export type IncidentListQuery = z.infer<typeof incidentListQuerySchema>
export type MaintenanceListQuery = z.infer<typeof maintenanceListQuerySchema>
export type PublicIncident = z.infer<typeof incidentSchema>
export type PublicMaintenance = z.infer<typeof maintenanceSchema>
export type PublicService = z.infer<typeof serviceSchema>
export type PublicServiceGroup = z.infer<typeof serviceGroupSchema>
export type PublicStatus = z.infer<typeof statusSchema>
