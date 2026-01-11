# Testing Guide

This directory contains the test suite for Hostzero Status.

## E2E Tests (Playwright)

End-to-end tests using Playwright to test the full application.

### Test Environment Architecture

Tests run in an **isolated Docker environment** to ensure:
- ✅ Clean database for each test run
- ✅ No interference with development data
- ✅ Consistent, reproducible results

```
┌─────────────────────────────────────────────────────────────┐
│                    Test Environment                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   App       │───▶│  Postgres   │    │  Playwright │      │
│  │  :3001      │    │   (fresh)   │    │   Tests     │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Prerequisites

1. **Docker** - Required for the isolated test environment
2. **Node.js 20+** - For running Playwright

### Setup

Install Playwright browsers (first time only):

```bash
npm install
npx playwright install chromium
```

### Running Tests

```bash
# Run all E2E tests in isolated Docker environment (recommended)
npm run test:e2e

# Run with browser visible
npm run test:e2e:headed

# Run in debug mode (step through tests)
npm run test:e2e:debug

# Run with Playwright UI (interactive mode)
npm run test:e2e:ui

# View last test report
npm run test:e2e:report
```

### How the Test Runner Works

When you run `npm run test:e2e`:

1. **Docker Compose** starts:
   - Fresh PostgreSQL database (no persistent data)
   - Application in development mode (auto-creates schema)
   - Environment variable `PAYLOAD_PUBLIC_ALLOW_WRITES=true` for test access

2. **Seed Script** runs to create test data:
   - Service groups and services
   - Sample incidents and maintenances
   
3. **Playwright** executes tests against `http://localhost:3001`

4. **Cleanup** - All Docker containers and volumes are removed

### Fast Mode (Development)

For quick iteration during test development, you can run tests against an existing dev server:

```bash
# Start your dev server first
docker compose -f docker-compose.dev.yml up -d

# Run tests without Docker isolation
npm run test:e2e:fast
```

⚠️ **Warning**: Fast mode uses your dev database and may leave test data behind.

### Writing Tests

Tests are located in `tests/e2e/`. Each test file covers a specific feature:

```
tests/
├── e2e/
│   ├── status-page.spec.ts      # Main status page (9 tests)
│   ├── incident-page.spec.ts    # Incident detail pages (7 tests)
│   ├── maintenance-page.spec.ts # Maintenance pages (7 tests)
│   ├── subscribe.spec.ts        # Subscription flows (10 tests)
│   ├── theme-toggle.spec.ts     # Dark/light mode (5 tests)
│   ├── history-page.spec.ts     # Incident history (6 tests)
│   ├── admin.spec.ts            # Admin panel (skipped - slow to compile)
│   └── api.spec.ts              # API endpoints (7 tests)
├── seed/
│   └── seed-test-data.mjs       # Test data seeding
└── utils/
    └── payload-helpers.ts       # API helpers for tests
```

**Total: 52 passing tests, 2 skipped**

### Creating Test Data

Use the Payload REST API helpers in your tests:

```typescript
import { 
  createServiceGroup, 
  createService,
  createIncident 
} from '../utils/payload-helpers'

test('my test', async ({ page }) => {
  // Create test data
  const group = await createServiceGroup({ name: 'Test Group' })
  const service = await createService({ 
    name: 'Test Service', 
    group: group.id 
  })
  
  // Use the data in your test
  await page.goto('/')
  await expect(page.getByText('Test Service')).toBeVisible()
})
```

### CI/CD Integration

The GitHub Actions workflow (`.github/workflows/e2e-tests.yml`) runs tests automatically on:
- Push to `main`
- Pull requests to `main`

Test artifacts (reports, screenshots) are uploaded on failure for debugging.

### Debugging Failed Tests

1. **View the test report**:
   ```bash
   npm run test:e2e:report
   ```

2. **Run in debug mode**:
   ```bash
   npm run test:e2e:debug
   ```

3. **Check test artifacts**:
   - Screenshots are saved in `test-results/`
   - HTML report in `playwright-report/`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PLAYWRIGHT_BASE_URL` | Application URL | `http://localhost:3001` |
| `PAYLOAD_PUBLIC_ALLOW_WRITES` | Allow unauthenticated writes | `false` |
| `CI` | Disable webServer reuse | (unset) |
