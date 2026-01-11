/**
 * Payload API helpers for E2E test data management
 * 
 * These helpers use the Payload REST API to create and manage test data.
 * 
 * In the Docker test environment (npm run test:e2e):
 * - Database is fresh for each test run
 * - Seed data is created before tests start
 * - No cleanup needed between tests (use test isolation via unique data)
 * 
 * For fast local testing (npm run test:e2e:fast):
 * - Uses existing dev server
 * - May need cleanup between test runs
 */

const API_BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001'

interface ServiceGroup {
  id: number
  name: string
  slug: string
}

interface Service {
  id: number
  name: string
  slug: string
  status: string
  group: number
}

interface Incident {
  id: number
  title: string
  shortId: string
  updates: Array<{
    status: string
    message: string
    createdAt: string
  }>
}

interface Maintenance {
  id: number
  title: string
  shortId: string
  status: string
  scheduledStartAt: string
  scheduledEndAt?: string
}

interface Subscriber {
  id: number
  type: 'email' | 'sms'
  email?: string
  phone?: string
  unsubscribeToken: string
  active: boolean
}

/**
 * Create a service group
 */
export async function createServiceGroup(data: {
  name: string
  slug?: string
}): Promise<ServiceGroup> {
  const response = await fetch(`${API_BASE}/api/service-groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
    }),
  })
  
  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Failed to create service group: ${response.status} ${response.statusText} - ${errorBody}`)
  }
  
  const result = await response.json()
  return result.doc
}

/**
 * Create a service
 */
export async function createService(data: {
  name: string
  slug?: string
  status?: 'operational' | 'degraded' | 'partial' | 'major' | 'maintenance'
  group: number
}): Promise<Service> {
  const response = await fetch(`${API_BASE}/api/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
      status: data.status || 'operational',
      group: data.group,
    }),
  })
  
  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Failed to create service: ${response.status} ${response.statusText} - ${errorBody}`)
  }
  
  const result = await response.json()
  return result.doc
}

/**
 * Create an incident
 */
export async function createIncident(data: {
  title: string
  updates: Array<{
    status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
    message: string
    createdAt?: string
  }>
  affectedServices?: number[]
}): Promise<Incident> {
  const response = await fetch(`${API_BASE}/api/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: data.title,
      updates: data.updates.map(u => ({
        ...u,
        createdAt: u.createdAt || new Date().toISOString(),
      })),
      affectedServices: data.affectedServices || [],
    }),
  })
  
  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Failed to create incident: ${response.status} ${response.statusText} - ${errorBody}`)
  }
  
  const result = await response.json()
  return result.doc
}

/**
 * Create a maintenance window
 */
export async function createMaintenance(data: {
  title: string
  status?: 'upcoming' | 'in_progress' | 'completed' | 'cancelled'
  scheduledStartAt: string
  scheduledEndAt?: string
  duration?: string
  affectedServices?: number[]
}): Promise<Maintenance> {
  const response = await fetch(`${API_BASE}/api/maintenances`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: data.title,
      status: data.status || 'upcoming',
      scheduledStartAt: data.scheduledStartAt,
      scheduledEndAt: data.scheduledEndAt,
      duration: data.duration,
      affectedServices: data.affectedServices || [],
    }),
  })
  
  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Failed to create maintenance: ${response.status} ${response.statusText} - ${errorBody}`)
  }
  
  const result = await response.json()
  return result.doc
}

/**
 * Create a subscriber (for testing unsubscribe flow)
 */
export async function createSubscriber(data: {
  type: 'email' | 'sms'
  email?: string
  phone?: string
}): Promise<Subscriber> {
  const response = await fetch(`${API_BASE}/api/subscribers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: data.type,
      email: data.email,
      phone: data.phone,
      verified: true,
      active: true,
    }),
  })
  
  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Failed to create subscriber: ${response.status} ${response.statusText} - ${errorBody}`)
  }
  
  const result = await response.json()
  return result.doc
}

/**
 * Delete all documents from a collection
 */
export async function clearCollection(collection: string): Promise<void> {
  // Fetch all docs
  const response = await fetch(`${API_BASE}/api/${collection}?limit=1000`)
  if (!response.ok) return
  
  const result = await response.json()
  
  // Delete each doc
  for (const doc of result.docs || []) {
    await fetch(`${API_BASE}/api/${collection}/${doc.id}`, {
      method: 'DELETE',
    })
  }
}

/**
 * Seed standard test data
 */
export async function seedTestData(): Promise<{
  serviceGroups: ServiceGroup[]
  services: Service[]
  incidents: Incident[]
  maintenances: Maintenance[]
}> {
  // Create service groups
  const apiGroup = await createServiceGroup({ name: 'API Services', slug: 'api-services' })
  const webGroup = await createServiceGroup({ name: 'Web Applications', slug: 'web-applications' })
  
  // Create services
  const restApi = await createService({ 
    name: 'REST API', 
    slug: 'rest-api',
    status: 'operational', 
    group: apiGroup.id 
  })
  const graphqlApi = await createService({ 
    name: 'GraphQL API', 
    slug: 'graphql-api',
    status: 'operational', 
    group: apiGroup.id 
  })
  const dashboard = await createService({ 
    name: 'Dashboard', 
    slug: 'dashboard',
    status: 'operational', 
    group: webGroup.id 
  })
  
  // Create a resolved incident from yesterday
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  const resolvedIncident = await createIncident({
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
  
  // Create an upcoming maintenance
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
  
  return {
    serviceGroups: [apiGroup, webGroup],
    services: [restApi, graphqlApi, dashboard],
    incidents: [resolvedIncident],
    maintenances: [maintenance],
  }
}

/**
 * Clean up all test data
 */
export async function cleanupTestData(): Promise<void> {
  // Order matters due to relationships
  await clearCollection('notifications')
  await clearCollection('incidents')
  await clearCollection('maintenances')
  await clearCollection('subscribers')
  await clearCollection('services')
  await clearCollection('service-groups')
}

/**
 * Check if the API is healthy
 */
export async function checkHealth(): Promise<boolean> {
  const response = await fetch(`${API_BASE}/api/health`)
  if (!response.ok) {
    return false
  }
  const data = await response.json()
  return data.ok === true
}
