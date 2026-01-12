import type { GlobalConfig } from 'payload'

export const SmsSettings: GlobalConfig = {
  slug: 'sms-settings',
  label: 'SMS Settings',
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
      label: 'Enable SMS Subscriptions',
      admin: {
        description: 'Allow users to subscribe via SMS (requires Twilio to be configured)',
      },
    },
    {
      type: 'collapsible',
      label: 'Twilio Configuration',
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          name: 'twilioAccountSid',
          type: 'text',
          label: 'Account SID',
          admin: {
            description: 'Your Twilio Account SID (starts with AC...)',
          },
        },
        {
          name: 'twilioAuthToken',
          type: 'text',
          label: 'Auth Token',
          admin: {
            description: 'Your Twilio Auth Token. Leave empty to keep existing value.',
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
                if ((!value || value === '••••••••') && originalDoc?.twilioAuthToken) {
                  return originalDoc.twilioAuthToken
                }
                return value
              },
            ],
          },
        },
        {
          name: 'twilioFromNumber',
          type: 'text',
          label: 'From Phone Number',
          admin: {
            description: 'Your Twilio phone number (e.g., +1234567890). Required if not using a Messaging Service.',
          },
        },
        {
          name: 'twilioMessagingServiceSid',
          type: 'text',
          label: 'Messaging Service SID',
          admin: {
            description: 'Use a Messaging Service instead of a phone number for better deliverability. Required if not using a From Phone Number.',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'SMS Templates',
      admin: {
        initCollapsed: true,
        description: 'Configure SMS message templates. Available placeholders: {{siteName}}, {{title}}, {{status}}, {{message}}, {{url}}',
      },
      fields: [
        {
          name: 'templateTitleMaxLength',
          type: 'number',
          label: 'Title Max Length',
          defaultValue: 50,
          admin: {
            description: 'Maximum characters for {{title}} placeholder. Longer titles will be truncated.',
            width: '50%',
          },
        },
        {
          name: 'templateMessageMaxLength',
          type: 'number',
          label: 'Message Max Length',
          defaultValue: 100,
          admin: {
            description: 'Maximum characters for {{message}} placeholder. Longer messages will be truncated.',
            width: '50%',
          },
        },
        {
          name: 'templateIncidentNew',
          type: 'textarea',
          label: 'New Incident Template',
          defaultValue: '[{{siteName}}] 🚨 INCIDENT: {{title}} | {{status}} | {{message}} | {{url}}',
          admin: {
            description: 'Template for new incident notifications',
          },
        },
        {
          name: 'templateIncidentUpdate',
          type: 'textarea',
          label: 'Incident Update Template',
          defaultValue: '[{{siteName}}] 📢 {{title}} | {{status}} | {{message}} | {{url}}',
          admin: {
            description: 'Template for incident update notifications',
          },
        },
        {
          name: 'templateMaintenanceNew',
          type: 'textarea',
          label: 'New Maintenance Template',
          defaultValue: '[{{siteName}}] 🔧 MAINTENANCE: {{title}} | {{schedule}} | {{url}}',
          admin: {
            description: 'Template for new scheduled maintenance notifications. {{schedule}} includes start/end times.',
          },
        },
        {
          name: 'templateMaintenanceUpdate',
          type: 'textarea',
          label: 'Maintenance Update Template',
          defaultValue: '[{{siteName}}] 🔧 {{title}} | {{status}} | {{schedule}} | {{message}} | {{url}}',
          admin: {
            description: 'Template for maintenance update notifications',
          },
        },
      ],
    },
  ],
}
