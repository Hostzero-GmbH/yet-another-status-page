import type { CollectionConfig } from 'payload'

export const notificationChannelOptions = [
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'Both', value: 'both' },
] as const

export const notificationStatusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Sent', value: 'sent' },
  { label: 'Failed', value: 'failed' },
] as const

export type NotificationChannel = (typeof notificationChannelOptions)[number]['value']
export type NotificationStatus = (typeof notificationStatusOptions)[number]['value']

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'channel', 'status', 'recipientCount', 'createdAt'],
    group: 'Notifications',
    description: 'Manage and send notifications to subscribers',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  hooks: {
    afterRead: [
      async ({ doc, req }) => {
        // For drafts/scheduled, compute estimated recipient count
        if (doc.status === 'draft' || doc.status === 'scheduled') {
          try {
            const channel = doc.channel || 'both'
            let count = 0

            if (channel === 'email' || channel === 'both') {
              const emailCount = await req.payload.count({
                collection: 'subscribers',
                where: {
                  type: { equals: 'email' },
                  active: { equals: true },
                },
              })
              count += emailCount.totalDocs
            }

            if (channel === 'sms' || channel === 'both') {
              const smsCount = await req.payload.count({
                collection: 'subscribers',
                where: {
                  type: { equals: 'sms' },
                  active: { equals: true },
                },
              })
              count += smsCount.totalDocs
            }

            // Return with estimated count
            return {
              ...doc,
              recipientCount: count,
            }
          } catch (error) {
            console.error('Error computing recipient count:', error)
            return doc
          }
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Notification Title',
      admin: {
        description: 'Internal title for this notification (auto-generated)',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'relatedIncident',
          type: 'relationship',
          relationTo: 'incidents',
          label: 'Related Incident',
          admin: {
            width: '50%',
            condition: (data) => !data?.relatedMaintenance,
          },
        },
        {
          name: 'relatedMaintenance',
          type: 'relationship',
          relationTo: 'maintenances',
          label: 'Related Maintenance',
          admin: {
            width: '50%',
            condition: (data) => !data?.relatedIncident,
          },
        },
      ],
    },
    {
      name: 'updateIndex',
      type: 'number',
      label: 'Update Index',
      admin: {
        hidden: true,
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'channel',
          type: 'select',
          required: true,
          defaultValue: 'both',
          options: [...notificationChannelOptions],
          admin: {
            width: '50%',
          },
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'draft',
          options: [...notificationStatusOptions],
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'subject',
      type: 'text',
      label: 'Email Subject',
      admin: {
        description: 'Subject line for email notifications',
        condition: (data) => data?.channel !== 'sms',
      },
    },
    {
      name: 'emailBody',
      type: 'textarea',
      label: 'Email Body',
      admin: {
        description: 'Full email message content. Use {{siteUrl}} for the site URL.',
        condition: (data) => data?.channel !== 'sms',
      },
    },
    {
      name: 'smsBody',
      type: 'textarea',
      label: 'SMS Message',
      admin: {
        description: 'Short SMS message (160 characters recommended)',
        condition: (data) => data?.channel !== 'email',
      },
    },
    {
      name: 'sendButton',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/SendNotificationCollectionButton#SendNotificationCollectionButton',
        },
      },
    },
    {
      name: 'recipientCountDisplay',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/RecipientCountField#RecipientCountField',
        },
      },
    },
    {
      name: 'recipientCount',
      type: 'number',
      label: 'Recipients',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'errorMessage',
      type: 'textarea',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'sentAt',
      type: 'date',
      label: 'Sent At',
      admin: {
        readOnly: true,
        condition: (data) => data?.status === 'sent',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
}
