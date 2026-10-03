# API Overview

Yet Another Status Page exposes three ways to consume status data programmatically. Pick the one that matches your use case:

| Use case | Use | Auth |
|----------|-----|------|
| Show current status, list incidents and maintenances in your own app, dashboard or bot | [Public API `/api/v1`](public-api.md) | none |
| Follow updates in a feed reader, Slack RSS app or calendar | [Feeds](feeds.md) (`/feed.atom`, `/maintenances.ics`) | none |
| Create or edit incidents, maintenances, services from CI or scripts | [Payload REST & GraphQL](payload-rest.md) | API key |

The public API and the feeds are read-only and form the stable integration surface. The Payload API mirrors the internal data model and may change between releases.

## OpenAPI document

Every instance serves its own OpenAPI 3.1 document at `https://your-status-page.com/api/v1/openapi.json`, with `servers` pointing at that instance. Use it with client generators, agents, or any OpenAPI viewer (for example paste the URL into [editor.swagger.io](https://editor.swagger.io)).

## Conventions (public API)

- **Versioning** — the path prefix `/api/v1` is a stability contract. Fields may be added; existing fields and their meaning do not change. Breaking changes ship under a new prefix.
- **Identifiers** — incidents and maintenances are addressed by their `shortId` (the same id used in permalinks `/i/<shortId>` and `/m/<shortId>`), services by `slug`. Internal numeric ids are not exposed.
- **Timestamps** — ISO 8601 in UTC, e.g. `2026-10-05T02:00:00.000Z`. Format them client-side.
- **Rich text** — exposed as `descriptionHtml` (escaped HTML) and `descriptionText`; the internal editor JSON is never returned.
- **Envelope** — single resources are returned as `{ "data": ... }`, lists as `{ "data": [...], "meta": { page, limit, total, totalPages } }`.
- **Caching** — responses carry `Cache-Control: public, max-age=30, stale-while-revalidate=60` and a weak `ETag`. Send `If-None-Match` to receive `304 Not Modified`.
- **CORS** — `Access-Control-Allow-Origin: *`, so browser apps can call the API directly.
- **Errors** — [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) problem details with `Content-Type: application/problem+json`:

  ```json
  { "type": "about:blank", "title": "Not Found", "status": 404, "detail": "No incident with id \"abc\"" }
  ```

- **Pretty printing** — add `?pretty` to any JSON endpoint.

## Rate limiting

The application does not rate limit read endpoints itself. Put your reverse proxy, ingress or CDN in front of `/api/v1`, `/feed.atom` and `/maintenances.ics` if you need limits; the short cache headers make these endpoints cheap to front with a CDN. The subscribe endpoint is limited to 5 attempts per IP per hour.
