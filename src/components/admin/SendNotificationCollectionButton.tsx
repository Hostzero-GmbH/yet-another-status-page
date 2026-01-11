'use client'

import React, { useState } from 'react'
import { useDocumentInfo, useField } from '@payloadcms/ui'
import './SendNotificationButton.scss'

export const SendNotificationCollectionButton: React.FC = () => {
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const { id } = useDocumentInfo()
  const statusField = useField<string>({ path: 'status' })
  const channelField = useField<string>({ path: 'channel' })
  const subjectField = useField<string>({ path: 'subject' })
  const emailBodyField = useField<string>({ path: 'emailBody' })
  const smsBodyField = useField<string>({ path: 'smsBody' })

  const errorMessageField = useField<string>({ path: 'errorMessage' })

  const status = statusField.value
  const channel = channelField.value
  const subject = subjectField.value
  const emailBody = emailBodyField.value
  const smsBody = smsBodyField.value
  const savedError = errorMessageField.value

  const isSent = status === 'sent'
  const isFailed = status === 'failed'
  const isDraft = status === 'draft'

  // Validate that we have content to send
  const hasEmailContent = channel !== 'sms' && subject && emailBody
  const hasSmsContent = channel !== 'email' && smsBody
  const hasContent = hasEmailContent || hasSmsContent

  const handleSend = async () => {
    if (!id || (!isDraft && !isFailed)) return

    setSending(true)
    setResult(null)

    try {
      const response = await fetch('/api/notifications/send-from-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: `Sent to ${data.totalRecipients} subscriber(s)`,
        })
        // Reload the page to reflect the updated status
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to send notification',
        })
      }
    } catch (_error) {
      setResult({
        success: false,
        message: 'Network error - please try again',
      })
    } finally {
      setSending(false)
    }
  }

  if (!id) {
    return (
      <div className="send-notification-button">
        <div className="send-notification-button__info">
          Save the notification first before sending.
        </div>
      </div>
    )
  }

  if (isSent) {
    return (
      <div className="send-notification-button">
        <div className="send-notification-button__sent">
          ✓ Notification sent successfully
        </div>
      </div>
    )
  }

  return (
    <div className="send-notification-button">
      {/* Show saved error from previous failed attempt */}
      {isFailed && savedError && (
        <div className="send-notification-button__result send-notification-button__result--error">
          <strong>Send failed:</strong> {savedError}
        </div>
      )}

      {!hasContent && (isDraft || isFailed) && (
        <div className="send-notification-button__warning">
          Add {channel === 'email' ? 'subject and email body' : channel === 'sms' ? 'SMS message' : 'message content'} before sending.
        </div>
      )}

      {result && (
        <div className={`send-notification-button__result ${result.success ? 'send-notification-button__result--success' : 'send-notification-button__result--error'}`}>
          {result.message}
        </div>
      )}

      <button
        type="button"
        className="send-notification-button__button"
        onClick={handleSend}
        disabled={sending || (!isDraft && !isFailed) || !hasContent}
      >
        {sending ? (
          <>
            <span className="send-notification-button__spinner" />
            Sending...
          </>
        ) : (
          <>
            <svg className="send-notification-button__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
            {isFailed ? 'Retry Send' : 'Send Notification Now'}
          </>
        )}
      </button>
    </div>
  )
}
