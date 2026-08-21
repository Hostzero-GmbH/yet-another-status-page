# Docker Compose

Docker Compose is the easiest way to bring up the full stack on a single host without Kubernetes. It is intended for **local development, evaluation, and small self-hosted deployments**.

> **For production, use the [Helm chart](../getting-started/helm.md).** It handles upgrades, persistence, NetworkPolicy, PDB, Ingress + TLS, and external databases out of the box.

The repository ships three compose files:

| File | Purpose |
| --- | --- |
| `docker-compose.dev.yml` | Optional Compose-based hot-reload stack. Daily development uses the [Dev Container](./local-setup.md). |
| `docker-compose.test.yml` | E2E test environment used by CI. |
| `docker-compose.yml` | Pre-built image + Postgres for evaluation or single-host self-hosting. |

## Quick start (single-host)

```bash
git clone https://github.com/Hostzero-GmbH/yet-another-status-page.git
cd yet-another-status-page

cp .env.example .env
# Edit .env: set PAYLOAD_SECRET, POSTGRES_PASSWORD, SERVER_URL

docker compose up -d
```

Then visit:

- Status page: <http://localhost:3000>
- Admin panel: <http://localhost:3000/admin>

### `.env` keys

```env
DATABASE_URI=postgres://hostzero:${POSTGRES_PASSWORD}@db:5432/hostzero_status
POSTGRES_PASSWORD=change-me
PAYLOAD_SECRET=$(openssl rand -hex 32)
SERVER_URL=https://status.yourdomain.com
```

> Email (SMTP) and SMS (Twilio) are configured from **Configuration → Email/SMS Settings** in the admin panel, not via environment variables.

## Updating

```bash
docker compose pull
docker compose up -d
```

## Backup and restore

### Database

```bash
docker compose exec db pg_dump -U hostzero hostzero_status > backup.sql
cat backup.sql | docker compose exec -T db psql -U hostzero hostzero_status
```

### Uploads

```bash
docker compose cp app:/app/public/media ./media-backup
```

## Reverse proxy

Compose ships only the application container on port 3000. Terminate TLS with the proxy you already operate (nginx, Caddy, Traefik, etc.) and forward to `app:3000`. A typical Traefik label set:

```yaml
services:
  app:
    image: ghcr.io/hostzero-gmbh/yet-another-status-page:latest
    environment:
      - DATABASE_URI=${DATABASE_URI}
      - PAYLOAD_SECRET=${PAYLOAD_SECRET}
      - SERVER_URL=https://status.yourdomain.com
    labels:
      - traefik.enable=true
      - traefik.http.routers.status.rule=Host(`status.yourdomain.com`)
      - traefik.http.routers.status.entrypoints=websecure
      - traefik.http.routers.status.tls.certresolver=letsencrypt
      - traefik.http.services.status.loadbalancer.server.port=3000
```

For anything beyond a single host — multi-replica, rolling upgrades, autoscaling, secret management, NetworkPolicy — switch to the [Helm chart](../getting-started/helm.md).
