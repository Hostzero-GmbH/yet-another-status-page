import { createHash } from 'node:crypto'
import type { z } from 'zod'
import type { PaginatedDocs } from 'payload'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Accept, If-None-Match',
  // ETag is not CORS-safelisted; without this browsers cannot do conditional requests cross-origin.
  'Access-Control-Expose-Headers': 'ETag',
  'Access-Control-Max-Age': '86400',
}

const CACHE_CONTROL = 'public, max-age=30, stale-while-revalidate=60'

export class ProblemError extends Error {
  constructor(
    public status: number,
    public title: string,
    public detail?: string,
  ) {
    super(detail ?? title)
  }
}

export function problem(status: number, title: string, detail?: string): Response {
  return new Response(
    JSON.stringify({ type: 'about:blank', title, status, ...(detail ? { detail } : {}) }),
    {
      status,
      headers: { 'Content-Type': 'application/problem+json', 'Cache-Control': 'no-store', ...CORS_HEADERS },
    },
  )
}

export function notFound(what: string, id: string): Response {
  return problem(404, 'Not Found', `No ${what} with id "${id}"`)
}

/** JSON response; `?pretty` indents the output. */
export function json(request: Request, body: unknown, contentType = 'application/json; charset=utf-8'): Response {
  const pretty = new URL(request.url).searchParams.has('pretty')
  return text(request, JSON.stringify(body, null, pretty ? 2 : undefined), contentType)
}

/** Text response with CORS, short public caching and ETag / 304 handling. */
export function text(request: Request, body: string, contentType: string, cacheControl = CACHE_CONTROL): Response {
  const etag = `W/"${createHash('sha1').update(body).digest('base64url')}"`
  const headers = {
    'Content-Type': contentType,
    'Cache-Control': cacheControl,
    ETag: etag,
    ...CORS_HEADERS,
  }
  const ifNoneMatch = (request.headers.get('if-none-match') ?? '').split(',').map((t) => t.trim())
  if (ifNoneMatch.includes(etag) || ifNoneMatch.includes('*')) {
    return new Response(null, { status: 304, headers })
  }
  return new Response(body, { status: 200, headers })
}

export function paginated<T>(request: Request, result: PaginatedDocs, data: T[]): Response {
  return json(request, {
    data,
    meta: {
      page: result.page ?? 1,
      limit: result.limit,
      total: result.totalDocs,
      totalPages: result.totalPages,
    },
  })
}

export function parseQuery<S extends z.ZodType>(request: Request, schema: S): z.infer<S> {
  const params = Object.fromEntries(new URL(request.url).searchParams.entries())
  const parsed = schema.safeParse(params)
  if (!parsed.success) {
    const detail = parsed.error.issues.map((i) => `${i.path.join('.') || 'query'}: ${i.message}`).join('; ')
    throw new ProblemError(400, 'Invalid query parameters', detail)
  }
  return parsed.data
}

/** Wraps a handler so thrown `ProblemError`s and unexpected errors become problem+json responses. */
export function handle<Args extends unknown[]>(fn: (request: Request, ...args: Args) => Promise<Response>) {
  return async (request: Request, ...args: Args): Promise<Response> => {
    try {
      return await fn(request, ...args)
    } catch (error) {
      if (error instanceof ProblemError) return problem(error.status, error.title, error.detail)
      console.error('[api/v1]', error)
      return problem(500, 'Internal Server Error')
    }
  }
}

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}
