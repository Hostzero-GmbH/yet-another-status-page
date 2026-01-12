# Admin Overview

The Hostzero Status admin panel is powered by Payload CMS and provides a comprehensive interface for managing your status page.

## Dashboard

The dashboard shows at-a-glance metrics:

- **Active Incidents** - Current unresolved incidents
- **Upcoming Maintenances** - Scheduled or in-progress maintenance windows
- **Draft Notifications** - Notifications waiting to be sent
- **Scheduled Notifications** - Notifications being processed
- **Email Subscribers** - Active email subscribers
- **SMS Subscribers** - Active SMS subscribers

## Navigation

The admin panel is organized into sections:

### Status

- **Service Groups** - Logical groupings of services
- **Services** - Individual services to monitor
- **Incidents** - Service disruptions and issues
- **Maintenances** - Scheduled maintenance windows

### Notifications

- **Notifications** - Manage and send notifications
- **Subscribers** - Manage subscriber list

### Admin

- **Users** - Admin user accounts
- **Media** - Uploaded files and images

### Configuration

- **Site Settings** - Site name, branding, SEO, status overrides
- **Email Settings** - SMTP configuration and email subscriptions
- **SMS Settings** - Twilio configuration, SMS subscriptions, and message templates

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│  1. Create Services                                         │
│     Define your infrastructure components                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Incident Occurs                                         │
│     Create incident → Notification draft auto-created       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Review & Send                                           │
│     Go to Notifications → Review → Send                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Add Updates                                             │
│     Post updates → New notification drafts auto-created     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Resolve                                                 │
│     Mark resolved → Final notification                      │
└─────────────────────────────────────────────────────────────┘
```

## Quick Actions

### Creating an Incident

1. Go to **Status → Incidents**
2. Click **Create New**
3. Fill in the title, affected services, status, and impact
4. Click **Save**
5. A notification draft is automatically created

### Scheduling Maintenance

1. Go to **Status → Maintenances**
2. Click **Create New**
3. Set the title, affected services, and schedule
4. Click **Save**
5. A notification draft is automatically created

### Sending Notifications

1. Go to **Notifications → Notifications**
2. Find the draft notification
3. Review and edit the content if needed
4. Click **Send Notification Now**
