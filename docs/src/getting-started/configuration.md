# Configuration

Hostzero Status is configured through environment variables and the admin panel.

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URI` | PostgreSQL connection string | `postgres://user:pass@host:5432/db` |
| `PAYLOAD_SECRET` | Secret key for encryption (min 32 chars) | `your-super-secret-key-here-32ch` |
| `SERVER_URL` | Public URL of your status page | `https://status.example.com` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `production` |

### SSO/OIDC Authentication (Optional)

Enable Single Sign-On with any OIDC-compliant identity provider (Keycloak, Okta, Auth0, Azure AD, Google).

| Variable | Description | Default |
|----------|-------------|---------|
| `OIDC_CLIENT_ID` | OAuth2 client ID | - |
| `OIDC_CLIENT_SECRET` | OAuth2 client secret | - |
| `OIDC_AUTH_URL` | Authorization endpoint | - |
| `OIDC_TOKEN_URL` | Token endpoint | - |
| `OIDC_USERINFO_URL` | User info endpoint | - |
| `OIDC_SCOPES` | OAuth scopes | `openid profile email` |
| `OIDC_AUTO_CREATE` | Create users on first login | `true` |
| `OIDC_ALLOWED_GROUPS` | Comma-separated list of allowed groups | (allow all) |
| `OIDC_GROUP_CLAIM` | Claim name containing groups | `groups` |
| `OIDC_DISABLE_LOCAL_LOGIN` | Disable password login (SSO-only) | `false` |

#### Provider-Specific URLs

**Keycloak:**
```env
OIDC_AUTH_URL=https://keycloak.example.com/realms/{realm}/protocol/openid-connect/auth
OIDC_TOKEN_URL=https://keycloak.example.com/realms/{realm}/protocol/openid-connect/token
OIDC_USERINFO_URL=https://keycloak.example.com/realms/{realm}/protocol/openid-connect/userinfo
```

**Okta:**
```env
OIDC_AUTH_URL=https://{domain}.okta.com/oauth2/default/v1/authorize
OIDC_TOKEN_URL=https://{domain}.okta.com/oauth2/default/v1/token
OIDC_USERINFO_URL=https://{domain}.okta.com/oauth2/default/v1/userinfo
```

**Auth0:**
```env
OIDC_AUTH_URL=https://{tenant}.auth0.com/authorize
OIDC_TOKEN_URL=https://{tenant}.auth0.com/oauth/token
OIDC_USERINFO_URL=https://{tenant}.auth0.com/userinfo
```

**Azure AD:**
```env
OIDC_AUTH_URL=https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize
OIDC_TOKEN_URL=https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token
OIDC_USERINFO_URL=https://graph.microsoft.com/oidc/userinfo
```

**Google:**
```env
OIDC_AUTH_URL=https://accounts.google.com/o/oauth2/v2/auth
OIDC_TOKEN_URL=https://oauth2.googleapis.com/token
OIDC_USERINFO_URL=https://openidconnect.googleapis.com/v1/userinfo
```

#### Callback URL

When configuring your identity provider, set the callback/redirect URL to:
```
https://your-status-page.com/api/users/oauth/callback
```

#### Group-Based Access Control

To restrict access to specific groups from your identity provider:

1. Configure your IdP to include group claims in the userinfo response
2. Set `OIDC_ALLOWED_GROUPS` to a comma-separated list of allowed groups
3. If your IdP uses a different claim name, set `OIDC_GROUP_CLAIM`

**Example Keycloak Setup:**

1. Create a client scope named "groups" with a **Group Membership** mapper:
   - Token Claim Name: `groups`
   - Add to userinfo: On
2. Add the scope to your client
3. Configure the status page:

```env
OIDC_SCOPES=openid profile email groups
OIDC_ALLOWED_GROUPS=status-page-admins,status-page-editors
```

#### SSO-Only Mode

To disable password login and require SSO for all users:

```env
OIDC_DISABLE_LOCAL_LOGIN=true
```

> **Warning**: Ensure SSO is working correctly before enabling this option, or you may lock yourself out!

## Admin Panel Settings

The admin panel has three configuration sections under **Configuration**:

### Site Settings

Access **Configuration → Site Settings** to configure:

- **Site Name**: Displayed in the header and emails
- **Site Description**: Meta description for SEO
- **Favicon**: Custom favicon for your status page
- **Logos**: Light and dark theme logos
- **SEO**: Meta titles and descriptions
- **Status Override**: Maintenance mode and custom messages

### Email Settings

Access **Configuration → Email Settings** to configure email notifications:

| Setting | Description |
|---------|-------------|
| Enable Email Subscriptions | Allow users to subscribe via email |
| SMTP Host | Your mail server hostname |
| SMTP Port | Usually 587 (TLS) or 465 (SSL) |
| SMTP Security | None, TLS, or SSL |
| SMTP Username | Authentication username |
| SMTP Password | Authentication password |
| From Address | Sender email address |
| From Name | Sender display name |
| Reply-To | Reply-to address (optional) |

### SMS Settings

Access **Configuration → SMS Settings** to configure SMS notifications:

| Setting | Description |
|---------|-------------|
| Enable SMS Subscriptions | Allow users to subscribe via SMS |
| Account SID | Your Twilio Account SID |
| Auth Token | Your Twilio Auth Token |
| From Number | Your Twilio phone number (required if not using Messaging Service) |
| Messaging Service SID | Alternative to From Number for better deliverability |

#### SMS Templates

You can customize the SMS message templates with these placeholders:

| Placeholder | Description |
|-------------|-------------|
| `{{siteName}}` | Your site name from Site Settings |
| `{{title}}` | Incident or maintenance title |
| `{{status}}` | Current status (e.g., Investigating, Resolved) |
| `{{message}}` | Update message content |
| `{{schedule}}` | Maintenance schedule (maintenance only) |
| `{{url}}` | Link to the incident/maintenance page |

Available templates:
- **New Incident Template** - For initial incident notifications
- **Incident Update Template** - For incident status updates
- **New Maintenance Template** - For scheduled maintenance announcements
- **Maintenance Update Template** - For maintenance status updates

You can also configure **Title Max Length** and **Message Max Length** to control truncation.

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
