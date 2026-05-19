#!/usr/bin/env tsx
/**
 * Demo Data Seeding Script
 * 
 * Seeds the database with realistic demo data including:
 * - Demo user account
 * - Service groups and services
 * - Sample incidents with updates
 * - Scheduled maintenance
 * - Subscribers
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import { seedDemoData } from '../src/lib/seed-demo-data'

async function main() {
  console.log('🌱 Starting demo data seed...')
  
  const payload = await getPayload({ config })

  try {
    await seedDemoData(payload)
    console.log('Done!')
    process.exit(0)
  } catch (error) {
    console.error('Failed:', error)
    process.exit(1)
  }
}

main()

