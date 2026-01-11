#!/usr/bin/env node
/**
 * Seed script for E2E test environment
 * Creates initial test data via the Payload REST API
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3001'

async function waitForApi(maxRetries = 30) {
  console.log('Waiting for API to be ready...')
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${API_BASE}/api/health`)
      if (response.ok) {
        console.log('✓ API is ready')
        return true
      }
    } catch (error) {
      // API not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  throw new Error('API failed to become ready')
}

async function createServiceGroup(data) {
  const response = await fetch(`${API_BASE}/api/service-groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create service group: ${error}`)
  }
  
  const result = await response.json()
  return result.doc
}

async function createService(data) {
  const response = await fetch(`${API_BASE}/api/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create service: ${error}`)
  }
  
  const result = await response.json()
  return result.doc
}

async function createIncident(data) {
  const response = await fetch(`${API_BASE}/api/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create incident: ${error}`)
  }
  
  const result = await response.json()
  return result.doc
}

async function createMaintenance(data) {
  const response = await fetch(`${API_BASE}/api/maintenances`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create maintenance: ${error}`)
  }
  
  const result = await response.json()
  return result.doc
}

async function seedData() {
  console.log('\n📦 Seeding test data...\n')

  // Create service groups
  console.log('Creating service groups...')
  const apiGroup = await createServiceGroup({
    name: 'API Services',
    slug: 'api-services',
  })
  console.log(`  ✓ Created: ${apiGroup.name}`)

  const webGroup = await createServiceGroup({
    name: 'Web Applications',
    slug: 'web-applications',
  })
  console.log(`  ✓ Created: ${webGroup.name}`)

  // Create services
  console.log('\nCreating services...')
  const restApi = await createService({
    name: 'REST API',
    slug: 'rest-api',
    status: 'operational',
    group: apiGroup.id,
  })
  console.log(`  ✓ Created: ${restApi.name}`)

  const graphqlApi = await createService({
    name: 'GraphQL API',
    slug: 'graphql-api',
    status: 'operational',
    group: apiGroup.id,
  })
  console.log(`  ✓ Created: ${graphqlApi.name}`)

  const dashboard = await createService({
    name: 'Dashboard',
    slug: 'dashboard',
    status: 'operational',
    group: webGroup.id,
  })
  console.log(`  ✓ Created: ${dashboard.name}`)

  // Create a resolved incident from yesterday
  console.log('\nCreating incidents...')
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const incident = await createIncident({
    title: 'API Latency Issues',
    updates: [
      {
        status: 'investigating',
        message: 'We are investigating increased latency on the API.',
        createdAt: new Date(yesterday.getTime()).toISOString(),
      },
      {
        status: 'identified',
        message: 'Root cause identified as database connection pool exhaustion.',
        createdAt: new Date(yesterday.getTime() + 30 * 60 * 1000).toISOString(),
      },
      {
        status: 'resolved',
        message: 'Connection pool settings have been optimized. All systems nominal.',
        createdAt: new Date(yesterday.getTime() + 60 * 60 * 1000).toISOString(),
      },
    ],
    affectedServices: [restApi.id],
  })
  console.log(`  ✓ Created: ${incident.title}`)

  // Create an upcoming maintenance
  console.log('\nCreating maintenances...')
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(2, 0, 0, 0)

  const tomorrowEnd = new Date(tomorrow)
  tomorrowEnd.setHours(4, 0, 0, 0)

  const maintenance = await createMaintenance({
    title: 'Database Migration',
    status: 'upcoming',
    scheduledStartAt: tomorrow.toISOString(),
    scheduledEndAt: tomorrowEnd.toISOString(),
    duration: '~2 hours',
    affectedServices: [restApi.id, graphqlApi.id],
  })
  console.log(`  ✓ Created: ${maintenance.title}`)

  console.log('\n✅ Test data seeded successfully!\n')
}

async function main() {
  try {
    await waitForApi()
    await seedData()
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message)
    process.exit(1)
  }
}

main()
