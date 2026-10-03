import { z } from 'zod'
import { getServerUrl } from '@/lib/utils'
import {
  incidentListQuerySchema,
  incidentSchema,
  incidentStatusSchema,
  incidentUpdateSchema,
  maintenanceListQuerySchema,
  maintenanceSchema,
  maintenanceStatusSchema,
  maintenanceUpdateSchema,
  paginationMetaSchema,
  problemSchema,
  serviceGroupSchema,
  serviceRefSchema,
  serviceSchema,
  serviceStatusSchema,
  statusSchema,
} from './schemas'

type JsonSchema = Record<string, unknown>

const componentSchemas = [
  serviceStatusSchema,
  incidentStatusSchema,
  maintenanceStatusSchema,
  serviceRefSchema,
  serviceSchema,
  serviceGroupSchema,
  incidentUpdateSchema,
  incidentSchema,
  maintenanceUpdateSchema,
  maintenanceSchema,
  statusSchema,
  paginationMetaSchema,
  problemSchema,
]

/** Drops JSON Schema envelope keys and zod artefacts (date-time regex, safe-integer maximum) that OpenAPI `format` already covers. */
function tidy(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(tidy)
  if (!schema || typeof schema !== 'object') return schema
  const out: JsonSchema = {}
  for (const [key, value] of Object.entries(schema as JsonSchema)) {
    if (key === '$schema' || key === '$id') continue
    if (key === 'pattern' && (schema as JsonSchema).format === 'date-time') continue
    if (key === 'maximum' && value === Number.MAX_SAFE_INTEGER) continue
    out[key] = tidy(value)
  }
  return out
}

function components(): Record<string, JsonSchema> {
  const registry = z.registry<{ id: string }>()
  for (const schema of componentSchemas) {
    const id = schema.meta()?.id
    if (!id) throw new Error('OpenAPI component schema is missing meta.id')
    registry.add(schema, { id })
  }
  const { schemas } = z.toJSONSchema(registry, {
    target: 'draft-2020-12',
    io: 'output',
    uri: (id) => `#/components/schemas/${id}`,
  })
  return Object.fromEntries(Object.entries(schemas).map(([id, schema]) => [id, tidy(schema) as JsonSchema]))
}

function queryParameters(schema: z.ZodObject): JsonSchema[] {
  const json = z.toJSONSchema(schema, { target: 'draft-2020-12', io: 'input' }) as {
    properties?: Record<string, JsonSchema & { description?: string }>
  }
  return Object.entries(json.properties ?? {}).map(([name, prop]) => {
    const { description, ...rest } = prop
    return { name, in: 'query', required: false, description, schema: tidy(rest) }
  })
}

const ref = (id: string) => ({ $ref: `#/components/schemas/${id}` })

const headers = {
  ETag: { description: 'Weak validator; send it back as If-None-Match to receive 304 Not Modified', schema: { type: 'string' } },
  'Cache-Control': { description: 'public, max-age=30, stale-while-revalidate=60', schema: { type: 'string' } },
}

const problemResponse = (description: string) => ({
  description,
  content: { 'application/problem+json': { schema: ref('Problem') } },
})

const single = (id: string, description: string) => ({
  description,
  headers,
  content: {
    'application/json': {
      schema: { type: 'object', required: ['data'], properties: { data: ref(id) } },
    },
  },
})

const list = (id: string, description: string, paginatedList = true) => ({
  description,
  headers,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        required: paginatedList ? ['data', 'meta'] : ['data'],
        properties: {
          data: { type: 'array', items: ref(id) },
          ...(paginatedList ? { meta: ref('PaginationMeta') } : {}),
        },
      },
    },
  },
})

const shortIdParam = {
  name: 'shortId',
  in: 'path',
  required: true,
  schema: { type: 'string' },
  description: 'Public short identifier as found in permalinks',
}

const prettyParam = {
  name: 'pretty',
  in: 'query',
  required: false,
  allowEmptyValue: true,
  schema: { type: 'boolean' },
  description: 'Indent the JSON response',
}

export function buildOpenApiDocument(siteName: string) {
  const serverUrl = getServerUrl()
  return {
    openapi: '3.1.0',
    info: {
      title: `${siteName} Status API`,
      version: '1.0.0',
      description: [
        `Public, read-only API for the ${siteName} status page.`,
        '',
        'No authentication is required. Responses are cacheable for 30 seconds and carry an `ETag`; conditional requests with `If-None-Match` return `304 Not Modified`.',
        'All timestamps are ISO 8601 in UTC. Errors use RFC 9457 problem details (`application/problem+json`).',
        '',
        'The path prefix `/api/v1` is a stability contract: fields may be added, but existing fields and their meaning will not change.',
      ].join('\n'),
      license: { name: 'MIT', identifier: 'MIT' },
    },
    servers: [{ url: `${serverUrl}/api/v1` }],
    security: [],
    tags: [
      { name: 'Status', description: 'Aggregated current state' },
      { name: 'Incidents', description: 'Unplanned events and their update timelines' },
      { name: 'Maintenances', description: 'Planned maintenance windows' },
      { name: 'Services', description: 'Monitored services and their groups' },
    ],
    paths: {
      '/status': {
        get: {
          tags: ['Status'],
          operationId: 'getStatus',
          summary: 'Current overall status',
          description: 'Everything shown above the fold on the status page: overall indicator, services grouped by service group, unresolved incidents and upcoming or in-progress maintenances.',
          parameters: [prettyParam],
          responses: { '200': single('Status', 'Current status') },
        },
      },
      '/incidents': {
        get: {
          tags: ['Incidents'],
          operationId: 'listIncidents',
          summary: 'List incidents',
          description: 'Newest first. Without a `status` filter all incidents are returned, including resolved ones.',
          parameters: [...queryParameters(incidentListQuerySchema), prettyParam],
          responses: {
            '200': list('Incident', 'Paginated incidents'),
            '400': problemResponse('Invalid query parameters'),
          },
        },
      },
      '/incidents/{shortId}': {
        get: {
          tags: ['Incidents'],
          operationId: 'getIncident',
          summary: 'Get an incident',
          parameters: [shortIdParam, prettyParam],
          responses: {
            '200': single('Incident', 'Incident'),
            '404': problemResponse('Unknown shortId'),
          },
        },
      },
      '/maintenances': {
        get: {
          tags: ['Maintenances'],
          operationId: 'listMaintenances',
          summary: 'List maintenances',
          description: 'Use `status=active` for upcoming and in-progress maintenances (sorted by start time ascending). Without a filter all maintenances are returned, newest start first.',
          parameters: [...queryParameters(maintenanceListQuerySchema), prettyParam],
          responses: {
            '200': list('Maintenance', 'Paginated maintenances'),
            '400': problemResponse('Invalid query parameters'),
          },
        },
      },
      '/maintenances/{shortId}': {
        get: {
          tags: ['Maintenances'],
          operationId: 'getMaintenance',
          summary: 'Get a maintenance',
          parameters: [shortIdParam, prettyParam],
          responses: {
            '200': single('Maintenance', 'Maintenance'),
            '404': problemResponse('Unknown shortId'),
          },
        },
      },
      '/services': {
        get: {
          tags: ['Services'],
          operationId: 'listServices',
          summary: 'List services',
          description: 'All services with their current status and group, in display order.',
          parameters: [prettyParam],
          responses: { '200': list('Service', 'Services', false) },
        },
      },
    },
    components: { schemas: components() },
  }
}
