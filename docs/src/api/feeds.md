# Feeds

Both feeds are public, read-only and linked from the status page `<head>` via `<link rel="alternate">`, so feed readers and browsers can discover them automatically.

## Atom feed

```
https://your-status-page.com/feed.atom
```

One entry per incident and per maintenance, newest activity first, limited to the 50 most recently updated items. The entry `<updated>` timestamp moves whenever an item changes (new update, reschedule, status transition), so readers surface changes to existing entries. Entry content is HTML containing the schedule (maintenances), description and the full update timeline.

Works with any feed reader and with chat integrations that consume RSS/Atom (for example the Slack RSS app or Microsoft Teams RSS connector).

## Maintenance calendar (iCalendar)

```
https://your-status-page.com/maintenances.ics
```

An iCalendar (RFC 5545) feed of maintenance windows that can be subscribed to from Google Calendar, Outlook, Apple Calendar or any other client that supports calendar subscriptions.

- Contains all upcoming and in-progress maintenances plus those that started in the last 30 days.
- `DTSTART` / `DTEND` are the scheduled start and end; maintenances without a scheduled end are zero-length events.
- Cancelled maintenances are kept with `STATUS:CANCELLED` so calendars remove or strike them through.
- `UID` is `<shortId>@<host>`, so edits update the existing calendar entry instead of creating duplicates.
- The description contains the maintenance text, affected services, expected duration and the permalink.

Calendar clients typically refresh subscriptions every few hours; the feed advertises a one-hour refresh interval (`X-PUBLISHED-TTL:PT1H`).
