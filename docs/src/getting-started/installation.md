# Installation

Hostzero Status can be deployed in several ways. Choose the method that best fits your infrastructure.

## Prerequisites

- Docker and Docker Compose (recommended)
- OR Node.js 20+ and PostgreSQL 15+

## Deployment Options

### Option 1: Docker Compose (Recommended)

The easiest way to get started. See the [Docker Compose guide](docker-compose.md) for detailed instructions.

```bash
# Clone the repository
git clone https://github.com/Hostzero-GmbH/status-page.git
cd status-page

# Copy the example environment file
cp .env.example .env

# Edit the environment variables
nano .env

# Start the services
docker compose up -d
```

### Option 2: Pre-built Docker Image

Pull the latest image from GitHub Container Registry:

```bash
docker pull ghcr.io/hostzero-gmbh/status-page:latest
```

Run with your own PostgreSQL:

```bash
docker run -d \
  --name status-page \
  -p 3000:3000 \
  -e DATABASE_URI=postgres://user:pass@host:5432/db \
  -e PAYLOAD_SECRET=your-secret-key \
  -e NEXT_PUBLIC_SERVER_URL=https://status.example.com \
  ghcr.io/hostzero-gmbh/status-page:latest
```

### Option 3: Build from Source

```bash
# Clone the repository
git clone https://github.com/Hostzero-GmbH/status-page.git
cd status-page

# Install dependencies
npm install

# Build the application
npm run build

# Start the production server
npm start
```

## First-Time Setup

1. **Access the Admin Panel**
   
   Navigate to `http://your-server:3000/admin`

2. **Create Admin User**
   
   On first access, you'll be prompted to create an admin account.

3. **Configure Site Settings**
   
   Go to **Configuration → Site Settings** and configure:
   
   - Site Name
   - Site Description
   - Favicon
   - SMTP settings (for email notifications)
   - Twilio settings (for SMS notifications)

4. **Add Services**
   
   Create service groups and services that represent your infrastructure.

5. **Go Live**
   
   Your status page is now accessible at `http://your-server:3000`
