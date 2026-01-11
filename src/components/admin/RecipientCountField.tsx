'use client'

import React, { useEffect, useState } from 'react'
import { useField, useDocumentInfo } from '@payloadcms/ui'
import './RecipientCountField.scss'

export const RecipientCountField: React.FC = () => {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useDocumentInfo() // Hook call required for context
  const channelField = useField<string>({ path: 'channel' })
  const statusField = useField<string>({ path: 'status' })
  const recipientCountField = useField<number>({ path: 'recipientCount' })

  const channel = channelField.value || 'both'
  const status = statusField.value || 'draft'
  const savedCount = recipientCountField.value

  // For sent notifications, show the saved count
  const isSent = status === 'sent'

  useEffect(() => {
    if (isSent) {
      setCount(savedCount || 0)
      return
    }

    // Fetch estimated count based on channel
    const fetchCount = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/subscribers/count?channel=${channel}`)
        if (response.ok) {
          const data = await response.json()
          setCount(data.count)
        }
      } catch (error) {
        console.error('Error fetching recipient count:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCount()
  }, [channel, isSent, savedCount])

  return (
    <div className="recipient-count-field">
      <label className="recipient-count-field__label">
        Recipients
        {!isSent && <span className="recipient-count-field__estimate">(estimated)</span>}
      </label>
      <div className="recipient-count-field__value">
        {loading ? (
          <span className="recipient-count-field__loading">...</span>
        ) : (
          <span className="recipient-count-field__count">{count ?? 0}</span>
        )}
      </div>
      <p className="recipient-count-field__description">
        {isSent 
          ? 'Number of subscribers who received this notification'
          : 'Active subscribers who will receive this notification'
        }
      </p>
    </div>
  )
}
