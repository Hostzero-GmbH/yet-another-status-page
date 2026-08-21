# Yet Another Status Page

A modern, self-hosted status page built with [Payload CMS](https://payloadcms.com/) and [Next.js](https://nextjs.org/).

## Features

- **Incident management** — track and communicate service disruptions
- **Scheduled maintenance** — plan and notify users about upcoming work
- **Email & SMS notifications** — automatic subscriber alerts via SMTP and Twilio
- **Service groups** — organize services into logical groups
- **Modern UI** — responsive status page with dark mode
- **Self-hosted** — full control over your data and infrastructure
- **Kubernetes-native** — official Helm chart with bundled Postgres, Ingress, NetworkPolicy, and PDB
- **Container-friendly** — multi-arch (amd64/arm64) image published to GHCR

## Quick Start

The recommended way to deploy is the [Helm chart](getting-started/helm.md) on Kubernetes:

```bash
kubectl create namespace status

helm upgrade --install status \
  oci://ghcr.io/hostzero-gmbh/charts/yet-another-status-page \
  --namespace status \
  --set serverUrl=https://status.example.com \
  --set secret.payloadSecret=$(openssl rand -hex 32)
```

After the rollout, the status page is reachable at `<serverUrl>` and the admin panel at `<serverUrl>/admin`.

For evaluation on a single host, see [Docker Compose](development/docker-compose.md). For local hacking, see [Local Setup](development/local-setup.md) (Dev Container).

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Yet Another Status Page                     │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js)          │  Admin Panel (Payload CMS)   │
│  - Status Page               │  - Manage Services           │
│  - Incident History          │  - Create Incidents          │
│  - Subscribe Form            │  - Schedule Maintenances     │
│                              │  - Send Notifications        │
├─────────────────────────────────────────────────────────────┤
│                     PostgreSQL Database                     │
└─────────────────────────────────────────────────────────────┘
```

## Documentation

- [Installation](getting-started/installation.md) — all deployment options
- [Helm](getting-started/helm.md) — recommended production deployment
- [Configuration](getting-started/configuration.md) — environment variables and admin settings
- [Admin Guide](admin/overview.md) — managing your status page
- [Notifications](admin/notifications.md) — the notification system
- [Local Setup](development/local-setup.md) — developing on the codebase
