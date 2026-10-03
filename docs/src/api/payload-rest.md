# Payload REST & GraphQL

The full [Payload CMS REST API](https://payloadcms.com/docs/rest-api/overview) and GraphQL endpoint are available under `/api`. Use them for automation that writes data: creating incidents from monitoring, posting updates from CI, managing services.

For reading status data prefer the [Public API](public-api.md). Payload responses mirror the internal data model (numeric ids, editor JSON for rich text, relationship depth semantics) and can change between releases.

## Base URL

```
https://your-status-page.com/api
```

## Authentication

Reads of the status collections (`services`, `service-groups`, `incidents`, `maintenances`) are public. All writes, and reads of `subscribers` and `users`, require authentication via:

- Session cookie (from admin login)
- API key (for scripts, CI and other non-interactive clients)

### API keys

API keys are per user and use Payload's built-in API key strategy. Requests authenticated with a key run as that user and inherit their access control.

1. Open **Admin → Users** and edit (or create) a user
2. Enable **Enable API Key**
3. Save, then copy the generated API key and treat it like a password

Prefer a dedicated service user with the minimum role you need (`editor` or `admin`) instead of reusing a personal account.

Send the case-sensitive `Authorization` header in this format:

```http
Authorization: users API-Key <your-api-key>
```

See also the [Payload API key docs](https://payloadcms.com/docs/authentication/api-keys).

## Examples

Create an incident:

```bash
curl -X POST https://your-status-page.com/api/incidents \
  -H "Authorization: users API-Key YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Elevated error rates",
    "affectedServices": [1],
    "updates": [
      { "status": "investigating", "message": "We are investigating elevated error rates." }
    ]
  }'
```

Post an update to an existing incident (the `updates` array is replaced, so send the full list):

```bash
curl -X PATCH https://your-status-page.com/api/incidents/42 \
  -H "Authorization: users API-Key YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      { "status": "investigating", "message": "We are investigating elevated error rates.", "createdAt": "2026-10-03T08:12:00.000Z" },
      { "status": "resolved", "message": "Error rates are back to normal." }
    ]
  }'
```

Schedule a maintenance:

```bash
curl -X POST https://your-status-page.com/api/maintenances \
  -H "Authorization: users API-Key YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Database upgrade",
    "scheduledStartAt": "2026-10-05T02:00:00Z",
    "scheduledEndAt": "2026-10-05T04:00:00Z",
    "affectedServices": [1]
  }'
```

Set a service status:

```bash
curl -X PATCH https://your-status-page.com/api/services/1 \
  -H "Authorization: users API-Key YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "status": "degraded" }'
```

## Query syntax

Payload collections support filtering, sorting, pagination and field selection:

```http
GET /api/incidents?where[status][equals]=investigating
GET /api/incidents?sort=-createdAt
GET /api/incidents?limit=10&page=2
GET /api/incidents?select[title]=true&select[status]=true
```

See the [Payload query docs](https://payloadcms.com/docs/queries/overview) for all operators.

## Subscription endpoints

Custom endpoints used by the status page's subscribe dialog. They are public and limited to 5 subscription attempts per IP per hour.

```http
POST /api/subscribe
Content-Type: application/json

{ "type": "email", "email": "user@example.com" }
```

```http
POST /api/unsubscribe
Content-Type: application/json

{ "token": "unsubscribe-token" }
```

## GraphQL

```
POST /api/graphql
```

GraphQL Playground (development only): `GET /api/graphql-playground`.

## Error responses

Payload errors follow this format:

```json
{ "errors": [ { "message": "Error description" } ] }
```

| Code | Description |
|------|-------------|
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Not allowed |
| 404 | Not found |
| 429 | Rate limited (subscribe endpoint) |
| 500 | Server error |
