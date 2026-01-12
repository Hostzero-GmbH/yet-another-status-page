# Docker Compose Setup

This guide explains how to deploy Hostzero Status using Docker Compose.

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Hostzero-GmbH/status-page.git
cd status-page
```

### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URI=postgres://hostzero:your-secure-password@db:5432/hostzero_status
POSTGRES_PASSWORD=your-secure-password

# Security
PAYLOAD_SECRET=your-32-character-secret-key-here

# URLs
SERVER_URL=https://status.yourdomain.com
```

> **Note**: Email (SMTP) and SMS (Twilio) settings are configured via the admin panel under **Configuration → Email Settings** and **Configuration → SMS Settings**, not through environment variables.

### 3. Start the Services

```bash
docker compose up -d
```

### 4. Access the Application

- **Status Page**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

## Docker Compose File

Create a `docker-compose.yml` in your project root:

```yaml
version: '3.8'

services:
  app:
    image: ghcr.io/hostzero-gmbh/status-page:latest
    # Or build from source:
    # build:
    #   context: ./cms
    #   dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URI=${DATABASE_URI}
      - PAYLOAD_SECRET=${PAYLOAD_SECRET}
      - SERVER_URL=${SERVER_URL}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    volumes:
      - uploads:/app/public/media

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=hostzero
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=hostzero_status
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hostzero -d hostzero_status"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
  uploads:
```

## Production Deployment

### With Traefik (Recommended)

```yaml
version: '3.8'

services:
  app:
    image: ghcr.io/hostzero-gmbh/status-page:latest
    environment:
      - DATABASE_URI=${DATABASE_URI}
      - PAYLOAD_SECRET=${PAYLOAD_SECRET}
      - SERVER_URL=https://status.yourdomain.com
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    volumes:
      - uploads:/app/public/media
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.status.rule=Host(`status.yourdomain.com`)"
      - "traefik.http.routers.status.entrypoints=websecure"
      - "traefik.http.routers.status.tls.certresolver=letsencrypt"
      - "traefik.http.services.status.loadbalancer.server.port=3000"
    networks:
      - traefik
      - internal

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=hostzero
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=hostzero_status
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hostzero -d hostzero_status"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - internal

volumes:
  postgres_data:
  uploads:

networks:
  traefik:
    external: true
  internal:
```

### With nginx

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - app
    restart: unless-stopped

  app:
    image: ghcr.io/hostzero-gmbh/status-page:latest
    environment:
      - DATABASE_URI=${DATABASE_URI}
      - PAYLOAD_SECRET=${PAYLOAD_SECRET}
      - SERVER_URL=https://status.yourdomain.com
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    volumes:
      - uploads:/app/public/media

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=hostzero
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=hostzero_status
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hostzero -d hostzero_status"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
  uploads:
```

## Updating

To update to the latest version:

```bash
# Pull the latest image
docker compose pull

# Restart with the new image
docker compose up -d
```

## Backup & Restore

### Backup Database

```bash
docker compose exec db pg_dump -U hostzero hostzero_status > backup.sql
```

### Restore Database

```bash
cat backup.sql | docker compose exec -T db psql -U hostzero hostzero_status
```

### Backup Uploads

```bash
docker compose cp app:/app/public/media ./media-backup
```
