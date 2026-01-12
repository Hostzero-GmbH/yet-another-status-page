# Notification Workflow

Hostzero Status includes a powerful notification system that automatically creates notification drafts and allows you to review before sending.

## How It Works

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Create/Update   │ ──▶ │  Draft Created   │ ──▶ │  Review & Send   │
│  Incident or     │     │  Automatically   │     │  from Admin      │
│  Maintenance     │     │                  │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

### Automatic Draft Creation

Notification drafts are **automatically created** when:

1. **New Incident Created** - A draft with incident details is created
2. **Incident Updated** - When you add an update to the timeline, a new draft is created
3. **New Maintenance Scheduled** - A draft with schedule details is created
4. **Maintenance Updated** - When you add an update, a new draft is created

### Manual Review & Send

Notifications are **never sent automatically**. You must:

1. Go to **Notifications → Notifications**
2. Review the draft content
3. Edit if needed
4. Click **Send Notification Now**

This gives you full control over what gets sent to subscribers.

## Notification Statuses

| Status | Description |
|--------|-------------|
| **Draft** | Created but not sent. Can be edited. |
| **Scheduled** | Being processed for sending. |
| **Sent** | Successfully delivered to subscribers. |
| **Failed** | Sending failed. Can retry. |

## Notification Channels

Each notification can be sent via:

- **Email** - Sends to email subscribers only
- **SMS** - Sends to SMS subscribers only
- **Both** - Sends to all subscribers

## Email Notifications

### Content

Email notifications include:

- Subject line
- Formatted HTML body
- Call-to-action button linking to the status page
- Unsubscribe link (required for compliance)

### Headers

Emails automatically include:

- `List-Unsubscribe` header for one-click unsubscribe
- `List-Unsubscribe-Post` header for RFC 8058 compliance

### Configuration

Configure SMTP in **Configuration → Email Settings**:

- Enable Email Subscriptions toggle
- SMTP Host, Port, Security
- Authentication credentials
- From address and name

## SMS Notifications

### Content

SMS messages are generated from customizable templates and include:

- Site name prefix
- Emoji indicator (🚨 incident, 🔧 maintenance)
- Title and status
- Scheduled times (for maintenance)
- Link to status page

### Configuration

Configure Twilio in **Configuration → SMS Settings**:

- Enable SMS Subscriptions toggle
- Account SID
- Auth Token
- From phone number OR Messaging Service SID

### SMS Templates

You can customize SMS message templates in **Configuration → SMS Settings** under the "SMS Templates" section. Available placeholders:

- `{{siteName}}` - Your site name
- `{{title}}` - Incident/maintenance title
- `{{status}}` - Current status
- `{{message}}` - Update message
- `{{schedule}}` - Maintenance schedule
- `{{url}}` - Link to the page

Configure **Title Max Length** and **Message Max Length** to control how content is truncated to fit SMS limits.

## Recipient Count

The notification form shows the estimated recipient count based on:

- Selected channel (Email/SMS/Both)
- Active subscribers matching that channel

After sending, it shows the actual number of recipients.

## Retrying Failed Notifications

If a notification fails:

1. The error message is displayed in the notification form
2. The **Retry Send** button allows you to attempt again
3. Fix any configuration issues before retrying

Common failure reasons:

- SMTP not configured
- Twilio not configured
- Invalid credentials
- Network issues

## Best Practices

### Writing Notifications

1. **Be concise** - Get to the point quickly
2. **Include impact** - What services are affected?
3. **Set expectations** - When will it be resolved?
4. **Provide updates** - Keep subscribers informed

### Timing

1. **Send promptly** - Notify as soon as you're aware
2. **Update regularly** - Post updates at least hourly during incidents
3. **Confirm resolution** - Always send a final "resolved" notification

### Testing

1. Create a test subscriber (your email/phone)
2. Create a test incident
3. Send the notification to verify delivery
4. Delete test data when done

## Subscribers

### Managing Subscribers

Go to **Notifications → Subscribers** to:

- View all subscribers
- Add subscribers manually
- Deactivate subscribers
- See subscription type (email/SMS)

### Subscription Types

- **Email** - Requires valid email address
- **SMS** - Requires phone number with country code

### Active vs Inactive

- **Active** - Will receive notifications
- **Inactive** - Opted out or deactivated

Subscribers can unsubscribe via the link in emails, which sets them to inactive.

## Automation & Jobs Queue

Notifications are sent via a background jobs queue:

- Prevents timeouts for large subscriber lists
- Automatic retries on failure (up to 3 attempts)
- Progress tracking in the notification status

The queue processes immediately in development and can be scaled with workers in production.
