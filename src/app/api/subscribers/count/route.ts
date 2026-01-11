import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    const channel = searchParams.get('channel') || 'both'

    let count = 0

    if (channel === 'email' || channel === 'both') {
      const emailCount = await payload.count({
        collection: 'subscribers',
        where: {
          type: { equals: 'email' },
          active: { equals: true },
        },
      })
      count += emailCount.totalDocs
    }

    if (channel === 'sms' || channel === 'both') {
      const smsCount = await payload.count({
        collection: 'subscribers',
        where: {
          type: { equals: 'sms' },
          active: { equals: true },
        },
      })
      count += smsCount.totalDocs
    }

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error counting subscribers:', error)
    return NextResponse.json({ count: 0, error: 'Failed to count subscribers' }, { status: 500 })
  }
}
