import type { CollectionConfig } from 'payload'
import { generateShortId } from '@/lib/shortId'
import { standardAccess } from '@/lib/access'

export const incidentStatusOptions = [
  { label: 'Investigating', value: 'investigating' },
  { label: 'Identified', value: 'identified' },
  { label: 'Monitoring', value: 'monitoring' },
  { label: 'Resolved', value: 'resolved' },
] as const

export type IncidentStatus = (typeof incidentStatusOptions)[number]['value']

// Deferred notification creation data
interface DeferredNotification {
  docId: number | string
  title: string
  shortId: string
  statusLabel: string
  isInitial: boolean
  updateIndex: number
  message: string
}

// Helper to create notification drafts for incidents (deferred execution)
async function createIncidentNotificationDeferred(data: DeferredNotification) {
  try {
    // Import payload dynamically to get a fresh instance outside the transaction
    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    const payload = await getPayload({ config })
    
    // Truncate message for SMS
    const truncatedMessage = data.message.length > 150 
      ? data.message.substring(0, 147) + '...' 
      : data.message
    
    let smsBody: string
    let emailBody: string
    
    if (data.isInitial) {
      // Initial incident notification (from first update)
      smsBody = `🚨 INCIDENT: ${data.title} | ${data.statusLabel} | ${truncatedMessage} | {{siteUrl}}/i/${data.shortId}`
      emailBody = `A new incident has been reported.\n\nStatus: ${data.statusLabel}\n\n${data.message}\n\nView full details: {{siteUrl}}/i/${data.shortId}`
    } else {
      // Subsequent update notification
      smsBody = `📢 ${data.title} | ${data.statusLabel} | ${truncatedMessage} | {{siteUrl}}/i/${data.shortId}`
      emailBody = `Status: ${data.statusLabel}\n\n${data.message}\n\nView full details: {{siteUrl}}/i/${data.shortId}`
    }
    
    const notification = await payload.create({
      collection: 'notifications',
      data: {
        title: data.isInitial ? `[New Incident] ${data.title}` : `[${data.statusLabel}] ${data.title}`,
        relatedIncident: typeof data.docId === 'string' ? parseInt(data.docId, 10) : data.docId,
        updateIndex: data.updateIndex,
        channel: 'both',
        status: 'draft',
        subject: `[${data.statusLabel}] ${data.title}`,
        emailBody,
        smsBody,
      },
    })
    return notification
  } catch (error) {
    console.error('[Incidents] Failed to create notification:', error)
  }
}

// Helper to get status from the latest update
export function getIncidentStatus(updates: Array<{ status?: string }> | null | undefined): IncidentStatus {
  if (!updates || updates.length === 0) return 'investigating'
  // Updates are stored with newest first in display, but array order is creation order
  // The last update in the array is the most recent
  const latestUpdate = updates[updates.length - 1]
  return (latestUpdate?.status as IncidentStatus) || 'investigating'
}

// Helper to get resolvedAt from the updates (finds the first "resolved" update)
export function getIncidentResolvedAt(updates: Array<{ status?: string; createdAt?: string }> | null | undefined): string | null {
  if (!updates || updates.length === 0) return null
  // Find the first update with "resolved" status (scanning from the end for most recent)
  for (let i = updates.length - 1; i >= 0; i--) {
    if (updates[i].status === 'resolved' && updates[i].createdAt) {
      return updates[i].createdAt!
    }
  }
  return null
}

export const Incidents: CollectionConfig = {
  slug: 'incidents',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'shortId', 'createdAt'],
    group: 'Status',
  },
  access: standardAccess,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Incident Title',
      admin: {
        description: 'A brief description of the incident (e.g., "API Gateway Latency Issues")',
      },
    },
    {
      name: 'shortId',
      type: 'text',
      unique: true,
      index: true,
      label: 'Short ID',
      admin: {
        position: 'sidebar',
        description: 'Auto-generated short ID for permalinks',
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'investigating',
      options: [...incidentStatusOptions],
      index: true,
      label: 'Current Status',
      admin: {
        position: 'sidebar',
        description: 'Automatically synced from the latest update',
        readOnly: true,
      },
    },
    {
      name: 'resolvedAt',
      type: 'date',
      label: 'Resolved At',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'When the incident was resolved',
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'affectedServices',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      label: 'Affected Services',
      admin: {
        description: 'Services affected by this incident',
      },
    },
    {
      name: 'updates',
      type: 'array',
      required: true,
      minRows: 1,
      label: 'Updates',
      admin: {
        description: 'Timeline of updates for this incident. At least one update is required.',
      },
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          options: [...incidentStatusOptions],
          admin: {
            description: 'Status at the time of this update',
          },
        },
        {
          name: 'message',
          type: 'textarea',
          required: true,
          admin: {
            description: 'Update message',
          },
        },
        {
          name: 'createdAt',
          type: 'date',
          required: true,
          defaultValue: () => new Date().toISOString(),
          admin: {
            description: 'When this update was posted',
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        data = data || {}
        
        // Always generate a new shortId on create (including duplicates)
        if (operation === 'create') {
          data.shortId = generateShortId(8)
        }
        
        // Sync status and resolvedAt from the latest update
        const updates = data.updates as Array<{ status?: string; createdAt?: string }> | undefined
        if (updates && updates.length > 0) {
          const latestUpdate = updates[updates.length - 1]
          data.status = latestUpdate.status || 'investigating'
          
          // Set resolvedAt if status is resolved
          if (latestUpdate.status === 'resolved') {
            data.resolvedAt = latestUpdate.createdAt || new Date().toISOString()
          } else {
            data.resolvedAt = null
          }
        }
        
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, previousDoc, req }) => {
        // Skip if triggered by our own update to prevent loops
        if (req.context?.skipNotificationCreation) {
          return doc
        }

        const statusLabels: Record<string, string> = {
          investigating: 'Investigating',
          identified: 'Identified',
          monitoring: 'Monitoring',
          resolved: 'Resolved',
        }
        const title = doc.title || 'Incident'
        const shortId = doc.shortId || ''
        const currentUpdates = doc.updates || []
        const previousUpdates = previousDoc?.updates || []

        // On create, use the first update for the initial notification
        if (operation === 'create' && currentUpdates.length > 0) {
          const firstUpdate = currentUpdates[0]
          const statusLabel = statusLabels[firstUpdate.status] || firstUpdate.status || 'Investigating'
          
          const notificationData: DeferredNotification = {
            docId: doc.id,
            title,
            shortId,
            statusLabel,
            isInitial: true,
            updateIndex: 0,
            message: firstUpdate.message,
          }
          
          // Defer execution to after transaction commits
          setImmediate(() => {
            createIncidentNotificationDeferred(notificationData).catch(console.error)
          })
          return doc
        }

        // Auto-create notifications for new updates (after the first one)
        for (let index = 0; index < currentUpdates.length; index++) {
          const update = currentUpdates[index]
          const isNewUpdate = index >= previousUpdates.length

          if (isNewUpdate && update.message) {
            const updateStatusLabel = statusLabels[update.status] || update.status || 'Update'
            const notificationData: DeferredNotification = {
              docId: doc.id,
              title,
              shortId,
              statusLabel: updateStatusLabel,
              isInitial: false,
              updateIndex: index,
              message: update.message,
            }
            
            // Defer execution to after transaction commits
            setImmediate(() => {
              createIncidentNotificationDeferred(notificationData).catch(console.error)
            })
          }
        }

        return doc
      },
    ],
  },
}
