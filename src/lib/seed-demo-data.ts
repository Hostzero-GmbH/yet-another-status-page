import type { Payload } from 'payload'

export async function seedDemoData(payload: Payload) {
  console.log('⚠️  ========================================')
  console.log('⚠️  DESTRUCTIVE OPERATION: Demo Data Reset')
  console.log('⚠️  Deleting all existing data...')
  console.log('⚠️  ========================================')

  try {
    console.log('🗑️  Deleting existing collections...')
    await payload.delete({ collection: 'notifications', where: {} })
    await payload.delete({ collection: 'incidents', where: {} })
    await payload.delete({ collection: 'maintenances', where: {} })
    await payload.delete({ collection: 'services', where: {} })
    await payload.delete({ collection: 'service-groups', where: {} })
    await payload.delete({ collection: 'subscribers', where: {} })
    
    console.log('👥 Resetting users (keeping demo user only)...')
    const demoEmail = process.env.DEMO_USER_EMAIL || 'demo@yasp.io'
    const users = await payload.find({ collection: 'users', limit: 1000 })
    for (const user of users.docs) {
      if (user.email !== demoEmail) {
        await payload.delete({ collection: 'users', id: user.id })
      }
    }

    console.log('👤 Creating demo user...')
    const existingDemoUser = await payload.find({
      collection: 'users',
      where: { email: { equals: demoEmail } },
      limit: 1,
    })

    if (existingDemoUser.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: demoEmail,
          password: process.env.DEMO_USER_PASSWORD || 'demo2026#',
          role: 'admin',
        },
      })
    } else {
      const userId = existingDemoUser.docs[0].id
      await payload.update({
        collection: 'users',
        id: userId,
        data: {
          password: process.env.DEMO_USER_PASSWORD || 'demo2026#',
          loginAttempts: 0,
          lockUntil: null,
        },
      })
    }

    console.log('🎨 Uploading branding assets...')
    const fs = await import('fs')
    const path = await import('path')
    
    const logoPath = path.join(process.cwd(), 'public', 'yasp-logo.svg')
    const faviconPath = path.join(process.cwd(), 'public', 'default-favicon.png')
    
    let logoMedia = null
    let faviconMedia = null
    
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath)
      logoMedia = await payload.create({
        collection: 'media',
        data: {
          alt: 'YASP Logo',
        },
        file: {
          data: logoBuffer,
          mimetype: 'image/svg+xml',
          name: 'yasp-logo.svg',
          size: logoBuffer.length,
        },
      })
    }
    
    if (fs.existsSync(faviconPath)) {
      const faviconBuffer = fs.readFileSync(faviconPath)
      faviconMedia = await payload.create({
        collection: 'media',
        data: {
          alt: 'YASP Favicon',
        },
        file: {
          data: faviconBuffer,
          mimetype: 'image/png',
          name: 'default-favicon.png',
          size: faviconBuffer.length,
        },
      })
    }

    console.log('⚙️  Updating settings...')
    await payload.updateGlobal({
      slug: 'settings',
      data: {
        siteName: 'YASP Demo',
        siteDescription: 'Live demo of Yet Another Status Page - Try all features!',
        maintenanceModeEnabled: false,
        logoLight: logoMedia?.id || undefined,
        logoDark: logoMedia?.id || undefined,
        favicon: faviconMedia?.id || undefined,
      },
    })

    console.log('📁 Creating service groups...')
    const apiGroup = await payload.create({
      collection: 'service-groups',
      data: {
        name: 'API Services',
        slug: 'api-services',
        description: 'Core API endpoints and services',
      },
    })

    const infraGroup = await payload.create({
      collection: 'service-groups',
      data: {
        name: 'Infrastructure',
        slug: 'infrastructure',
        description: 'Hosting and infrastructure services',
      },
    })

    const webGroup = await payload.create({
      collection: 'service-groups',
      data: {
        name: 'Web Applications',
        slug: 'web-applications',
        description: 'Frontend applications and websites',
      },
    })

    console.log('🔧 Creating services...')
    const restApi = await payload.create({
      collection: 'services',
      data: {
        name: 'REST API',
        slug: 'rest-api',
        description: 'Main REST API endpoint',
        group: apiGroup.id,
        status: 'operational',
      },
    })

    const graphqlApi = await payload.create({
      collection: 'services',
      data: {
        name: 'GraphQL API',
        slug: 'graphql-api',
        description: 'GraphQL endpoint for advanced queries',
        group: apiGroup.id,
        status: 'operational',
      },
    })

    const authService = await payload.create({
      collection: 'services',
      data: {
        name: 'Authentication',
        slug: 'authentication',
        description: 'User authentication and authorization',
        group: apiGroup.id,
        status: 'degraded',
      },
    })

    const database = await payload.create({
      collection: 'services',
      data: {
        name: 'Database',
        slug: 'database',
        description: 'PostgreSQL database cluster',
        group: infraGroup.id,
        status: 'operational',
      },
    })

    const cdn = await payload.create({
      collection: 'services',
      data: {
        name: 'CDN',
        slug: 'cdn',
        description: 'Content delivery network',
        group: infraGroup.id,
        status: 'operational',
      },
    })

    const webApp = await payload.create({
      collection: 'services',
      data: {
        name: 'Web Dashboard',
        slug: 'web-dashboard',
        description: 'Main web application',
        group: webGroup.id,
        status: 'operational',
      },
    })

    console.log('🚨 Creating sample incidents...')
    
    const affectedServicesApi: number[] = [restApi.id, graphqlApi.id]
    await payload.create({
      collection: 'incidents',
      draft: false,
      data: {
        title: 'API Gateway Latency Issues',
        status: 'resolved',
        affectedServices: affectedServicesApi,
        updates: [
          {
            status: 'investigating',
            message: 'We are investigating reports of increased API response times.',
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          },
          {
            status: 'identified',
            message: 'We have identified a database connection pool exhaustion issue causing the latency.',
            createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
          },
          {
            status: 'monitoring',
            message: 'Connection pool limits have been increased. Monitoring for stability.',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            status: 'resolved',
            message: 'All API endpoints are responding normally. Issue has been resolved.',
            createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
          },
        ],
      },
    })

    const affectedServicesAuth: number[] = [authService.id]
    await payload.create({
      collection: 'incidents',
      draft: false,
      data: {
        title: 'Authentication Service Degraded Performance',
        status: 'identified',
        affectedServices: affectedServicesAuth,
        updates: [
          {
            status: 'investigating',
            message: 'Some users are experiencing slower than normal login times. Our team is investigating.',
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
          {
            status: 'identified',
            message: 'We have identified high load on the authentication service. Scaling up resources.',
            createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          },
        ],
      },
    })

    const affectedServicesCdn: number[] = [cdn.id]
    await payload.create({
      collection: 'incidents',
      draft: false,
      data: {
        title: 'CDN Cache Invalidation Delay',
        status: 'resolved',
        affectedServices: affectedServicesCdn,
        updates: [
          {
            status: 'investigating',
            message: 'Reports of stale content being served from CDN. Investigating cache invalidation.',
            createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          },
          {
            status: 'resolved',
            message: 'Cache invalidation issue resolved. All content is now up to date.',
            createdAt: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
          },
        ],
      },
    })

    console.log('🔧 Creating scheduled maintenance...')
    const affectedServicesDbMaintenance: number[] = [database.id, restApi.id, graphqlApi.id]
    await payload.create({
      collection: 'maintenances',
      draft: false,
      data: {
        title: 'Database Cluster Upgrade',
        description: undefined,
        scheduledStartAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        scheduledEndAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        duration: '~2 hours',
        status: 'upcoming',
        affectedServices: affectedServicesDbMaintenance,
        updates: [],
      },
    })

    const affectedServicesCdnMaintenance: number[] = [cdn.id, webApp.id]
    await payload.create({
      collection: 'maintenances',
      draft: false,
      data: {
        title: 'CDN Configuration Update',
        description: undefined,
        scheduledStartAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        scheduledEndAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        duration: '~30 minutes',
        status: 'upcoming',
        affectedServices: affectedServicesCdnMaintenance,
        updates: [],
      },
    })

    console.log('📧 Creating sample subscribers...')
    await payload.create({
      collection: 'subscribers',
      draft: false,
      data: {
        type: 'email',
        email: 'user1@example.com',
        verified: true,
        active: true,
      },
    })

    await payload.create({
      collection: 'subscribers',
      draft: false,
      data: {
        type: 'sms',
        phone: '+1234567890',
        verified: true,
        active: true,
      },
    })

    console.log('✅ Demo data seeded successfully!')
    return true
  } catch (error) {
    console.error('❌ Error seeding demo data:', error)
    throw error
  }
}
