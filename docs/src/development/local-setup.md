# Local Development Setup

This guide explains how to set up Hostzero Status for local development.

## Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or Docker)
- npm or pnpm

## Quick Start with Docker

The easiest way to develop locally is using the included Docker Compose configuration.

```bash
# Clone the repository
git clone https://github.com/Hostzero-GmbH/status-page.git
cd status-page

# Start the development environment
docker compose -f docker-compose.dev.yml up -d postgres  # Start only the database

# Install dependencies
npm install

# Run database migrations
npm run payload migrate

# Start the development server
npm run dev
```

Visit:
- Status page: http://localhost:3333
- Admin panel: http://localhost:3333/admin

> **Note**: The dev compose file uses port 3333 to avoid conflicts with production on port 3000.

## Manual Setup

### 1. Install PostgreSQL

```bash
# macOS with Homebrew
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb hostzero_status
```

### 2. Clone and Install

```bash
git clone https://github.com/Hostzero-GmbH/status-page.git
cd status-page
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URI=postgres://localhost:5432/hostzero_status
PAYLOAD_SECRET=your-development-secret-key
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### 4. Run Migrations

```bash
npm run payload migrate
```

### 5. Start Development Server

```bash
npm run dev
```

## Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run payload migrate` | Run database migrations |
| `npm run payload generate:types` | Generate TypeScript types |
| `npm run payload generate:importmap` | Generate import map for custom components |

## Project Structure

```
status-page/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (frontend)/         # Public status pages
│   │   ├── (payload)/          # Admin panel
│   │   └── api/                # API routes
│   ├── collections/            # Payload CMS collections
│   ├── components/             # React components
│   │   ├── admin/              # Admin panel components
│   │   └── status/             # Status page components
│   ├── globals/                # Payload CMS globals
│   ├── lib/                    # Utility functions
│   └── tasks/                  # Background job handlers
├── public/                     # Static assets
├── payload.config.ts           # Payload CMS configuration
└── tailwind.config.ts          # Tailwind CSS configuration
```

## Making Changes

### Adding a Collection

1. Create a new file in `src/collections/`
2. Export the collection config
3. Import and add to `payload.config.ts`
4. Run `npm run payload generate:types`
5. Run migrations if needed

### Adding a Custom Admin Component

1. Create component in `src/components/admin/`
2. Reference it in the collection config
3. Run `npm run payload generate:importmap`

### Adding an API Endpoint

1. Create a route file in `src/app/api/`
2. Export GET, POST, etc. handlers

## Testing

```bash
# Type checking
npm run typecheck

# Build test
npm run build
```

## Debugging

### Database Issues

```bash
# Connect to database
psql $DATABASE_URI

# Reset database
dropdb hostzero_status && createdb hostzero_status
npm run payload migrate
```

### Clear Cache

```bash
rm -rf .next
npm run dev
```
