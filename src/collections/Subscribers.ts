import type { CollectionConfig } from 'payload'
import { authenticatedOrTestWrite } from '@/lib/access'
import { generateShortId } from '@/lib/shortId'

export const subscriptionTypeOptions = [
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
] as const

export type SubscriptionType = (typeof subscriptionTypeOptions)[number]['value']

interface SubscriberData {
  type?: SubscriptionType
  email?: string
  phone?: string
  verified?: boolean
  active?: boolean
}

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['type', 'email', 'phone', 'verified', 'active', 'createdAt'],
    group: 'Notifications',
  },
  access: {
    read: authenticatedOrTestWrite,
    create: () => true, // Public subscription
    update: authenticatedOrTestWrite,
    delete: authenticatedOrTestWrite,
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'email',
      options: [...subscriptionTypeOptions],
      admin: {
        description: 'Type of subscription',
      },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      admin: {
        description: 'Required if subscription type is email',
        condition: (data) => (data as SubscriberData)?.type === 'email',
      },
      validate: async (
        value: string | null | undefined,
        { data, req, id }: { data: Partial<SubscriberData>; req: { payload?: unknown }; id?: string | number },
      ) => {
        if (data?.type === 'email' && !value) {
          return 'Email is required for email subscriptions'
        }

        // Check uniqueness for email subscriptions
        if (value && data?.type === 'email' && req.payload) {
          const payload = req.payload as {
            find: (args: {
              collection: string
              where: Record<string, unknown>
              limit: number
            }) => Promise<{ docs: Array<{ id: string | number }> }>
          }
          const existing = await payload.find({
            collection: 'subscribers',
            where: {
              email: { equals: value },
              type: { equals: 'email' },
              ...(id ? { id: { not_equals: id } } : {}),
            },
            limit: 1,
          })
          if (existing.docs.length > 0) {
            return 'This email address is already subscribed'
          }
        }

        return true
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
      admin: {
        description: 'Required if subscription type is SMS (include country code)',
        condition: (data) => (data as SubscriberData)?.type === 'sms',
      },
      validate: async (
        value: string | null | undefined,
        { data, req, id }: { data: Partial<SubscriberData>; req: { payload?: unknown }; id?: string | number },
      ) => {
        if (data?.type === 'sms' && !value) {
          return 'Phone number is required for SMS subscriptions'
        }
        if (value && !/^\+?[1-9]\d{6,14}$/.test(value)) {
          return 'Please enter a valid phone number (e.g., +1234567890)'
        }

        // Check uniqueness for SMS subscriptions
        if (value && data?.type === 'sms' && req.payload) {
          const payload = req.payload as {
            find: (args: {
              collection: string
              where: Record<string, unknown>
              limit: number
            }) => Promise<{ docs: Array<{ id: string | number }> }>
          }
          const existing = await payload.find({
            collection: 'subscribers',
            where: {
              phone: { equals: value },
              type: { equals: 'sms' },
              ...(id ? { id: { not_equals: id } } : {}),
            },
            limit: 1,
          })
          if (existing.docs.length > 0) {
            return 'This phone number is already subscribed'
          }
        }

        return true
      },
    },
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
      label: 'Verified',
      admin: {
        description: 'Whether the subscription has been verified',
      },
    },
    {
      name: 'verificationToken',
      type: 'text',
      label: 'Verification Token',
      admin: {
        description: 'Token used for email/phone verification',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ value, operation }) => {
            if (operation === 'create' && !value) {
              // Generate a secure random verification token
              return generateShortId(24)
            }
            return value
          },
        ],
      },
    },
    {
      name: 'unsubscribeToken',
      type: 'text',
      label: 'Unsubscribe Token',
      unique: true,
      admin: {
        description: 'Token used for one-click unsubscribe',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ value, operation }) => {
            if (operation === 'create' && !value) {
              // Generate a secure unique unsubscribe token
              return generateShortId(32)
            }
            return value
          },
        ],
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active',
      admin: {
        description: 'Whether the subscription is active',
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      label: 'IP Address',
      index: true,
      admin: {
        description: 'IP address used when subscribing (for rate limiting)',
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
}
