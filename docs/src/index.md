# Hostzero Status

A modern, self-hosted status page built with [Payload CMS](https://payloadcms.com/) and [Next.js](https://nextjs.org/).

## Features

- 🚨 **Incident Management** - Track and communicate service disruptions
- 🔧 **Scheduled Maintenance** - Plan and notify users about upcoming maintenance
- 📧 **Email & SMS Notifications** - Automatic subscriber notifications via SMTP and Twilio
- 📊 **Service Groups** - Organize services into logical groups
- 🎨 **Beautiful UI** - Modern, responsive status page with dark mode support
- 🔒 **Self-Hosted** - Full control over your data and infrastructure
- 🐳 **Docker Ready** - Easy deployment with Docker and Docker Compose

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Hostzero-GmbH/status-page.git
cd status-page

# Start with Docker Compose
docker compose up -d
```

Visit `http://localhost:3000` to see your status page, and `http://localhost:3000/admin` to access the admin panel.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Hostzero Status                          │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js)          │  Admin Panel (Payload CMS)   │
│  - Status Page               │  - Manage Services           │
│  - Incident History          │  - Create Incidents          │
│  - Subscribe Form            │  - Schedule Maintenances     │
│                              │  - Send Notifications        │
├─────────────────────────────────────────────────────────────┤
│                     PostgreSQL Database                      │
└─────────────────────────────────────────────────────────────┘
```

## Documentation

- [Installation Guide](getting-started/installation.md) - Get started with Hostzero Status
- [Docker Compose Setup](getting-started/docker-compose.md) - Deploy with Docker
- [Admin Guide](admin/overview.md) - Learn how to manage your status page
- [Notification Workflow](admin/notifications.md) - Understand the notification system
