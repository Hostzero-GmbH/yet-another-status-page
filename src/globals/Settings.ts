import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Site Settings',
  admin: {
    group: 'Configuration',
  },
  access: {
    read: () => true,
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
            description: 'Text displayed in the footer. Supports bold, italic, underline, and links. Leave empty for default.',
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
            description: 'Site favicon (recommended: 32x32 or 64x64 PNG, ICO, or SVG)',
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
  ],
}
