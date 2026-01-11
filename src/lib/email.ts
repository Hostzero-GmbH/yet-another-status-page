import nodemailer from 'nodemailer'
import type { Setting } from '@/payload-types'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  unsubscribeUrl?: string
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function createTransporter(settings: Setting) {
  if (!settings.smtpHost || !settings.smtpFromAddress) {
    throw new Error('SMTP not configured: missing host or from address')
  }

  const secure = settings.smtpSecure === 'ssl'
  const port = settings.smtpPort || (secure ? 465 : 587)

  return nodemailer.createTransport({
    host: settings.smtpHost,
    port,
    secure,
    auth: settings.smtpUsername ? {
      user: settings.smtpUsername,
      pass: settings.smtpPassword || '',
    } : undefined,
    tls: settings.smtpSecure === 'tls' ? {
      // In production, consider setting this to true for security
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    } : undefined,
  })
}

export async function sendEmail(
  settings: Setting,
  options: EmailOptions
): Promise<EmailResult> {
  try {
    const transporter = await createTransporter(settings)

    const fromName = settings.smtpFromName || settings.siteName || 'Status Page'
    const from = `"${fromName}" <${settings.smtpFromAddress}>`

    const headers: Record<string, string> = {}
    
    // Add unsubscribe headers for better deliverability
    if (options.unsubscribeUrl) {
      headers['List-Unsubscribe'] = `<${options.unsubscribeUrl}>`
      headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click'
    }

    const result = await transporter.sendMail({
      from,
      to: options.to,
      replyTo: settings.smtpReplyTo || settings.smtpFromAddress || undefined,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
      headers,
    })

    return {
      success: true,
      messageId: result.messageId,
    }
  } catch (error) {
    console.error('Email send error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email',
    }
  }
}

export async function sendBulkEmails(
  settings: Setting,
  emails: EmailOptions[]
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = await Promise.all(
    emails.map((email) => sendEmail(settings, email))
  )

  const sent = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length
  const errors = results
    .filter((r) => !r.success && r.error)
    .map((r) => r.error!)

  return { sent, failed, errors }
}

export function generateEmailHtml(options: {
  siteName: string
  title: string
  body: string
  ctaText?: string
  ctaUrl?: string
  unsubscribeUrl?: string
  siteUrl: string
  logoUrl?: string
}): string {
  const { siteName, title, body, ctaText, ctaUrl, unsubscribeUrl, siteUrl, logoUrl } = options

  // Build absolute logo URL if it's a relative path
  const absoluteLogoUrl = logoUrl 
    ? (logoUrl.startsWith('http') ? logoUrl : `${siteUrl}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`)
    : null

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid #eee;
    }
    .logo-img {
      max-width: 200px;
      max-height: 60px;
      height: auto;
    }
    .logo-text {
      font-size: 24px;
      font-weight: bold;
      color: #111;
    }
    .title {
      font-size: 20px;
      font-weight: 600;
      color: #111;
      margin-bottom: 16px;
    }
    .body {
      color: #444;
      white-space: pre-wrap;
    }
    .cta {
      display: inline-block;
      margin-top: 24px;
      padding: 12px 24px;
      background-color: #0066cc;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
    }
    .cta:hover {
      background-color: #0052a3;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #eee;
      text-align: center;
      font-size: 12px;
      color: #888;
    }
    .footer a {
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${absoluteLogoUrl 
        ? `<img src="${absoluteLogoUrl}" alt="${siteName}" class="logo-img" />`
        : `<div class="logo-text">${siteName}</div>`
      }
    </div>
    <div class="title">${title}</div>
    <div class="body">${body.replace(/\n/g, '<br>')}</div>
    ${ctaText && ctaUrl ? `
    <div style="text-align: center;">
      <a href="${ctaUrl}" class="cta">${ctaText}</a>
    </div>
    ` : ''}
    <div class="footer">
      <p>This email was sent from <a href="${siteUrl}">${siteName}</a></p>
      ${unsubscribeUrl ? `<p><a href="${unsubscribeUrl}">Unsubscribe from status updates</a></p>` : ''}
    </div>
  </div>
</body>
</html>
`
}
