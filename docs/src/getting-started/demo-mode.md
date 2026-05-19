# Demo Mode - Complete Guide

A fully functional live demo system for YASP that allows users to try all features with automatic hourly database resets.

**⚠️ CRITICAL WARNING:** Demo mode is DESTRUCTIVE. It will permanently delete all application data at regular intervals. Only use on a dedicated/disposable database. NEVER enable on production or any database containing data you want to keep.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Overview](#overview)
- [Setup](#setup)
- [Features](#features)
- [Demo Data](#demo-data)
- [Configuration](#configuration)
- [Manual Operations](#manual-operations)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Monitoring](#monitoring)

---

## Quick Start

Get your live demo running in 5 minutes!

### 1. Create `.env` file

```bash
cp .env.example .env
```

Add these lines to `.env`:

**⚠️ WARNING:** Only enable demo mode on a disposable database!

```bash
DEMO_MODE=true
DEMO_USER_EMAIL=demo@yasp.io
DEMO_USER_PASSWORD=demo2026#
DEMO_RESET_INTERVAL_MINUTES=60
```

### 2. Start with Docker (Recommended)

```bash
docker compose -f docker-compose.demo.yml up -d
```

Wait ~2 minutes for the first reset to complete, then access:

- **Status Page**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
  - Email: `demo@yasp.io`
  - Password: `demo2026#`

### 3. OR Start Locally

```bash
# Install dependencies
npm install

# Start the app with demo mode enabled
DEMO_MODE=true npm run dev
```

When `DEMO_MODE=true`, the app will seed the database and schedule
automatic resets on startup. There is no separate scheduler process to run.

To trigger a manual reseed at any time (useful in development):

```bash
npm run demo:seed
```

---

## Overview

**⚠️ IMPORTANT:** Demo mode will delete all data in the database periodically. Use only on dedicated demo infrastructure.

Demo Mode allows you to run a fully functional live demo of YASP where users can:

✅ **Try all features** - Create incidents, services, maintenance, send notifications  
✅ **Explore the admin panel** - Full access to all CMS features  
✅ **Test the workflow** - Experience the complete status page lifecycle  
❌ **Cannot change password** - Demo user password is protected  
🔄 **Auto-reset** - Database resets to demo state every hour (configurable)

### What You Get

**Demo Banner**
- Purple banner at the top showing:
  - Live demo indicator
  - Countdown to next reset
  - Password change disabled notice

**Sample Data**
- **6 Services** across 3 groups
- **3 Incidents** (resolved, ongoing, old)
- **2 Scheduled Maintenances**
- **2 Subscribers**

**Full Features**
- ✅ Create/edit/delete incidents
- ✅ Manage services and groups
- ✅ Schedule maintenance
- ✅ Send notifications (draft mode)
- ✅ Manage subscribers
- ❌ Cannot change demo user password
- 🔄 Resets every hour

---

## Setup

### Environment Variables

Add these variables to your `.env` file:

```bash
# Enable demo mode
DEMO_MODE=true

# Demo user credentials (users will use these to login)
DEMO_USER_EMAIL=demo@yasp.io
DEMO_USER_PASSWORD=demo2026#

# Reset interval in minutes (default: 60)
DEMO_RESET_INTERVAL_MINUTES=60
```

### Initial Seed

Seed the database with demo data:

```bash
npm run demo:seed
```

This creates:
- Demo user account
- 3 service groups (API Services, Infrastructure, Web Applications)
- 6 services with various statuses
- 3 sample incidents (resolved, ongoing, old)
- 2 scheduled maintenances
- 2 sample subscribers
- Configured settings

### Automatic Reset Scheduling

When `DEMO_MODE=true`, the app schedules automatic resets in-process on
startup (via Payload's `onInit` hook). It will:

- Reseed the database immediately on first boot
- Schedule recurring resets at `DEMO_RESET_INTERVAL_MINUTES` (default 60)
- Log each reset operation to the app's stdout
- Run for the lifetime of the app container

No separate scheduler container or process is required.

### Docker Deployment

For Docker-based demo deployments, use the shipped `docker-compose.demo.yml`
(at the repo root), which sets `DEMO_MODE=true` and the related env vars on
the single `app` container:

```bash
docker compose -f docker-compose.demo.yml up -d
```

---

## Features

### Demo Banner

When demo mode is enabled, a purple gradient banner appears at the top of the admin panel showing:
- "Live Demo Mode" indicator
- Real-time countdown timer until next reset
- Reminder that password changes are disabled

The banner:
- Updates every second
- Responsive design
- Smooth animations
- Auto-hides when demo mode is disabled

### Password Protection

The demo user's password cannot be changed through the admin panel. Any attempts to change it are silently blocked using Payload CMS hooks.

**Implementation:**
```typescript
// src/collections/Users.ts
hooks: {
  beforeChange: [
    ({ data, req, operation }) => {
      if (isDemoMode() && data?.email === getDemoUserEmail()) {
        if (data.password && operation === 'update') {
          delete data.password  // Block password changes
        }
      }
      return data
    },
  ],
}
```

### Database Reset

The reset process:
1. Clears all user-generated data (incidents, services, etc.)
2. Preserves the demo user account
3. Re-seeds with fresh demo data
4. Logs the operation with timestamp

**Reset Logs:**
```
🔄 Starting scheduled demo reset...
⏰ Reset time: 2026-03-02T10:00:00.000Z
🗑️  Clearing existing data...
👤 Creating demo user...
⚙️  Updating settings...
📁 Creating service groups...
🔧 Creating services...
🚨 Creating sample incidents...
🔧 Creating scheduled maintenance...
📧 Creating sample subscribers...
✅ Demo reset completed successfully!
📅 Next reset: 2026-03-02T11:00:00.000Z
```

---

## Demo Data

### Service Groups
- **API Services** - Core API endpoints
- **Infrastructure** - Hosting and infrastructure
- **Web Applications** - Frontend apps

### Services

| Service | Status | Group |
|---------|--------|-------|
| REST API | ✅ Operational | API Services |
| GraphQL API | ✅ Operational | API Services |
| Authentication | ⚠️ Degraded | API Services |
| Database | ✅ Operational | Infrastructure |
| CDN | ✅ Operational | Infrastructure |
| Web Dashboard | ✅ Operational | Web Applications |

### Incidents

**1. API Gateway Latency Issues** (Resolved, 3 hours ago)
- Status progression: Investigating → Identified → Monitoring → Resolved
- Affected: REST API, GraphQL API
- Timeline with 4 updates showing the resolution process

**2. Authentication Service Degraded Performance** (Ongoing, 30 minutes ago)
- Status progression: Investigating → Identified
- Affected: Authentication
- Active incident showing current investigation

**3. CDN Cache Invalidation Delay** (Resolved, 2 days ago)
- Status progression: Investigating → Resolved
- Affected: CDN
- Historical incident for reference

### Scheduled Maintenance

**1. Database Cluster Upgrade** (7 days from now)
- Duration: ~2 hours
- Affected: Database, REST API, GraphQL API
- Description: PostgreSQL upgrade for improved performance

**2. CDN Configuration Update** (3 days from now)
- Duration: ~30 minutes
- Affected: CDN, Web Dashboard
- Description: CDN configuration improvements

### Subscribers
- **Email subscriber**: user1@example.com (verified)
- **SMS subscriber**: +1234567890 (verified)

---

## Configuration

### NPM Scripts

```bash
npm run demo:seed        # Seed database with demo data
npm run demo:reset       # Manually reset database
```

When the app runs with `DEMO_MODE=true`, recurring resets are scheduled
automatically inside the app process. The scripts above are only needed
for manual one-off operations (e.g. local development).

### Change Reset Interval

Modify `DEMO_RESET_INTERVAL_MINUTES` to change how often the database resets:

```bash
# Reset every 30 minutes
DEMO_RESET_INTERVAL_MINUTES=30

# Reset every 2 hours
DEMO_RESET_INTERVAL_MINUTES=120

# Reset every 24 hours
DEMO_RESET_INTERVAL_MINUTES=1440
```

### Change Demo Credentials

```bash
DEMO_USER_EMAIL=admin@example.com
DEMO_USER_PASSWORD=SecureDemo123!
```

### Customize Demo Data

Edit `scripts/seed-demo-data.ts` to customize:
- Service names and statuses
- Incident content and timelines
- Maintenance schedules
- Site settings and branding
- Subscriber data

### Customize Demo Banner

Edit `src/components/admin/DemoBanner.tsx` and `DemoBanner.scss` to change:
- Banner appearance and colors
- Message content
- Timer display format
- Animation styles

---

## Manual Operations

### Manual Reset

Reset the database manually at any time:

```bash
npm run demo:reset
```

Or via Docker:
```bash
docker compose exec app npm run demo:reset
```

### Seed Only

Seed demo data without clearing existing data:

```bash
npm run demo:seed
```

### Check Demo Status

```bash
curl http://localhost:3000/api/demo-status
```

**Response:**
```json
{
  "isDemoMode": true,
  "timeUntilReset": "45m 23s",
  "resetIntervalMinutes": 60
}
```

---

## Production Deployment


### Docker

Use the provided `docker-compose.demo.yml`:

```bash
# Start
docker compose -f docker-compose.demo.yml up -d

# View logs (reset operations log to the app container)
docker compose -f docker-compose.demo.yml logs -f app

# Stop
docker compose -f docker-compose.demo.yml down
```

### Kubernetes / Helm

Enable demo mode by setting `DEMO_MODE=true` (and the related env vars)
on the main app deployment - no second deployment is needed. With the
shipped Helm chart, this can be done via the `demo.*` values:

```yaml
demo:
  enabled: true
  userEmail: demo@yasp.io
  userPassword: demo2026#
  resetIntervalMinutes: 60
```

---

## Troubleshooting

### Banner Not Showing

**Symptoms:** Demo banner doesn't appear in admin panel

**Solutions:**
1. Verify `DEMO_MODE=true` in environment:
   ```bash
   echo $DEMO_MODE  # Should output: true
   ```

2. Check API endpoint returns correct data:
   ```bash
   curl http://localhost:3000/api/demo-status
   ```

3. Clear browser cache and hard refresh:
   - Mac: `Cmd+Shift+R`
   - Windows: `Ctrl+Shift+R`

4. Restart the application

### Auto-Reset Not Running

**Symptoms:** Database doesn't reset automatically

**Solutions:**
1. Check the app logs for the demo scheduler startup message:
   ```bash
   docker compose -f docker-compose.demo.yml logs app | grep -i demo
   ```
   You should see `Demo mode scheduler initialized` near startup.

2. Verify `DEMO_MODE=true` is set on the running container:
   ```bash
   docker compose -f docker-compose.demo.yml exec app printenv DEMO_MODE
   ```

3. Trigger a one-off reset to confirm the seed logic works:
   ```bash
   docker compose -f docker-compose.demo.yml exec app npm run demo:reset
   ```

### Reset Not Working

**Symptoms:** Manual reset fails or doesn't complete

**Solutions:**
1. Manually trigger a reset:
   ```bash
   npm run demo:reset
   ```

2. Check database connection:
   ```bash
   docker compose exec db psql -U hostzero -d hostzero_status -c "SELECT COUNT(*) FROM incidents;"
   ```

3. Verify database permissions

4. Check disk space

### Password Still Changeable

**Symptoms:** Demo user can change password

**Solutions:**
1. Verify demo mode is enabled:
   ```bash
   echo $DEMO_MODE
   ```

2. Check user email matches `DEMO_USER_EMAIL`:
   ```bash
   echo $DEMO_USER_EMAIL
   ```

3. Review server logs for hook execution:
   ```bash
   docker compose logs app | grep "Demo Mode"
   ```

4. Restart the application

### Can't Login

**Symptoms:** Unable to login with demo credentials

**Solutions:**
1. Verify credentials match `.env` file:
   ```bash
   echo $DEMO_USER_EMAIL
   echo $DEMO_USER_PASSWORD
   ```

2. Check database is running:
   ```bash
   docker compose ps db
   ```

3. Reset database:
   ```bash
   npm run demo:reset
   ```

4. Check for user in database:
   ```bash
   docker compose exec db psql -U hostzero -d hostzero_status -c "SELECT email FROM users;"
   ```

---

## Security

### Public Demo Considerations

For public-facing demos:

**Required:**
- ✅ Use a strong `PAYLOAD_SECRET` (32+ characters)
- ✅ Don't expose sensitive data in demo content
- ✅ Monitor resource usage and costs
- ✅ Set reasonable reset intervals (30-60 minutes)



---

## Monitoring

### Logs

The scheduler logs each reset operation:

```
🔄 Starting scheduled demo reset...
⏰ Reset time: 2026-03-02T10:00:00.000Z
🗑️  Clearing existing data...
👤 Creating demo user...
⚙️  Updating settings...
📁 Creating service groups...
🔧 Creating services...
🚨 Creating sample incidents...
🔧 Creating scheduled maintenance...
📧 Creating sample subscribers...
✅ Demo reset completed successfully!
📅 Next reset: 2026-03-02T11:00:00.000Z
```

**View logs:**
```bash
# Docker
docker compose -f docker-compose.demo.yml logs -f app

# Local
# Check the terminal where the app (`npm run dev` with DEMO_MODE=true)
# is running.
```


---

## API Reference

### Demo Status Endpoint

**Endpoint:** `GET /api/demo-status`

**Description:** Returns current demo mode status and reset information

**Response:**
```json
{
  "isDemoMode": true,
  "timeUntilReset": "45m 23s",
  "resetIntervalMinutes": 60
}
```

**Example:**
```bash
curl http://localhost:3000/api/demo-status
```

---

## Support

### Documentation
- [Full Documentation](https://hostzero-gmbh.github.io/yet-another-status-page)
- [Contributing Guide](https://github.com/Hostzero-GmbH/yet-another-status-page/blob/main/CONTRIBUTING.md)

### Community
- 🐛 [Report Issues](https://github.com/Hostzero-GmbH/yet-another-status-page/issues)
- 💬 [Discussions](https://github.com/Hostzero-GmbH/yet-another-status-page/discussions)
- ⭐ [GitHub Repository](https://github.com/Hostzero-GmbH/yet-another-status-page)

### Need Help?

1. Check this documentation
2. Search existing GitHub issues
3. Ask in GitHub Discussions
4. Create a new issue with details

---

