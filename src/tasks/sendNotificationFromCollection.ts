import type { BasePayload } from 'payload'
import { sendBulkEmails, generateEmailHtml } from '@/lib/email'
import { sendBulkSms, formatSmsMessage } from '@/lib/sms'
import type { Setting, Subscriber, Media } from '@/payload-types'

export interface SendNotificationFromCollectionInput {
  notificationId: string
  channel: 'email' | 'sms' | 'both'
  subject?: string
  emailBody?: string
  smsBody?: string
  itemTitle: string
  itemUrl: string
}

interface TaskHandlerArgs {
  input: SendNotificationFromCollectionInput
  req: {
    payload: BasePayload
  }
}

export async function sendNotificationFromCollectionHandler({ input, req }: TaskHandlerArgs) {
  const { payload } = req
  const {
    notificationId,
    channel,
    subject,
    emailBody,
    smsBody,
    itemTitle,
    itemUrl,
  } = input

  // Fetch settings with depth to get media objects
  const settings = await payload.findGlobal({
    slug: 'settings',
    depth: 1,
  }) as Setting

  const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://status.example.com'
  const siteName = settings.siteName || 'Status Page'
  
  // Get logo URL for emails (use light logo since email backgrounds are white)
  const logoLight = settings.logoLight as Media | number | null | undefined
  const logoUrl = logoLight && typeof logoLight === 'object' ? logoLight.url : undefined

  // Fetch all subscribers with pagination to handle large lists
  const emailSubscribers: Subscriber[] = []
  const smsSubscribers: Subscriber[] = []
  
  const fetchSubscribers = async (type: 'email' | 'sms'): Promise<Subscriber[]> => {
    const subscribers: Subscriber[] = []
    let page = 1
    let hasMore = true
    const pageSize = 500
    
    while (hasMore) {
      const result = await payload.find({
        collection: 'subscribers',
        where: {
          active: { equals: true },
          type: { equals: type },
        },
        limit: pageSize,
        page,
      })
      
      subscribers.push(...(result.docs as Subscriber[]))
      hasMore = result.hasNextPage
      page++
    }
    
    return subscribers
  }
  
  // Fetch subscribers based on channel
  if (channel === 'email' || channel === 'both') {
    const emails = await fetchSubscribers('email')
    emailSubscribers.push(...emails.filter(s => s.email))
  }
  
  if (channel === 'sms' || channel === 'both') {
    const phones = await fetchSubscribers('sms')
    smsSubscribers.push(...phones.filter(s => s.phone))
  }

  let emailsSent = 0
  let smsSent = 0
  const errors: string[] = []

  // Send emails
  if ((channel === 'email' || channel === 'both') && emailSubscribers.length > 0) {
    if (!settings.smtpHost || !settings.smtpFromAddress) {
      errors.push('SMTP not configured')
    } else {
      const emails = emailSubscribers.map((subscriber) => {
        const unsubscribeUrl = subscriber.unsubscribeToken
          ? `${siteUrl}/unsubscribe/${subscriber.unsubscribeToken}`
          : `${siteUrl}/unsubscribe`

        // Replace {{siteUrl}} placeholder in email body
        const processedBody = (emailBody || '').replace(/\{\{siteUrl\}\}/g, siteUrl)

        const html = generateEmailHtml({
          siteName,
          title: subject || itemTitle || 'Status Update',
          body: processedBody,
          ctaText: 'View Status',
          ctaUrl: itemUrl,
          unsubscribeUrl,
          siteUrl,
          logoUrl: logoUrl || undefined,
        })

        return {
          to: subscriber.email!,
          subject: subject || `[${siteName}] Status Update`,
          html,
          unsubscribeUrl,
        }
      })

      const result = await sendBulkEmails(settings, emails)
      emailsSent = result.sent
      if (result.failed > 0) {
        errors.push(`${result.failed} email(s) failed: ${result.errors.slice(0, 3).join(', ')}`)
      }
    }
  }

  // Send SMS
  if ((channel === 'sms' || channel === 'both') && smsSubscribers.length > 0) {
    if (!settings.twilioAccountSid || !settings.twilioAuthToken || !settings.twilioFromNumber) {
      errors.push('Twilio not configured')
    } else {
      const messages = smsSubscribers.map((subscriber) => ({
        to: subscriber.phone!,
        body: formatSmsMessage({
          siteName,
          title: itemTitle || 'Status Update',
          body: smsBody || '',
          url: itemUrl,
        }),
      }))

      const result = await sendBulkSms(settings, messages)
      smsSent = result.sent
      if (result.failed > 0) {
        errors.push(`${result.failed} SMS failed: ${result.errors.slice(0, 3).join(', ')}`)
      }
    }
  }

  // Update the notification status
  const hasErrors = errors.length > 0 && emailsSent === 0 && smsSent === 0
  
  type NotificationUpdate = {
    status: 'sent' | 'failed'
    sentAt?: string | null
    recipientCount: number
    errorMessage?: string | null
  }
  
  const updateData: NotificationUpdate = {
    status: hasErrors ? 'failed' : 'sent',
    recipientCount: emailsSent + smsSent,
  }
  
  if (!hasErrors) {
    updateData.sentAt = new Date().toISOString()
  }
  
  if (errors.length > 0) {
    updateData.errorMessage = errors.join('; ')
  }
  
  await payload.update({
    collection: 'notifications',
    id: notificationId,
    data: updateData,
  })

  return {
    output: {
      emailsSent,
      smsSent,
      errors,
    },
  }
}
