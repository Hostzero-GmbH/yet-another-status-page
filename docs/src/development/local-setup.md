# Local Development Setup

This guide explains how to set up Yet Another Status Page for local development.

## Prerequisites

- [Cursor](https://cursor.com/) or VS Code with the Dev Containers extension
- Docker (used only to run the Dev Container)

## Dev Container (recommended)

The repo includes a [Dev Container](https://containers.dev/) that provides Node.js 24 and PostgreSQL 16. You do not need Compose or a host Postgres install.

1. Clone the repository
2. Open the folder in Cursor or VS Code
3. Reopen in Container when prompted (or run **Dev Containers: Reopen in Container**)

On first create the container installs dependencies, creates the `hostzero_status` database, and runs migrations.

```bash
npm run dev
```

Visit:

- Status page: http://localhost:3000
- Admin panel: http://localhost:3000/admin

Environment defaults inside the container:

```env
DATABASE_URI=postgresql://postgres:postgres@127.0.0.1:5432/hostzero_status
PAYLOAD_SECRET=dev-secret-key-change-in-production
SERVER_URL=http://localhost:3000
```

A `.env` is created from `.env.example` if you do not already have one.

## Manual Setup

Use this if you prefer to run Node on the host.

### 1. Install PostgreSQL

```bash
# macOS with Homebrew
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb hostzero_status
```

Or run a throwaway Postgres container:

```bash
docker run -d --name yasp-postgres -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=hostzero_status \
  postgres:16-alpine
```

### 2. Clone and Install

```bash
git clone https://github.com/Hostzero-GmbH/yet-another-status-page.git
cd yet-another-status-page
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

```env
DATABASE_URI=postgresql://postgres:postgres@localhost:5432/hostzero_status
PAYLOAD_SECRET=your-development-secret-key
SERVER_URL=http://localhost:3000
```

### 4. Run Migrations

```bash
npx payload migrate
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
| `npx payload migrate` | Run database migrations |
| `npm run generate:types` | Generate TypeScript types |
| `npm run generate:importmap` | Generate import map for custom components |

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
4. Run `npm run generate:types`
5. Run migrations if needed

### Adding a Custom Admin Component

1. Create component in `src/components/admin/`
2. Reference it in the collection config
3. Run `npm run generate:importmap`

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
npx payload migrate
```

### Clear Cache

```bash
rm -rf .next
npm run dev
```
