import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { EmailSetting, SmsSetting } from '@/payload-types'

// Rate limit configuration: 5 subscription attempts per IP per hour
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_HOURS = 1

function isEmailConfigured(emailSettings: EmailSetting): boolean {
  return Boolean(
    emailSettings.smtpHost &&
    emailSettings.smtpFromAddress &&
    emailSettings.enabled
  )
}

function isSmsConfigured(smsSettings: SmsSetting): boolean {
  return Boolean(
    smsSettings.twilioAccountSid &&
    smsSettings.twilioAuthToken &&
    (smsSettings.twilioFromNumber || smsSettings.twilioMessagingServiceSid) &&
    smsSettings.enabled
  )
}

/**
 * Get client IP address from request headers
 */
function getClientIp(request: NextRequest): string {
  // Check common headers for real IP behind proxies
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback - in production behind a proxy this shouldn't happen
  return 'unknown'
}

/**
 * Check rate limit using database
 * Returns the count of subscriptions from this IP in the time window
 */
async function checkDatabaseRateLimit(
  payload: Awaited<ReturnType<typeof getPayload>>,
  ipAddress: string
): Promise<{ allowed: boolean; count: number; resetTime: Date }> {
  const windowStart = new Date()
  windowStart.setHours(windowStart.getHours() - RATE_LIMIT_WINDOW_HOURS)

  // Count subscriptions from this IP in the rate limit window
  const result = await payload.count({
    collection: 'subscribers',
    where: {
      ipAddress: {
        equals: ipAddress,
      },
      createdAt: {
        greater_than: windowStart.toISOString(),
      },
    },
  })

  const resetTime = new Date()
  resetTime.setHours(resetTime.getHours() + RATE_LIMIT_WINDOW_HOURS)

  return {
    allowed: result.totalDocs < RATE_LIMIT_MAX,
    count: result.totalDocs,
    resetTime,
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const clientIp = getClientIp(request)

    // Database-based rate limiting
    const rateLimit = await checkDatabaseRateLimit(payload, clientIp)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many subscription attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetTime.getTime() - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetTime.getTime()),
          },
        }
      )
    }

    const body = await request.json()
    const { type, email, phone } = body

    // Validate input
    if (!type || !['email', 'sms'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid subscription type' },
        { status: 400 }
      )
    }

    // Fetch email and SMS settings
    const emailSettings = await payload.findGlobal({
      slug: 'email-settings',
    }) as EmailSetting
    const smsSettings = await payload.findGlobal({
      slug: 'sms-settings',
    }) as SmsSetting

    if (type === 'email') {
      // Check if SMTP is configured
      if (!isEmailConfigured(emailSettings)) {
        return NextResponse.json(
          { error: 'Email notifications are not available. Please contact the administrator.' },
          { status: 503 }
        )
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email address' },
          { status: 400 }
        )
      }

      // Check if email already exists
      const existing = await payload.find({
        collection: 'subscribers',
        where: {
          email: {
            equals: email,
          },
          type: {
            equals: 'email',
          },
        },
      })

      if (existing.docs.length > 0) {
        return NextResponse.json(
          { error: 'This email is already subscribed' },
          { status: 409 }
        )
      }

      // Create subscriber with IP address
      await payload.create({
        collection: 'subscribers',
        data: {
          type: 'email',
          email,
          verified: false,
          active: true,
          ipAddress: clientIp,
        },
      })
    } else if (type === 'sms') {
      // Check if SMS is configured
      if (!isSmsConfigured(smsSettings)) {
        return NextResponse.json(
          { error: 'SMS notifications are not available. Please contact the administrator.' },
          { status: 503 }
        )
      }

      if (!phone || !/^\+?[1-9]\d{6,14}$/.test(phone)) {
        return NextResponse.json(
          { error: 'Invalid phone number' },
          { status: 400 }
        )
      }

      // Check if phone already exists
      const existing = await payload.find({
        collection: 'subscribers',
        where: {
          phone: {
            equals: phone,
          },
          type: {
            equals: 'sms',
          },
        },
      })

      if (existing.docs.length > 0) {
        return NextResponse.json(
          { error: 'This phone number is already subscribed' },
          { status: 409 }
        )
      }

      // Create subscriber with IP address
      await payload.create({
        collection: 'subscribers',
        data: {
          type: 'sms',
          phone,
          verified: false,
          active: true,
          ipAddress: clientIp,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully subscribed via ${type}`,
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

// GET endpoint to check subscription availability
export async function GET() {
  try {
    const payload = await getPayload({ config })
    const emailSettings = await payload.findGlobal({
      slug: 'email-settings',
    }) as EmailSetting
    const smsSettings = await payload.findGlobal({
      slug: 'sms-settings',
    }) as SmsSetting

    return NextResponse.json({
      email: isEmailConfigured(emailSettings),
      sms: isSmsConfigured(smsSettings),
    })
  } catch (error) {
    console.error('Error checking subscription availability:', error)
    return NextResponse.json(
      { error: 'Failed to check subscription availability' },
      { status: 500 }
    )
  }
}
