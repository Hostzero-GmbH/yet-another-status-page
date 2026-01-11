import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()

    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Missing unsubscribe token' },
        { status: 400 }
      )
    }

    // Find subscriber by token
    const result = await payload.find({
      collection: 'subscribers',
      where: {
        unsubscribeToken: {
          equals: token,
        },
      },
      limit: 1,
    })

    const subscriber = result.docs[0]

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe token' },
        { status: 404 }
      )
    }

    if (!subscriber.active) {
      return NextResponse.json({
        success: true,
        message: 'Already unsubscribed',
      })
    }

    // Deactivate the subscriber
    await payload.update({
      collection: 'subscribers',
      id: subscriber.id,
      data: {
        active: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed',
    })
  } catch (error) {
    console.error('Error processing unsubscribe:', error)
    return NextResponse.json(
      { error: 'Failed to process unsubscribe request' },
      { status: 500 }
    )
  }
}
