import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getIncidentStatus } from '@/collections/Incidents'

export async function GET() {
  try {
    const payload = await getPayload({ config })

    // Fetch all stats in parallel
    const [
      pendingNotifications,
      scheduledNotifications,
      emailSubscribers,
      smsSubscribers,
      allIncidents,
      upcomingMaintenances,
    ] = await Promise.all([
      // Draft notifications
      payload.count({
        collection: 'notifications',
        where: { status: { equals: 'draft' } },
      }),
      // Scheduled notifications
      payload.count({
        collection: 'notifications',
        where: { status: { equals: 'scheduled' } },
      }),
      // Email subscribers (active only)
      payload.count({
        collection: 'subscribers',
        where: {
          and: [
            { type: { equals: 'email' } },
            { active: { equals: true } },
          ],
        },
      }),
      // SMS subscribers (active only)
      payload.count({
        collection: 'subscribers',
        where: {
          and: [
            { type: { equals: 'sms' } },
            { active: { equals: true } },
          ],
        },
      }),
      // Fetch all incidents to compute active count
      // (Incidents don't have a top-level status field - it's derived from updates)
      payload.find({
        collection: 'incidents',
        limit: 0, // We only need docs for filtering, not pagination
      }),
      // Upcoming maintenances
      payload.count({
        collection: 'maintenances',
        where: {
          or: [
            { status: { equals: 'upcoming' } },
            { status: { equals: 'in_progress' } },
          ],
        },
      }),
    ])

    // Count active incidents (status derived from last update, not 'resolved')
    const activeIncidentsCount = allIncidents.docs.filter((incident) => {
      const status = getIncidentStatus(incident.updates as Array<{ status?: string }> | undefined)
      return status !== 'resolved'
    }).length

    return NextResponse.json({
      pendingNotifications: pendingNotifications.totalDocs,
      scheduledNotifications: scheduledNotifications.totalDocs,
      emailSubscribers: emailSubscribers.totalDocs,
      smsSubscribers: smsSubscribers.totalDocs,
      activeIncidents: activeIncidentsCount,
      upcomingMaintenances: upcomingMaintenances.totalDocs,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
