import type { CollectionConfig } from 'payload'
import { standardAccess } from '@/lib/access'

export const serviceStatusOptions = [
  { label: 'Operational', value: 'operational' },
  { label: 'Degraded Performance', value: 'degraded' },
  { label: 'Partial Outage', value: 'partial' },
  { label: 'Major Outage', value: 'major' },
  { label: 'Under Maintenance', value: 'maintenance' },
] as const

export type ServiceStatus = (typeof serviceStatusOptions)[number]['value']

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'group', 'status', 'updatedAt'],
    group: 'Status',
  },
  orderable: true,
  access: standardAccess,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Service Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier (e.g., "api-gateway")',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.name) {
              return data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Optional description for this service',
      },
    },
    {
      name: 'group',
      type: 'relationship',
      relationTo: 'service-groups',
      required: true,
      label: 'Service Group',
      admin: {
        description: 'Which group this service belongs to',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'operational',
      options: [...serviceStatusOptions],
      admin: {
        description: 'Current status of the service',
      },
    },
  ],
}
