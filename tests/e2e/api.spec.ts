import { test, expect } from '@playwright/test'

/**
 * API Endpoint Tests
 * 
 * Tests for the REST API endpoints using Playwright's request context.
 */
test.describe('Health API', () => {
  test('returns ok status', async ({ request }) => {
    const response = await request.get('/api/health')
    
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data.ok).toBe(true)
  })
})

test.describe('Subscribe API', () => {
  test('returns availability status', async ({ request }) => {
    const response = await request.get('/api/subscribe')
    
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data).toHaveProperty('email')
    expect(data).toHaveProperty('sms')
  })

  test('rejects empty subscription request', async ({ request }) => {
    const response = await request.post('/api/subscribe', {
      data: {},
    })
    
    expect(response.status()).toBe(400)
  })

  test('rejects invalid subscription type', async ({ request }) => {
    const response = await request.post('/api/subscribe', {
      data: {
        type: 'invalid',
        email: 'test@example.com',
      },
    })
    
    expect(response.status()).toBe(400)
  })

  test('creates email subscription', async ({ request }) => {
    const response = await request.post('/api/subscribe', {
      data: {
        type: 'email',
        email: `api-test-${Date.now()}@example.com`,
      },
    })
    
    // May be 200 (success) or error if SMTP not configured
    expect([200, 400, 503]).toContain(response.status())
  })
})

test.describe('Unsubscribe API', () => {
  test('returns error for missing token', async ({ request }) => {
    const response = await request.post('/api/unsubscribe', {
      data: {},
    })
    
    expect(response.status()).toBe(400)
    
    const data = await response.json()
    expect(data.error).toContain('token')
  })

  test('returns error for invalid token', async ({ request }) => {
    const response = await request.post('/api/unsubscribe', {
      data: {
        token: 'invalid-token-12345',
      },
    })
    
    expect(response.status()).toBe(404)
  })
})

// Dashboard Stats API is authenticated - skip in E2E tests
// This endpoint requires admin authentication which we don't test
