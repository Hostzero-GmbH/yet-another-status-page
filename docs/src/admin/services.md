# Managing Services

Services represent the components of your infrastructure that you want to display on the status page.

## Service Groups

Service groups organize related services together.

### Creating a Service Group

1. Go to **Status → Service Groups**
2. Click **Create New**
3. Enter a name (e.g., "Core Infrastructure", "API Services")
4. Optionally add a description
5. Click **Save**

### Ordering Groups

Drag and drop service groups to reorder them on the status page.

## Services

Services are individual components within a group.

### Creating a Service

1. Go to **Status → Services**
2. Click **Create New**
3. Fill in:
   - **Name** - Display name (e.g., "API Gateway")
   - **Description** - Brief description
   - **Service Group** - Which group it belongs to
   - **Status** - Current operational status
4. Click **Save**

### Service Statuses

| Status | Color | Description |
|--------|-------|-------------|
| Operational | 🟢 Green | Service is working normally |
| Degraded Performance | 🟡 Yellow | Service is slow or partially impaired |
| Partial Outage | 🟠 Orange | Some functionality unavailable |
| Major Outage | 🔴 Red | Service is completely unavailable |
| Under Maintenance | 🔵 Blue | Service is undergoing planned maintenance |

### Automatic Status Updates

Service status is automatically updated when:

- An incident is created affecting the service
- An incident is resolved
- A maintenance window starts or ends

You can also manually update the status at any time.

## Best Practices

### Naming

- Use clear, user-facing names
- Avoid internal jargon
- Be consistent with naming conventions

### Grouping

- Group by function (e.g., "Core", "APIs", "Integrations")
- Keep groups manageable (5-10 services each)
- Consider your users' perspective

### Granularity

- Not too broad (users need to know what's affected)
- Not too narrow (too many services is overwhelming)
- Aim for 10-30 total services for most deployments
