import twilio from 'twilio'
import Debug from 'debug'
import type { SmsSetting } from '@/payload-types'

const debug = Debug('twilio:sms')

interface SmsOptions {
  to: string
  body: string
}

interface SmsResult {
  success: boolean
  messageId?: string
  error?: string
}

export function createTwilioClient(smsSettings: SmsSetting) {
  if (!smsSettings.twilioAccountSid || !smsSettings.twilioAuthToken) {
    throw new Error('Twilio not configured: missing Account SID or Auth Token')
  }

  return twilio(smsSettings.twilioAccountSid, smsSettings.twilioAuthToken)
}

export async function sendSms(
  smsSettings: SmsSetting,
  options: SmsOptions
): Promise<SmsResult> {
  try {
    if (!smsSettings.twilioFromNumber && !smsSettings.twilioMessagingServiceSid) {
      throw new Error('Twilio not configured: need either a From Phone Number or Messaging Service SID')
    }

    const client = createTwilioClient(smsSettings)

    // Use Messaging Service SID if available, otherwise use from number
    const messageOptions: { to: string; body: string; from?: string; messagingServiceSid?: string } = {
      to: options.to,
      body: options.body,
    }

    if (smsSettings.twilioMessagingServiceSid) {
      messageOptions.messagingServiceSid = smsSettings.twilioMessagingServiceSid
    } else {
      messageOptions.from = smsSettings.twilioFromNumber!
    }

    // Debug logging for Twilio requests
    const authTokenPreview = smsSettings.twilioAuthToken ? smsSettings.twilioAuthToken.substring(0, 2) + '...' : 'none'
    debug('Sending SMS: %O', {
      accountSid: smsSettings.twilioAccountSid,
      authTokenPreview,
      to: messageOptions.to,
      from: messageOptions.from || undefined,
      messagingServiceSid: messageOptions.messagingServiceSid || undefined,
      bodyLength: messageOptions.body.length,
      bodyPreview: messageOptions.body.substring(0, 50) + (messageOptions.body.length > 50 ? '...' : ''),
    })

    const message = await client.messages.create(messageOptions)

    debug('SMS sent successfully: %O', {
      messageSid: message.sid,
      status: message.status,
    })

    return {
      success: true,
      messageId: message.sid,
    }
  } catch (error) {
    debug('SMS send error: %O', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending SMS',
    }
  }
}

export async function sendBulkSms(
  smsSettings: SmsSetting,
  messages: SmsOptions[]
): Promise<{ sent: number; failed: number; errors: string[] }> {
  // Send SMS in batches to avoid rate limiting
  const batchSize = 10
  const results: SmsResult[] = []

  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map((msg) => sendSms(smsSettings, msg))
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

export function formatSmsMessage(body: string): string {
  // SMS has a 160 character limit for single segment
  // Truncate at 320 chars (2 segments) to keep costs reasonable
  if (body.length > 320) {
    return body.substring(0, 317) + '...'
  }
  return body
}
