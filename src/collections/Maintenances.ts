import type { CollectionConfig } from 'payload'
import { generateShortId } from '@/lib/shortId'
import { standardAccess } from '@/lib/access'

export const maintenanceStatusOptions = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
] as const

export type MaintenanceStatus = (typeof maintenanceStatusOptions)[number]['value']

// Valid status transitions for auto-update
const validTransitions: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  upcoming: ['in_progress', 'completed'],
  in_progress: ['completed'],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
}

function canTransition(from: MaintenanceStatus, to: MaintenanceStatus): boolean {
  return validTransitions[from]?.includes(to) ?? false
}

// Format scheduled times for notifications
function formatDateTime(date: string | null | undefined): string | null {
  if (!date) return null
  return new Date(date).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Deferred notification creation data
interface DeferredNotification {
  docId: number | string
  title: string
  shortId: string
  statusLabel: string
  isUpdate: boolean
  updateIndex: number
  startTimeStr: string | null
  endTimeStr: string | null
  duration: string | undefined
  message?: string
}

// Helper to create notification drafts for maintenances (deferred execution)
async function createMaintenanceNotificationDeferred(data: DeferredNotification) {
  try {
    // Import payload dynamically to get a fresh instance outside the transaction
    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    const payload = await getPayload({ config })
    
    // Build schedule string for SMS (no newlines)
    let scheduleStr = ''
    if (data.startTimeStr && data.endTimeStr) {
      scheduleStr = ` | 📅 ${data.startTimeStr} - ${data.endTimeStr}`
    } else if (data.startTimeStr) {
      scheduleStr = ` | 📅 ${data.startTimeStr}`
      if (data.duration) {
        scheduleStr += ` (${data.duration})`
      }
    }
    
    const truncatedMessage = data.message 
      ? (data.message.length > 100 ? data.message.substring(0, 97) + '...' : data.message)
      : ''
    
    const smsBody = data.isUpdate
      ? `🔧 ${data.title} | ${data.statusLabel}${scheduleStr}${truncatedMessage ? ` | ${truncatedMessage}` : ''} | {{siteUrl}}/m/${data.shortId}`
      : `🔧 MAINTENANCE: ${data.title}${scheduleStr} | {{siteUrl}}/m/${data.shortId}`
    
    const emailBody = data.isUpdate
      ? `Maintenance Status: ${data.statusLabel}\n\n${data.message || ''}\n\nView full details: {{siteUrl}}/m/${data.shortId}`
      : `A maintenance window has been scheduled.\n\nScheduled Start: ${data.startTimeStr || 'TBD'}\n${data.endTimeStr ? `Scheduled End: ${data.endTimeStr}\n` : ''}${data.duration ? `Expected Duration: ${data.duration}\n` : ''}\nWe will notify you when the maintenance begins and completes.\n\nView full details: {{siteUrl}}/m/${data.shortId}`
    
    const notification = await payload.create({
      collection: 'notifications',
      data: {
        title: data.isUpdate ? `[Maintenance ${data.statusLabel}] ${data.title}` : `[Scheduled Maintenance] ${data.title}`,
        relatedMaintenance: typeof data.docId === 'string' ? parseInt(data.docId, 10) : data.docId,
        updateIndex: data.updateIndex,
        channel: 'both',
        status: 'draft',
        subject: data.isUpdate ? `[Maintenance ${data.statusLabel}] ${data.title}` : `[Scheduled Maintenance] ${data.title}`,
        emailBody,
        smsBody,
      },
    })
    return notification
  } catch (error) {
    console.error('[Maintenances] Failed to create notification:', error)
  }
}

export const Maintenances: CollectionConfig = {
  slug: 'maintenances',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'shortId', 'status', 'scheduledStartAt', 'updatedAt'],
    group: 'Status',
  },
  access: standardAccess,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Maintenance Title',
      admin: {
        description: 'A brief description of the maintenance (e.g., "Database Migration")',
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
      name: 'description',
      type: 'richText',
      label: 'Description',
      admin: {
        description: 'Detailed description of the maintenance work',
      },
    },
    {
      name: 'affectedServices',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      label: 'Affected Services',
      admin: {
        description: 'Services that will be affected by this maintenance',
      },
    },
    {
      name: 'scheduledStartAt',
      type: 'date',
      required: true,
      label: 'Scheduled Start',
      admin: {
        description: 'When the maintenance is scheduled to start',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'scheduledEndAt',
      type: 'date',
      label: 'Scheduled End',
      admin: {
        description: 'When the maintenance is expected to end',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'duration',
      type: 'text',
      label: 'Duration',
      admin: {
        description: 'Human-readable duration (e.g., "~2 hours")',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'upcoming',
      options: [...maintenanceStatusOptions],
      admin: {
        description: 'Current status of the maintenance',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'autoStartOnSchedule',
          type: 'checkbox',
          defaultValue: true,
          label: 'Auto-start on schedule',
          admin: {
            description: 'Automatically set to "In Progress" when start time is reached',
            width: '50%',
          },
        },
        {
          name: 'autoCompleteOnSchedule',
          type: 'checkbox',
          defaultValue: true,
          label: 'Auto-complete on schedule',
          admin: {
            description: 'Automatically set to "Completed" when end time is reached',
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'updates',
      type: 'array',
      label: 'Updates',
      admin: {
        description: 'Optional timeline of updates for this maintenance',
      },
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          options: [...maintenanceStatusOptions],
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
        // Always generate a new shortId on create (including duplicates)
        if (operation === 'create') {
          data = data || {}
          data.shortId = generateShortId(8)
        }
        return data
      },
    ],
    afterRead: [
      async ({ doc, req }) => {
        if (!doc) return doc

        const now = new Date()
        const currentStatus = doc.status as MaintenanceStatus
        const startTime = doc.scheduledStartAt ? new Date(doc.scheduledStartAt) : null
        const endTime = doc.scheduledEndAt ? new Date(doc.scheduledEndAt) : null

        let newStatus: MaintenanceStatus | null = null

        // Check if we should auto-complete (check this first as it takes priority)
        if (
          doc.autoCompleteOnSchedule &&
          endTime &&
          now >= endTime &&
          canTransition(currentStatus, 'completed')
        ) {
          newStatus = 'completed'
        }
        // Check if we should auto-start
        else if (
          doc.autoStartOnSchedule &&
          startTime &&
          now >= startTime &&
          canTransition(currentStatus, 'in_progress')
        ) {
          newStatus = 'in_progress'
        }

        // If status needs to change, update it in the database
        if (newStatus && newStatus !== currentStatus) {
          try {
            await req.payload.update({
              collection: 'maintenances',
              id: doc.id,
              data: {
                status: newStatus,
              },
              // Prevent infinite loop
              context: {
                skipAutoStatusUpdate: true,
              },
            })
            // Return the updated status in the response
            return {
              ...doc,
              status: newStatus,
            }
          } catch (error) {
            // If update fails, just return the original doc
            console.error('Failed to auto-update maintenance status:', error)
          }
        }

        return doc
      },
    ],
    afterChange: [
      async ({ doc, operation, previousDoc, req }) => {
        // Skip if triggered by auto-status update or our own update
        if (req.context?.skipAutoStatusUpdate || req.context?.skipNotificationCreation) {
          return doc
        }

        const statusLabels: Record<string, string> = {
          upcoming: 'Scheduled',
          in_progress: 'In Progress',
          completed: 'Completed',
          cancelled: 'Cancelled',
        }
        const title = doc.title || 'Maintenance'
        const shortId = doc.shortId || ''
        const statusLabel = statusLabels[doc.status] || doc.status || 'Update'
        const startTimeStr = formatDateTime(doc.scheduledStartAt)
        const endTimeStr = formatDateTime(doc.scheduledEndAt)

        // Auto-create notification on new maintenance creation
        // Use setImmediate to defer until after the current transaction commits
        if (operation === 'create') {
          const notificationData: DeferredNotification = {
            docId: doc.id,
            title,
            shortId,
            statusLabel,
            isUpdate: false,
            updateIndex: -1,
            startTimeStr,
            endTimeStr,
            duration: doc.duration,
          }
          
          // Defer execution to after transaction commits
          setImmediate(() => {
            createMaintenanceNotificationDeferred(notificationData).catch(console.error)
          })
          return doc
        }

        // Auto-create notifications for new updates
        const currentUpdates = doc.updates || []
        const previousUpdates = previousDoc?.updates || []

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
              isUpdate: true,
              updateIndex: index,
              startTimeStr,
              endTimeStr,
              duration: doc.duration,
              message: update.message,
            }
            
            // Defer execution to after transaction commits
            setImmediate(() => {
              createMaintenanceNotificationDeferred(notificationData).catch(console.error)
            })
          }
        }

        return doc
      },
    ],
  },
}
