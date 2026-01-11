# Configuration

Hostzero Status is configured through environment variables and the admin panel.

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URI` | PostgreSQL connection string | `postgres://user:pass@host:5432/db` |
| `PAYLOAD_SECRET` | Secret key for encryption (min 32 chars) | `your-super-secret-key-here-32ch` |
| `NEXT_PUBLIC_SERVER_URL` | Public URL of your status page | `https://status.example.com` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `production` |

## Admin Panel Settings

Access **Configuration → Site Settings** in the admin panel to configure:

### General Settings

- **Site Name**: Displayed in the header and emails
- **Site Description**: Meta description for SEO
- **Favicon**: Custom favicon for your status page

### Email Notifications (SMTP)

Configure these to enable email notifications:

| Setting | Description |
|---------|-------------|
| SMTP Host | Your mail server hostname |
| SMTP Port | Usually 587 (TLS) or 465 (SSL) |
| SMTP Security | None, TLS, or SSL |
| SMTP Username | Authentication username |
| SMTP Password | Authentication password |
| From Address | Sender email address |
| From Name | Sender display name |
| Reply-To | Reply-to address (optional) |

### SMS Notifications (Twilio)

Configure these to enable SMS notifications:

| Setting | Description |
|---------|-------------|
| Account SID | Your Twilio Account SID |
| Auth Token | Your Twilio Auth Token |
| From Number | Your Twilio phone number |

## Testing Notifications

After configuring SMTP or Twilio:

1. Create a test subscriber in **Notifications → Subscribers**
2. Create a test incident in **Status → Incidents**
3. Check the **Notifications** collection for the auto-generated draft
4. Click **Send Notification Now** to test

## Security Recommendations

1. **Use strong secrets**: Generate a random 32+ character string for `PAYLOAD_SECRET`
2. **Use HTTPS**: Always deploy behind HTTPS in production
3. **Secure database**: Use strong passwords and restrict database access
4. **Regular backups**: Schedule regular database backups
