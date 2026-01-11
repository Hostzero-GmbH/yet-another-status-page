'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface UnsubscribeClientProps {
  siteName: string
  status: 'active' | 'already-unsubscribed' | 'not-found'
  token: string
  subscriberType?: string
  subscriberContact?: string | null
}

export function UnsubscribeClient({
  siteName,
  status,
  token,
  subscriberType,
  subscriberContact,
}: UnsubscribeClientProps) {
  const [isUnsubscribing, setIsUnsubscribing] = useState(false)
  const [result, setResult] = useState<'success' | 'error' | null>(null)

  const handleUnsubscribe = async () => {
    setIsUnsubscribing(true)
    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        setResult('success')
      } else {
        setResult('error')
      }
    } catch {
      setResult('error')
    } finally {
      setIsUnsubscribing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-xl border border-border p-8 text-center">
        {status === 'not-found' && (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Invalid Unsubscribe Link
            </h1>
            <p className="text-muted-foreground mb-6">
              This unsubscribe link is invalid or has expired. If you need to unsubscribe,
              please use the link from a recent notification email.
            </p>
          </>
        )}

        {status === 'already-unsubscribed' && (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Already Unsubscribed
            </h1>
            <p className="text-muted-foreground mb-6">
              You have already been unsubscribed from {siteName} status updates.
            </p>
          </>
        )}

        {status === 'active' && result === null && (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-status-maintenance/10 flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-status-maintenance" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Unsubscribe from Updates
            </h1>
            <p className="text-muted-foreground mb-2">
              Are you sure you want to stop receiving {subscriberType} notifications from{' '}
              <strong>{siteName}</strong>?
            </p>
            {subscriberContact && (
              <p className="text-sm text-muted-foreground mb-6">
                {subscriberType === 'email' ? 'Email' : 'Phone'}: {subscriberContact}
              </p>
            )}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleUnsubscribe}
                disabled={isUnsubscribing}
                className="w-full py-3 px-4 rounded-lg bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUnsubscribing ? 'Unsubscribing...' : 'Yes, Unsubscribe Me'}
              </button>
              <Link
                href="/"
                className="w-full py-3 px-4 rounded-lg border border-border text-foreground font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </Link>
            </div>
          </>
        )}

        {result === 'success' && (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-status-operational/10 flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-status-operational" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Successfully Unsubscribed
            </h1>
            <p className="text-muted-foreground mb-6">
              You will no longer receive status updates from {siteName}.
              You can resubscribe at any time from our status page.
            </p>
          </>
        )}

        {result === 'error' && (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Something Went Wrong
            </h1>
            <p className="text-muted-foreground mb-6">
              We couldn&apos;t process your unsubscribe request. Please try again later.
            </p>
          </>
        )}

        <Link
          href="/"
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          ← Return to Status Page
        </Link>
      </div>
    </div>
  )
}
