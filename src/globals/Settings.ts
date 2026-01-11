import type { GlobalConfig } from 'payload'
import { lexicalEditor, BoldFeature, ItalicFeature, LinkFeature, ParagraphFeature } from '@payloadcms/richtext-lexical'

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
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
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
                description: 'Text displayed in the footer. Supports bold, italic, and links. Leave empty for default.',
              },
              editor: lexicalEditor({
                features: () => [
                  ParagraphFeature(),
                  BoldFeature(),
                  ItalicFeature(),
                  LinkFeature({
                    enabledCollections: [],
                    fields: [],
                  }),
                ],
              }),
            },
          ],
        },
        {
          label: 'SEO',
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
        {
          label: 'Branding',
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
        {
          label: 'Status Override',
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
          label: 'Email / SMTP',
          description: 'Configure SMTP settings to enable email notifications. All fields marked with * are required for email subscriptions to work.',
          fields: [
            {
              name: 'smtpHost',
              type: 'text',
              label: 'SMTP Host *',
              admin: {
                description: 'Required. SMTP server hostname (e.g., smtp.gmail.com, smtp.sendgrid.net)',
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
                  ({ value }) => {
                    // Mask password in API responses - show placeholder if set
                    if (value) return '••••••••'
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
              label: 'From Email Address *',
              admin: {
                description: 'Required. Email address that notifications will be sent from',
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
        {
          label: 'SMS / Twilio',
          description: 'Configure Twilio settings to enable SMS notifications. All fields marked with * are required for SMS subscriptions to work.',
          fields: [
            {
              name: 'twilioAccountSid',
              type: 'text',
              label: 'Account SID *',
              admin: {
                description: 'Required. Your Twilio Account SID (starts with AC...)',
              },
            },
            {
              name: 'twilioAuthToken',
              type: 'text',
              label: 'Auth Token *',
              admin: {
                description: 'Required. Your Twilio Auth Token. Leave empty to keep existing value.',
                autoComplete: 'new-password',
              },
              hooks: {
                afterRead: [
                  ({ value }) => {
                    // Mask token in API responses - show placeholder if set
                    if (value) return '••••••••'
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
              label: 'From Phone Number *',
              admin: {
                description: 'Required. Your Twilio phone number (e.g., +1234567890)',
              },
            },
            {
              name: 'twilioMessagingServiceSid',
              type: 'text',
              label: 'Messaging Service SID',
              admin: {
                description: 'Optional. Use a Messaging Service instead of a single phone number for better deliverability',
              },
            },
          ],
        },
        {
          label: 'Notifications',
          description: 'Enable notification channels for subscribers. Notifications are created as drafts and sent manually from the Notifications collection.',
          fields: [
            {
              name: 'emailNotificationsEnabled',
              type: 'checkbox',
              defaultValue: false,
              label: 'Enable Email Subscriptions',
              admin: {
                description: 'Allow users to subscribe via email (requires SMTP to be configured)',
              },
            },
            {
              name: 'smsNotificationsEnabled',
              type: 'checkbox',
              defaultValue: false,
              label: 'Enable SMS Subscriptions',
              admin: {
                description: 'Allow users to subscribe via SMS (requires Twilio to be configured)',
              },
            },
          ],
        },
      ],
    },
  ],
}

