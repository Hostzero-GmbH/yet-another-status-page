# Architecture

Hostzero Status is built with modern technologies for reliability and developer experience.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 15 (App Router) |
| CMS | Payload CMS 3.x |
| Database | PostgreSQL |
| Styling | Tailwind CSS |
| Rich Text | Lexical Editor |

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                               │
│  (Browsers, API Consumers, Email Clients, SMS)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Status Pages   │  │   Admin Panel   │  │  REST API   │ │
│  │  (Frontend)     │  │  (Payload CMS)  │  │  Endpoints  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      Payload CMS Core                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Collections │  │   Globals   │  │    Jobs Queue       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  ┌─────────────────┐           ┌─────────────────┐         │
│  │   SMTP Server   │           │     Twilio      │         │
│  │   (Email)       │           │     (SMS)       │         │
│  └─────────────────┘           └─────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Data Model

### Collections

```
┌─────────────────┐     ┌─────────────────┐
│  ServiceGroups  │────▶│    Services     │
│  - name         │     │  - name         │
│  - description  │     │  - status       │
│  - order        │     │  - group        │
└─────────────────┘     └─────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
           ┌─────────────────┐  ┌─────────────────┐
           │   Incidents     │  │  Maintenances   │
           │  - title        │  │  - title        │
           │  - status       │  │  - status       │
           │  - impact       │  │  - schedule     │
           │  - updates[]    │  │  - updates[]    │
           └─────────────────┘  └─────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              ▼
                    ┌─────────────────┐
                    │  Notifications  │
                    │  - title        │
                    │  - channel      │
                    │  - status       │
                    │  - content      │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Subscribers   │
                    │  - type         │
                    │  - email/phone  │
                    │  - active       │
                    └─────────────────┘
```

### Globals

- **Settings** - Site configuration, SMTP, Twilio credentials

## Request Flow

### Status Page Request

```
Browser → Next.js → Server Component → Payload API → PostgreSQL
                          ↓
                    Rendered HTML
```

### Admin Panel Request

```
Browser → Next.js → Payload Admin → Payload API → PostgreSQL
                          ↓
                    React SPA
```

### Notification Flow

```
Save Incident → afterChange Hook → Create Notification Draft
                                          ↓
                              Admin Reviews Draft
                                          ↓
                              Click "Send Now"
                                          ↓
                              API Queues Job
                                          ↓
                              Jobs Queue Processes
                                          ↓
                              SMTP/Twilio Sends
                                          ↓
                              Update Notification Status
```

## Key Design Decisions

### Why Payload CMS?

- Modern, TypeScript-first CMS
- Excellent admin UI out of the box
- Flexible data modeling
- Built-in authentication
- Jobs queue for background tasks

### Why Next.js App Router?

- Server components for performance
- Streaming and suspense support
- Built-in API routes
- Excellent developer experience

### Why PostgreSQL?

- Robust and reliable
- Excellent JSON support
- Widely supported
- Easy to backup and scale

### Why Separate Notifications Collection?

- Audit trail of all notifications
- Review before sending
- Retry failed notifications
- Clear status tracking

## Scaling Considerations

### Horizontal Scaling

- Application is stateless
- Can run multiple instances behind load balancer
- Shared PostgreSQL database

### Database

- Connection pooling (PgBouncer)
- Read replicas for high traffic
- Regular backups

### Jobs Queue

- Can add dedicated worker processes
- Automatic retries on failure
- Scales with subscriber count
