'use client'

import { useEffect, useState } from 'react'
import './DemoBanner.scss'

export function DemoBanner() {
  const [timeUntilReset, setTimeUntilReset] = useState<string>('')
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false)

  useEffect(() => {
    fetch('/api/demo-status')
      .then((res) => res.json())
      .then((data) => {
        setIsDemoMode(data.isDemoMode)
      })
      .catch(() => {
        setIsDemoMode(false)
      })
  }, [])

  useEffect(() => {
    if (!isDemoMode) return

    const updateTimer = () => {
      fetch('/api/demo-status')
        .then((res) => res.json())
        .then((data) => {
          setTimeUntilReset(data.timeUntilReset)
        })
        .catch(() => {
          setTimeUntilReset('Unknown')
        })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [isDemoMode])

  if (!isDemoMode) return null

  return (
    <div className="demo-banner">
      <div className="demo-banner__content">
        <div className="demo-banner__icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div className="demo-banner__text">
          <strong>Live Demo Mode</strong>
          <span className="demo-banner__separator">•</span>
          Try all features! Data resets in: <strong>{timeUntilReset}</strong>
          <span className="demo-banner__separator">•</span>
          Password changes are disabled
        </div>
      </div>
    </div>
  )
}
