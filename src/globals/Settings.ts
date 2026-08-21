import type { GlobalConfig } from 'payload'
import { authenticatedOrTestWrite } from '@/lib/access'
import { TIMEZONE_OPTIONS } from '@/lib/datetime'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Site Settings',
  admin: {
    group: 'Configuration',
  },
  access: {
    read: () => true,
    update: authenticatedOrTestWrite,
  },
  fields: [
    // General Settings
    {
      type: 'collapsible',
      label: 'General',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: 'siteName',
          type: 'text',
          required: true,
          defaultValue: 'Status Page',
          label: 'Site Name',
          admin: {
            description: 'The name of your organization/site',
          },
        },
        {
          name: 'siteDescription',
          type: 'textarea',
          label: 'Site Description',
          admin: {
            description: 'A brief description of your status page',
          },
        },
        {
          name: 'footerText',
          type: 'richText',
          label: 'Footer Text',
          admin: {
            description: 'Text displayed in the footer. Supports bold, italic, underline, and links.',
          },
        },
      ],
    },
    // SEO Settings
    {
      type: 'collapsible',
      label: 'SEO',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          label: 'Meta Title',
          admin: {
            description: 'Title shown in browser tabs and search results (leave empty to use Site Name)',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          label: 'Meta Description',
          admin: {
            description: 'Description shown in search results',
          },
        },
        {
          name: 'historyMetaTitle',
          type: 'text',
          label: 'History Page Meta Title',
          admin: {
            description: 'Title for the incident history page (use {{date}} for dynamic date)',
          },
        },
        {
          name: 'historyMetaDescription',
          type: 'textarea',
          label: 'History Page Meta Description',
          admin: {
            description: 'Description for the incident history page (use {{date}} for dynamic date)',
          },
        },
      ],
    },
    // Branding Settings
    {
      type: 'collapsible',
      label: 'Branding',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'favicon',
          type: 'upload',
          relationTo: 'media',
          label: 'Favicon',
          admin: {
            description: 'Site favicon (recommended: 32x32 or 64x64 PNG, ICO, or SVG). Leave empty to use default favicon.',
          },
        },
        {
          name: 'logoLight',
          type: 'upload',
          relationTo: 'media',
          label: 'Logo (Light Theme)',
          admin: {
            description: 'Logo to display on light backgrounds (recommended: SVG or PNG with transparent background)',
          },
        },
        {
          name: 'logoDark',
          type: 'upload',
          relationTo: 'media',
          label: 'Logo (Dark Theme)',
          admin: {
            description: 'Logo to display on dark backgrounds (recommended: SVG or PNG with transparent background)',
          },
        },
      ],
    },
    // Status Override Settings
    {
      type: 'collapsible',
      label: 'Status Override',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'maintenanceModeEnabled',
          type: 'checkbox',
          defaultValue: false,
          label: 'Enable Maintenance Mode',
          admin: {
            description: 'Force display of maintenance banner regardless of service status',
          },
        },
        {
          name: 'customStatusMessage',
          type: 'textarea',
          label: 'Custom Status Message',
          admin: {
            description: 'Override the default status banner message (leave empty to use automatic)',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Maintenance',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'maintenanceTerminalRetentionHours',
          type: 'number',
          defaultValue: 24,
          min: 0,
          label: 'Maintenance retention (hours)',
          admin: {
            description:
              'How long completed and cancelled maintenances stay visible on the status page after they enter a terminal state.',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Localization',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'timezone',
          type: 'select',
          label: 'Timezone',
          defaultValue: 'UTC',
          options: TIMEZONE_OPTIONS.map((value) => ({ label: value, value })),
          admin: {
            description:
              'Timezone used for public timestamps, history weeks, and admin date pickers. Visitors see this timezone, not their own.',
          },
        },
        {
          name: 'locale',
          type: 'text',
          label: 'Locale',
          defaultValue: 'en-US',
          admin: {
            description:
              'BCP 47 locale for date and time formatting (e.g. en-US, de-DE, fr-FR). Controls 12-hour vs 24-hour clocks.',
          },
        },
        {
          name: 'weekStartsOn',
          type: 'select',
          label: 'Week starts on',
          defaultValue: 'monday',
          options: [
            { label: 'Monday', value: 'monday' },
            { label: 'Sunday', value: 'sunday' },
          ],
          admin: {
            description:
              'First day of the week for incident history and admin date pickers.',
          },
        },
      ],
    },
  ],
}
