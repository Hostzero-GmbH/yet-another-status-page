import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

// Collections
import {
  ServiceGroups,
  Services,
  Incidents,
  Maintenances,
  Notifications,
  Subscribers,
  Users,
  Media,
} from '@/collections'

// Globals
import { Settings } from '@/globals'

// Tasks
import { sendNotificationFromCollectionHandler } from '@/tasks/sendNotificationFromCollection'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' | Hostzero Status',
    },
    components: {
      beforeDashboard: ['@/components/admin/DashboardWidgets#DashboardWidgets'],
    },
  },
  collections: [
    // Status collections
    ServiceGroups,
    Services,
    Incidents,
    Maintenances,
    // Notification collections
    Notifications,
    Subscribers,
    // Admin collections
    Users,
    Media,
  ],
  globals: [Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'default-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  // Jobs Queue configuration
  jobs: {
    tasks: [
      {
        slug: 'sendNotificationFromCollection',
        handler: sendNotificationFromCollectionHandler as any,
        inputSchema: [
          { name: 'notificationId', type: 'text', required: true },
          { name: 'channel', type: 'text', required: true },
          { name: 'subject', type: 'text' },
          { name: 'emailBody', type: 'text' },
          { name: 'smsBody', type: 'text' },
          { name: 'itemTitle', type: 'text', required: true },
          { name: 'itemUrl', type: 'text', required: true },
        ],
        retries: 3,
      },
    ],
  },
  cors: [
    'http://localhost:3000',
    process.env.NEXT_PUBLIC_SERVER_URL || '',
  ].filter(Boolean),
  csrf: [
    'http://localhost:3000',
    process.env.NEXT_PUBLIC_SERVER_URL || '',
  ].filter(Boolean),
})
