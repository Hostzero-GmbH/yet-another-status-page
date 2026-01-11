# Managing Incidents

Incidents represent unplanned service disruptions or issues affecting your infrastructure.

## Creating an Incident

1. Go to **Status → Incidents**
2. Click **Create New**
3. Fill in the incident details:
   - **Title** - Brief description (e.g., "API Gateway Latency Issues")
   - **Affected Services** - Select impacted services
   - **Status** - Current investigation status
   - **Impact** - Severity level
4. Click **Save**

A notification draft is automatically created when you save.

## Incident Statuses

| Status | Description |
|--------|-------------|
| **Investigating** | Issue detected, investigating cause |
| **Identified** | Root cause identified, working on fix |
| **Monitoring** | Fix applied, monitoring for stability |
| **Resolved** | Issue fully resolved |

### Status Flow

```
Investigating → Identified → Monitoring → Resolved
```

You can skip statuses if appropriate (e.g., go directly to Resolved for quick fixes).

## Impact Levels

| Impact | Description | Display |
|--------|-------------|---------|
| Operational | No user impact (informational) | 🟢 Green |
| Degraded Performance | Slower than normal | 🟡 Yellow |
| Partial Outage | Some functionality unavailable | 🟠 Orange |
| Major Outage | Service completely unavailable | 🔴 Red |

## Adding Updates

As the incident progresses, add updates to the timeline:

1. Open the incident
2. Scroll to **Updates**
3. Click **Add Update**
4. Fill in:
   - **Status** - Current status
   - **Message** - Update details
   - **Created At** - When this update occurred
5. Click **Save**

A new notification draft is automatically created for each update.

## Resolving an Incident

1. Open the incident
2. Change **Status** to "Resolved"
3. The **Resolved At** timestamp is automatically set
4. Click **Save**
5. Review and send the final notification

## Incident Permalinks

Each incident gets a unique short ID (e.g., `abc123`) that creates a permanent link:

```
https://status.example.com/i/abc123
```

This link is included in notifications and remains valid even if the title changes.

## Best Practices

### Titles

- Be specific but concise
- Include the affected component
- Avoid blame or technical jargon

Good: "Payment Processing Delays"
Bad: "Database server crashed due to OOM killer"

### Updates

- Post updates every 30-60 minutes during active incidents
- Be honest about what you know and don't know
- Set expectations for next update

### Resolution

- Confirm the issue is fully resolved before closing
- Include a brief summary of what happened
- Thank users for their patience

## Example Timeline

```
┌─────────────────────────────────────────────────────────────┐
│ API Gateway Latency Issues                                  │
├─────────────────────────────────────────────────────────────┤
│ 🟡 Investigating - 10:00 AM                                 │
│    We are investigating reports of slow API responses.      │
├─────────────────────────────────────────────────────────────┤
│ 🟡 Identified - 10:30 AM                                    │
│    Root cause identified as a misconfigured load balancer.  │
│    Our team is implementing a fix.                          │
├─────────────────────────────────────────────────────────────┤
│ 🟢 Monitoring - 11:00 AM                                    │
│    Fix deployed. We are monitoring for stability.           │
├─────────────────────────────────────────────────────────────┤
│ 🟢 Resolved - 11:30 AM                                      │
│    This incident has been resolved. API response times      │
│    have returned to normal.                                 │
└─────────────────────────────────────────────────────────────┘
```
