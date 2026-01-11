import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { headers } from 'next/headers'
import config from '@payload-config'
import type { Notification, Incident, Maintenance } from '@/payload-types'

interface SendRequest {
  notificationId: string | number
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Verify user is authenticated
    const headersList = await headers()
    const { user } = await payload.auth({ headers: headersList })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const body: SendRequest = await request.json()

    const { notificationId } = body

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Missing notificationId' },
        { status: 400 }
      )
    }

    // Fetch the notification
    const notification = await payload.findByID({
      collection: 'notifications',
      id: notificationId,
    }) as Notification | null

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    if (notification.status === 'sent') {
      return NextResponse.json(
        { error: 'Notification has already been sent' },
        { status: 400 }
      )
    }

    // Allow retry from failed status
    if (notification.status !== 'draft' && notification.status !== 'failed') {
      return NextResponse.json(
        { error: 'Notification is currently being processed' },
        { status: 400 }
      )
    }

    // Get the related item for the permalink
    const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://status.example.com'
    let itemUrl = siteUrl
    let itemTitle = 'Status Update'

    if (notification.relatedIncident) {
      const incident = typeof notification.relatedIncident === 'object' 
        ? notification.relatedIncident 
        : await payload.findByID({ collection: 'incidents', id: notification.relatedIncident }) as Incident
      
      if (incident) {
        itemTitle = incident.title
        if (incident.shortId) {
          itemUrl = `${siteUrl}/i/${incident.shortId}`
        }
      }
    } else if (notification.relatedMaintenance) {
      const maintenance = typeof notification.relatedMaintenance === 'object'
        ? notification.relatedMaintenance
        : await payload.findByID({ collection: 'maintenances', id: notification.relatedMaintenance }) as Maintenance

      if (maintenance) {
        itemTitle = maintenance.title
        if (maintenance.shortId) {
          itemUrl = `${siteUrl}/m/${maintenance.shortId}`
        }
      }
    }

    // Update status to scheduled
    await payload.update({
      collection: 'notifications',
      id: notificationId,
      data: { status: 'scheduled' },
    })

    // Queue the job
    await payload.jobs.queue({
      task: 'sendNotificationFromCollection',
      input: {
        notificationId: String(notificationId),
        channel: notification.channel || 'email',
        subject: notification.subject || undefined,
        emailBody: notification.emailBody || undefined,
        smsBody: notification.smsBody || undefined,
        itemTitle,
        itemUrl,
      },
    })

    // Run the job and wait for completion
    await payload.jobs.run()

    // Fetch the updated notification to get recipient count
    const updatedNotification = await payload.findByID({
      collection: 'notifications',
      id: notificationId,
    }) as Notification

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      totalRecipients: updatedNotification?.recipientCount || 0,
      status: updatedNotification?.status,
    })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send notification' },
      { status: 500 }
    )
  }
}
