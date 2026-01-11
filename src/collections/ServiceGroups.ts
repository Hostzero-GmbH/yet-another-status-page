import type { CollectionConfig } from 'payload'
import { standardAccess } from '@/lib/access'

export const ServiceGroups: CollectionConfig = {
  slug: 'service-groups',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'updatedAt'],
    group: 'Status',
  },
  orderable: true,
  access: standardAccess,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Group Name',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier (e.g., "core-infrastructure")',
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
        description: 'Optional description for this service group',
      },
    },
  ],
}
