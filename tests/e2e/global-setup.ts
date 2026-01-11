import { FullConfig } from '@playwright/test'

/**
 * Global setup for E2E tests
 * 
 * This runs once before all tests to verify the application is ready.
 * 
 * When using Docker (npm run test:e2e):
 * - Docker Compose starts the app and database
 * - Seed script populates test data
 * - This setup just verifies the app is responding
 * 
 * When using fast mode (npm run test:e2e:fast):
 * - Uses existing dev server
 * - No seeding (assumes data exists)
 */
async function globalSetup(config: FullConfig) {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 
    config.projects[0]?.use?.baseURL || 
    'http://localhost:3001'

  console.log(`\n🔧 E2E Test Setup`)
  console.log(`   Base URL: ${baseURL}`)

  // Wait for the app to be ready
  const maxRetries = 30
  let retries = 0
  let isReady = false

  while (retries < maxRetries && !isReady) {
    try {
      const response = await fetch(`${baseURL}/api/health`)
      if (response.ok) {
        isReady = true
        console.log(`   ✓ Application is ready`)
      }
    } catch (_error) {
      retries++
      if (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }

  if (!isReady) {
    throw new Error(`Application at ${baseURL} is not responding after ${maxRetries} attempts`)
  }

  console.log(`   ✓ Global setup complete\n`)
}

export default globalSetup
