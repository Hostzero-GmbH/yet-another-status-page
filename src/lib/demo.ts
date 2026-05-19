/**
 * Demo Mode Utilities
 * 
 * Provides functionality for live demo mode including:
 * - Demo mode detection
 * - Password change restrictions
 * - Database reset scheduling
 * 
 * WARNING: Demo mode is destructive and will delete all application data.
 * Only enable on a dedicated/disposable database.
 */

import type { Payload } from 'payload'

declare global {
  var _demoNextResetTime: Date | undefined
  var _demoSchedulerStarted: boolean | undefined
  var _demoResetInProgress: Promise<void> | undefined
}

export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === 'true'
}

export function getDemoUserEmail(): string {
  return process.env.DEMO_USER_EMAIL || 'demo@yasp.io'
}

export function getDemoUserPassword(): string {
  return process.env.DEMO_USER_PASSWORD || 'demo2026#'
}

export function getDemoResetInterval(): number {
  const interval = parseInt(process.env.DEMO_RESET_INTERVAL_MINUTES || '60', 10)
  
  if (isNaN(interval) || interval <= 0) {
    console.warn(`⚠️  Invalid DEMO_RESET_INTERVAL_MINUTES: ${process.env.DEMO_RESET_INTERVAL_MINUTES}. Using default: 60 minutes`)
    return 60
  }
  
  if (interval < 5) {
    console.warn(`⚠️  DEMO_RESET_INTERVAL_MINUTES too short (${interval}min). Minimum is 5 minutes. Using 5.`)
    return 5
  }
  
  return interval
}

export function setNextResetTime(intervalMinutes: number): void {
  global._demoNextResetTime = new Date(Date.now() + intervalMinutes * 60 * 1000)
}

export function getNextResetTime(): Date {
  if (global._demoNextResetTime) {
    return global._demoNextResetTime
  }

  const interval = getDemoResetInterval()
  return new Date(Date.now() + interval * 60 * 1000)
}

export function getTimeUntilReset(): string {
  const now = new Date()
  const nextReset = getNextResetTime()
  const diff = nextReset.getTime() - now.getTime()
  
  if (diff <= 0) {
    return 'Resetting soon...'
  }
  
  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}

export async function initDemoMode(payload: Payload): Promise<void> {
  if (global._demoSchedulerStarted) {
    return
  }

  global._demoSchedulerStarted = true

  console.warn('⚠️  ========================================')
  console.warn('⚠️  DEMO MODE ACTIVE')
  console.warn('⚠️  This will DELETE and RESEED all data!')
  console.warn('⚠️  Only use on a disposable database.')
  console.warn('⚠️  ========================================')

  const { seedDemoData } = await import('./seed-demo-data')
  const intervalMinutes = getDemoResetInterval()
  const intervalMs = intervalMinutes * 60 * 1000
  
  console.log('🚀 Demo mode scheduler initialized')
  console.log(`⏱️  Reset interval: ${intervalMinutes} minutes`)
  
  async function resetDemo() {
    if (global._demoResetInProgress) {
      return global._demoResetInProgress
    }

    console.log('🔄 Starting scheduled demo reset...')
    console.log(`⏰ Reset time: ${new Date().toISOString()}`)

    global._demoResetInProgress = (async () => {
      try {
        await seedDemoData(payload)
        setNextResetTime(intervalMinutes)
        console.log('✅ Demo reset completed successfully!')
        console.log(`📅 Next reset: ${getNextResetTime().toISOString()}`)
      } catch (error) {
        console.error('❌ Demo reset failed:', error)
      } finally {
        global._demoResetInProgress = undefined
      }
    })()

    return global._demoResetInProgress
  }

  void resetDemo()
  
  setInterval(async () => {
    await resetDemo()
  }, intervalMs)
}
