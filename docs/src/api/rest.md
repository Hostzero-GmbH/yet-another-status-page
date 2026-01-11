# REST API

Hostzero Status provides a REST API for programmatic access to status data.

## Base URL

```
https://your-status-page.com/api
```

## Authentication

Most read endpoints are public. Admin endpoints require authentication via:

- Session cookie (from admin login)
- API key header: `Authorization: Bearer <api-key>`

## Endpoints

### Incidents

#### List Incidents

```http
GET /api/incidents
```

Query parameters:

| Parameter | Description |
|-----------|-------------|
| `limit` | Number of results (default: 10) |
| `page` | Page number (default: 1) |
| `where[status][equals]` | Filter by status |

#### Get Incident

```http
GET /api/incidents/:id
```

### Maintenances

#### List Maintenances

```http
GET /api/maintenances
```

Query parameters same as incidents.

#### Get Maintenance

```http
GET /api/maintenances/:id
```

### Services

#### List Services

```http
GET /api/services
```

#### Get Service

```http
GET /api/services/:id
```

### Service Groups

#### List Service Groups

```http
GET /api/service-groups
```

#### Get Service Group

```http
GET /api/service-groups/:id
```

### Subscribers

#### Subscribe

```http
POST /api/subscribe
Content-Type: application/json

{
  "type": "email",
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Subscription successful"
}
```

#### Unsubscribe

```http
POST /api/unsubscribe
Content-Type: application/json

{
  "token": "unsubscribe-token"
}
```

## Payload REST API

The full Payload REST API is available at `/api`. See the [Payload documentation](https://payloadcms.com/docs/rest-api/overview) for complete details.

### Common Patterns

#### Filtering

```http
GET /api/incidents?where[status][equals]=investigating
```

#### Sorting

```http
GET /api/incidents?sort=-createdAt
```

#### Pagination

```http
GET /api/incidents?limit=10&page=2
```

#### Field Selection

```http
GET /api/incidents?select[title]=true&select[status]=true
```

## GraphQL

A GraphQL endpoint is available at:

```
POST /api/graphql
```

GraphQL Playground (development only):

```
GET /api/graphql-playground
```

## Rate Limiting

Public endpoints are rate limited to prevent abuse:

- 100 requests per minute per IP for read endpoints
- 10 requests per minute per IP for subscribe endpoint

## Error Responses

All errors follow this format:

```json
{
  "errors": [
    {
      "message": "Error description"
    }
  ]
}
```

Common HTTP status codes:

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad request |
| 401 | Unauthorized |
| 404 | Not found |
| 429 | Rate limited |
| 500 | Server error |
