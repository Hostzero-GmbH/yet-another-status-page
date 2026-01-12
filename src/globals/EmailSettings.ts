import type { GlobalConfig } from 'payload'

export const EmailSettings: GlobalConfig = {
  slug: 'email-settings',
  label: 'Email Settings',
  admin: {
    group: 'Configuration',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: false,
      label: 'Enable Email Subscriptions',
      admin: {
        description: 'Allow users to subscribe via email (requires SMTP to be configured)',
      },
    },
    {
      type: 'collapsible',
      label: 'SMTP Configuration',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: 'smtpHost',
          type: 'text',
          label: 'SMTP Host',
          admin: {
            description: 'SMTP server hostname (e.g., smtp.gmail.com, smtp.sendgrid.net)',
          },
        },
        {
          name: 'smtpPort',
          type: 'number',
          label: 'SMTP Port',
          defaultValue: 587,
          admin: {
            description: 'SMTP port (typically 587 for TLS, 465 for SSL, 25 for unencrypted)',
          },
        },
        {
          name: 'smtpSecure',
          type: 'select',
          label: 'Encryption',
          defaultValue: 'tls',
          options: [
            { label: 'TLS (STARTTLS) - Port 587', value: 'tls' },
            { label: 'SSL - Port 465', value: 'ssl' },
            { label: 'None - Port 25', value: 'none' },
          ],
          admin: {
            description: 'Connection security method',
          },
        },
        {
          name: 'smtpUsername',
          type: 'text',
          label: 'SMTP Username',
          admin: {
            description: 'Username for SMTP authentication (often your email address)',
          },
        },
        {
          name: 'smtpPassword',
          type: 'text',
          label: 'SMTP Password',
          admin: {
            description: 'Password or API key for SMTP authentication. Leave empty to keep existing value.',
            autoComplete: 'new-password',
          },
          hooks: {
            afterRead: [
              ({ value, req }) => {
                // Only mask for external API responses (admin UI, REST, GraphQL)
                // Keep real value for internal local API calls (tasks, server-side code)
                const isExternalApi = req?.payloadAPI === 'REST' || req?.payloadAPI === 'GraphQL'
                if (value && isExternalApi) return '••••••••'
                return value
              },
            ],
            beforeChange: [
              ({ value, originalDoc }) => {
                // If empty or masked placeholder, keep the existing value
                if ((!value || value === '••••••••') && originalDoc?.smtpPassword) {
                  return originalDoc.smtpPassword
                }
                return value
              },
            ],
          },
        },
        {
          name: 'smtpFromAddress',
          type: 'email',
          label: 'From Email Address',
          admin: {
            description: 'Email address that notifications will be sent from',
          },
        },
        {
          name: 'smtpFromName',
          type: 'text',
          label: 'From Name',
          admin: {
            description: 'Display name for the sender (e.g., "Acme Status")',
          },
        },
        {
          name: 'smtpReplyTo',
          type: 'email',
          label: 'Reply-To Address',
          admin: {
            description: 'Optional reply-to email address (leave empty to use From address)',
          },
        },
      ],
    },
  ],
}
