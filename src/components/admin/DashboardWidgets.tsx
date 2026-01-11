'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import './DashboardWidgets.scss'

interface WidgetData {
  pendingNotifications: number
  scheduledNotifications: number
  emailSubscribers: number
  smsSubscribers: number
  activeIncidents: number
  upcomingMaintenances: number
}

export const DashboardWidgets: React.FC = () => {
  const [data, setData] = useState<WidgetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard-stats')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats')
        }
        const stats = await response.json()
        setData(stats)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="dashboard-widgets">
        <div className="dashboard-widgets__loading">Loading dashboard stats...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-widgets">
        <div className="dashboard-widgets__error">Failed to load stats: {error}</div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="dashboard-widgets">
      <h2 className="dashboard-widgets__title">Status Overview</h2>
      
      <div className="dashboard-widgets__grid">
        {/* Active Incidents */}
        <Link href="/admin/collections/incidents" className="dashboard-widget dashboard-widget--incidents">
          <div className="dashboard-widget__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="dashboard-widget__content">
            <div className="dashboard-widget__value">{data.activeIncidents}</div>
            <div className="dashboard-widget__label">Active Incidents</div>
          </div>
        </Link>

        {/* Upcoming Maintenances */}
        <Link href="/admin/collections/maintenances" className="dashboard-widget dashboard-widget--maintenances">
          <div className="dashboard-widget__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          </div>
          <div className="dashboard-widget__content">
            <div className="dashboard-widget__value">{data.upcomingMaintenances}</div>
            <div className="dashboard-widget__label">Upcoming Maintenances</div>
          </div>
        </Link>

        {/* Pending Notifications */}
        <Link href="/admin/collections/notifications?where[status][equals]=draft" className="dashboard-widget dashboard-widget--pending">
          <div className="dashboard-widget__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div className="dashboard-widget__content">
            <div className="dashboard-widget__value">{data.pendingNotifications}</div>
            <div className="dashboard-widget__label">Draft Notifications</div>
          </div>
        </Link>

        {/* Scheduled Notifications */}
        <Link href="/admin/collections/notifications?where[status][equals]=scheduled" className="dashboard-widget dashboard-widget--scheduled">
          <div className="dashboard-widget__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="dashboard-widget__content">
            <div className="dashboard-widget__value">{data.scheduledNotifications}</div>
            <div className="dashboard-widget__label">Scheduled</div>
          </div>
        </Link>

        {/* Email Subscribers */}
        <Link href="/admin/collections/subscribers?where[type][equals]=email" className="dashboard-widget dashboard-widget--email">
          <div className="dashboard-widget__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div className="dashboard-widget__content">
            <div className="dashboard-widget__value">{data.emailSubscribers}</div>
            <div className="dashboard-widget__label">Email Subscribers</div>
          </div>
        </Link>

        {/* SMS Subscribers */}
        <Link href="/admin/collections/subscribers?where[type][equals]=sms" className="dashboard-widget dashboard-widget--sms">
          <div className="dashboard-widget__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </div>
          <div className="dashboard-widget__content">
            <div className="dashboard-widget__value">{data.smsSubscribers}</div>
            <div className="dashboard-widget__label">SMS Subscribers</div>
          </div>
        </Link>
      </div>
    </div>
  )
}
