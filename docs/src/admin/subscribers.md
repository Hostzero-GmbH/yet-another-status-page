# Managing Subscribers

Subscribers receive notifications about incidents and maintenance windows.

## Subscription Types

| Type | Description |
|------|-------------|
| **Email** | Receives notifications via email |
| **SMS** | Receives notifications via text message |

Each subscriber has one type. Users who want both should create two subscriptions.

## Adding Subscribers

### Manual Addition

1. Go to **Notifications → Subscribers**
2. Click **Create New**
3. Fill in:
   - **Type** - Email or SMS
   - **Email** - Email address (for email type)
   - **Phone** - Phone number with country code (for SMS type)
   - **Verified** - Whether the subscription is verified
   - **Active** - Whether to send notifications
4. Click **Save**

### Public Subscription

Users can subscribe via the public status page:

1. Click the "Subscribe" button on the status page
2. Enter their email or phone number
3. They appear in the Subscribers list

## Subscriber Fields

| Field | Description |
|-------|-------------|
| Type | Email or SMS |
| Email | Email address (for email subscribers) |
| Phone | Phone number with country code (for SMS) |
| Verified | Whether the subscription is verified |
| Active | Whether to receive notifications |
| Verification Token | Auto-generated token for verification |
| Unsubscribe Token | Auto-generated token for unsubscribe links |

## Active vs Inactive

- **Active** - Subscriber will receive notifications
- **Inactive** - Subscriber will NOT receive notifications

Subscribers become inactive when:

- They click the unsubscribe link in an email
- An admin manually deactivates them

## Unsubscribe Flow

Each email includes an unsubscribe link:

```
https://status.example.com/unsubscribe/{token}
```

When clicked:

1. User sees a confirmation message
2. Subscription is set to inactive
3. They no longer receive notifications

The unsubscribe link is unique per subscriber and doesn't expire.

## Phone Number Format

SMS phone numbers must include the country code:

- ✅ `+14155551234` (US)
- ✅ `+442071234567` (UK)
- ✅ `+33123456789` (France)
- ❌ `415-555-1234` (missing country code)
- ❌ `(415) 555-1234` (missing country code)

## Verification

The **Verified** field indicates whether the email/phone has been confirmed. 

For manually added subscribers, you can set this to true if you've verified the contact information.

## Bulk Operations

To deactivate multiple subscribers:

1. Select subscribers in the list view
2. Use bulk actions to update

## Privacy Considerations

- Store only necessary contact information
- Provide easy unsubscribe options
- Respect unsubscribe requests immediately
- Consider data retention policies
