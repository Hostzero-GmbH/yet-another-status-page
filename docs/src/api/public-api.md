# Public API (`/api/v1`)

Read-only, unauthenticated JSON API. See [Overview](overview.md) for conventions shared by all endpoints; every instance serves its OpenAPI document at `/api/v1/openapi.json`.

Base URL:

```
https://your-status-page.com/api/v1
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/status` | Overall status, services by group, unresolved incidents, upcoming and in-progress maintenances |
| GET | `/incidents` | List incidents (paginated, newest first) |
| GET | `/incidents/{shortId}` | Single incident |
| GET | `/maintenances` | List maintenances (paginated) |
| GET | `/maintenances/{shortId}` | Single maintenance |
| GET | `/services` | All services with status and group |

### `GET /status`

One call for "what is going on right now". Suited for badges, dashboards and bots.

```bash
curl https://your-status-page.com/api/v1/status?pretty
```

```json
{
  "data": {
    "status": "degraded",
    "message": null,
    "siteName": "Example",
    "serviceGroups": [
      {
        "slug": "core",
        "name": "Core",
        "description": null,
        "status": "degraded",
        "services": [
          { "slug": "api", "name": "API", "description": null, "status": "degraded", "updatedAt": "2026-10-03T08:12:00.000Z" }
        ]
      }
    ],
    "activeIncidents": [ { "shortId": "k3j9x2ab", "title": "Elevated API latency", "status": "monitoring", "...": "..." } ],
    "activeMaintenances": [ { "shortId": "m8s0qz1p", "title": "Database upgrade", "status": "upcoming", "...": "..." } ]
  }
}
```

`status` is the worst status of any service (`major` > `partial` > `degraded` > `maintenance` > `operational`), or `maintenance` when the operator enabled maintenance mode.

### `GET /incidents`

| Parameter | Values | Description |
|-----------|--------|-------------|
| `status` | `active`, `resolved`, `investigating`, `identified`, `monitoring` | `active` = everything except `resolved` |
| `service` | service slug | Only incidents affecting this service |
| `from`, `to` | ISO 8601 | Created within this window |
| `page`, `limit` | integers, `limit` ≤ 100 | Pagination (defaults `1`, `25`) |

```bash
# Unresolved incidents affecting the API
curl "https://your-status-page.com/api/v1/incidents?status=active&service=api"
```

Incident shape:

```json
{
  "shortId": "k3j9x2ab",
  "title": "Elevated API latency",
  "status": "monitoring",
  "url": "https://your-status-page.com/i/k3j9x2ab",
  "affectedServices": [ { "slug": "api", "name": "API" } ],
  "updates": [
    { "status": "monitoring", "message": "A fix has been deployed.", "createdAt": "2026-10-03T08:40:00.000Z" },
    { "status": "investigating", "message": "We are investigating.", "createdAt": "2026-10-03T08:12:00.000Z" }
  ],
  "createdAt": "2026-10-03T08:12:00.000Z",
  "updatedAt": "2026-10-03T08:40:00.000Z",
  "resolvedAt": null
}
```

`updates` are ordered newest first; `status` always equals the status of the newest update.

### `GET /maintenances`

| Parameter | Values | Description |
|-----------|--------|-------------|
| `status` | `active`, `upcoming`, `in_progress`, `completed`, `cancelled` | `active` = `upcoming` + `in_progress` |
| `service` | service slug | Only maintenances affecting this service |
| `from` | ISO 8601 | Maintenances that end (or start) at or after this time |
| `to` | ISO 8601 | Maintenances that start at or before this time |
| `page`, `limit` | integers, `limit` ≤ 100 | Pagination (defaults `1`, `25`) |

Active and upcoming lists are sorted by start time ascending; all other lists newest start first.

```bash
# Upcoming and ongoing maintenances
curl "https://your-status-page.com/api/v1/maintenances?status=active"

# Everything touching the next 7 days
curl "https://your-status-page.com/api/v1/maintenances?from=2026-10-03T00:00:00Z&to=2026-10-10T00:00:00Z"
```

Maintenance shape:

```json
{
  "shortId": "m8s0qz1p",
  "title": "Database upgrade",
  "status": "upcoming",
  "url": "https://your-status-page.com/m/m8s0qz1p",
  "descriptionHtml": "<p>We are upgrading to <strong>PostgreSQL 17</strong>.</p>",
  "descriptionText": "We are upgrading to PostgreSQL 17.",
  "scheduledStartAt": "2026-10-05T02:00:00.000Z",
  "scheduledEndAt": "2026-10-05T04:00:00.000Z",
  "duration": "~2 hours",
  "affectedServices": [ { "slug": "api", "name": "API" } ],
  "updates": [],
  "createdAt": "2026-10-01T09:00:00.000Z",
  "updatedAt": "2026-10-01T09:00:00.000Z",
  "completedAt": null,
  "cancelledAt": null
}
```

### `GET /services`

```json
{
  "data": [
    { "slug": "api", "name": "API", "description": null, "status": "operational", "group": { "slug": "core", "name": "Core" }, "updatedAt": "2026-10-03T08:12:00.000Z" }
  ]
}
```

## Examples

JavaScript, polling with conditional requests:

```js
let etag
async function poll() {
  const res = await fetch('https://your-status-page.com/api/v1/status', {
    headers: etag ? { 'If-None-Match': etag } : {},
  })
  if (res.status === 304) return
  etag = res.headers.get('ETag')
  const { data } = await res.json()
  console.log(data.status, data.activeIncidents.length)
}
setInterval(poll, 60_000)
```

Shell, next maintenance window:

```bash
curl -s "https://your-status-page.com/api/v1/maintenances?status=active&limit=1" \
  | jq -r '.data[0] | "\(.title): \(.scheduledStartAt) – \(.scheduledEndAt // "open end")"'
```

Generate a typed client from the spec:

```bash
npx openapi-typescript https://your-status-page.com/api/v1/openapi.json -o status-api.d.ts
```
