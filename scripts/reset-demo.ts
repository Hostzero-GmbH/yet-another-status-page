#!/usr/bin/env tsx
/**
 * Demo Database Reset Script
 * 
 * Resets the database to demo state by:
 * 1. Clearing all user-generated data
 * 2. Re-seeding with demo data
 * 
 * Can be run manually or via cron job
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import { seedDemoData } from '../src/lib/seed-demo-data'

async function resetDemo() {
  console.log('🔄 Starting demo database reset...')
  console.log(`⏰ Reset time: ${new Date().toISOString()}`)
  
  const payload = await getPayload({ config })
  
  try {
    await seedDemoData(payload)
    console.log('✅ Demo database reset completed successfully!')
  } catch (error) {
    console.error('❌ Demo database reset failed:', error)
    process.exit(1)
  }
}

resetDemo()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed:', error)
    process.exit(1)
  })

