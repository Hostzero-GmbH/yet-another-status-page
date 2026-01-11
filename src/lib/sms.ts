import twilio from 'twilio'
import type { Setting } from '@/payload-types'

interface SmsOptions {
  to: string
  body: string
}

interface SmsResult {
  success: boolean
  messageId?: string
  error?: string
}

export function createTwilioClient(settings: Setting) {
  if (!settings.twilioAccountSid || !settings.twilioAuthToken) {
    throw new Error('Twilio not configured: missing Account SID or Auth Token')
  }

  return twilio(settings.twilioAccountSid, settings.twilioAuthToken)
}

export async function sendSms(
  settings: Setting,
  options: SmsOptions
): Promise<SmsResult> {
  try {
    if (!settings.twilioFromNumber) {
      throw new Error('Twilio from number not configured')
    }

    const client = createTwilioClient(settings)

    const message = await client.messages.create({
      to: options.to,
      from: settings.twilioFromNumber,
      body: options.body,
    })

    return {
      success: true,
      messageId: message.sid,
    }
  } catch (error) {
    console.error('SMS send error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending SMS',
    }
  }
}

export async function sendBulkSms(
  settings: Setting,
  messages: SmsOptions[]
): Promise<{ sent: number; failed: number; errors: string[] }> {
  // Send SMS in batches to avoid rate limiting
  const batchSize = 10
  const results: SmsResult[] = []

  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map((msg) => sendSms(settings, msg))
    )
    results.push(...batchResults)

    // Small delay between batches
    if (i + batchSize < messages.length) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  const sent = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length
  const errors = results
    .filter((r) => !r.success && r.error)
    .map((r) => r.error!)

  return { sent, failed, errors }
}

export function formatSmsMessage(options: {
  siteName: string
  title: string
  body: string
  url?: string
}): string {
  const { siteName, title, body, url } = options

  // SMS has a 160 character limit for single segment
  // We'll aim for under 320 chars (2 segments) to keep costs reasonable
  let message = `[${siteName}] ${title}\n${body}`

  if (url) {
    message += `\n${url}`
  }

  // Truncate if too long
  if (message.length > 320) {
    const maxBodyLength = 320 - `[${siteName}] ${title}\n`.length - (url ? `\n${url}`.length : 0) - 3
    const truncatedBody = body.substring(0, maxBodyLength) + '...'
    message = `[${siteName}] ${title}\n${truncatedBody}`
    if (url) {
      message += `\n${url}`
    }
  }

  return message
}
