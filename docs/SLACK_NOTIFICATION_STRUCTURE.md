# Slack Notification Structure

This document describes the structure of Slack notifications sent by the Website Monitor.

## Overview

Notifications are sent via **Slack Bot Token (Web API)** (preferred) or **Webhook** (legacy). Both methods use the same payload structure.

## Notification Types

### 1. Website Status Notification

Sent when:
- Website goes DOWN
- Status changes (UP → DOWN or DOWN → UP)
- SSL certificate expiring soon (< 30 days)
- First run (counts as status change)

### 2. Test Failure Notification

Sent when:
- A test fails or times out
- Captured via `afterEach` hook in Playwright

### 3. Summary Notification

Sent when:
- All monitoring tests complete
- Provides aggregate statistics

---

## Payload Structure

### Base Structure

```json
{
  "username": "Website Monitor",
  "icon_emoji": ":globe_with_meridians:",
  "attachments": [
    {
      "color": "#36a64f" | "#ff0000",
      "title": "✅ Website Name is UP" | "❌ Website Name is DOWN",
      "fields": [
        // Field array (see below)
      ],
      "footer": "Website Monitor Testmo",
      "ts": 1234567890
    }
  ]
}
```

### Field Structure

Each field in the `fields` array follows this structure:

```json
{
  "title": "Field Name",
  "value": "Field Value",
  "short": true | false
}
```

- `short: true` - Field takes up half width (2 fields per row)
- `short: false` - Field takes full width

---

## Website Status Notification Fields

### Always Present Fields

| Field | Title | Value | Short | Description |
|-------|-------|-------|-------|-------------|
| URL | `🌐 URL` | Website URL | ✅ | The monitored website URL |
| Final URL | `🔗 Final URL` | Final URL after redirects | ✅ | Shows where redirects lead (if different from URL) |
| Page Title | `📄 Page Title` | Page title | ❌ | The page title (if available) |
| Status | `🟢/🔴 Status` | UP or DOWN | ✅ | Website status indicator |
| Status Code | `📊 Status Code` | HTTP status code (e.g., `200`) | ✅ | HTTP response status |
| Load Time | `⏱️ Load Time` | Time in ms (e.g., `1500ms`) | ✅ | Page load time |
| Response Time Trend | `📈 Response Time Trend` | Comparison with previous | ✅ | Faster/Slower/Same than previous check |
| Check Duration | `⏳ Check Duration` | Total check time in ms | ✅ | Total time for the check |
| Check Time | `🕐 Check Time` | Bangkok time (e.g., `2025-11-28 10:15:58 (BKK)`) | ✅ | When the check occurred |

### Conditional Fields

#### Error Information
**Appears when:** `errorMessage` is provided

```json
{
  "title": "Error",
  "value": "Error message (truncated to 500 chars)",
  "short": false
}
```

#### Error Category
**Appears when:** `errorCategory` is provided

```json
{
  "title": "Error Category",
  "value": "NETWORK_ERROR" | "TIMEOUT" | "SSL_ERROR" | etc.,
  "short": true
}
```

#### SSL Certificate
**Appears when:** `sslInfo.valid === false`

```json
{
  "title": "SSL Certificate",
  "value": "⚠️ Invalid certificate or error message",
  "short": true
}
```

#### Redirect Confirmation
**Appears when:** `redirectedToExpected` is not null (redirect is expected in config)

```json
{
  "title": "✅ Redirected to Auth",
  "value": "Yes (Expected)" | "No (Unexpected)",
  "short": true
}
```

#### Status Change
**Appears when:** `changeInfo.changed === true`

```json
{
  "title": "🔴 Status Change",
  "value": "🟢 Recovered" | "🔴 Downtime detected",
  "short": false
}
```

#### Screenshot
**Appears when:** `screenshotPath` is provided

```json
{
  "title": "📸 Screenshot",
  "value": "Saved at: `test-results/screenshots/Website-Name/latest.png`\nView in Testmo dashboard or locally",
  "short": false
}
```

---

## Color Coding

- **Green (`#36a64f`)**: Website is UP
- **Red (`#ff0000`)**: Website is DOWN

---

## Example Notifications

### Example 1: Website UP (First Run)

```json
{
  "username": "Website Monitor",
  "icon_emoji": ":bar_chart:",
  "attachments": [
    {
      "color": "#36a64f",
      "title": "📊 Website Monitoring Results",
      "text": "✅ Website Status: UP - Running Fine!",
      "fields": [
        {
          "title": "🌐 URL",
          "value": "https://start.screencloud.com/",
          "short": true
        },
        {
          "title": "🔗 Final URL",
          "value": "https://auth.screencloud.com/login",
          "short": true
        },
        {
          "title": "📄 Page Title",
          "value": "Login to ScreenCloud",
          "short": false
        },
        {
          "title": "🟢 Status",
          "value": "UP",
          "short": true
        },
        {
          "title": "📊 Status Code",
          "value": "200",
          "short": true
        },
        {
          "title": "⏱️ Load Time",
          "value": "4844ms",
          "short": true
        },
        {
          "title": "📈 Response Time Trend",
          "value": "→ Same as previous check",
          "short": true
        },
        {
          "title": "⏳ Check Duration",
          "value": "5426ms",
          "short": true
        },
        {
          "title": "🕐 Check Time",
          "value": "2025-11-28 10:15:58 (BKK)",
          "short": true
        },
        {
          "title": "✅ Redirected to Auth",
          "value": "Yes (Expected)",
          "short": true
        },
        {
          "title": "📸 Screenshot",
          "value": "Saved at: `test-results/screenshots/ScreenCloud-Start/latest.png`\nView in Testmo dashboard or locally",
          "short": false
        },
        {
          "title": "✅ Website is active and running fine!",
          "value": "",
          "short": false
        }
      ],
      "footer": "Website Monitor Testmo",
      "ts": 1732781758
    }
  ]
}
```

### Example 2: Website DOWN

```json
{
  "username": "Website Monitor",
  "icon_emoji": ":globe_with_meridians:",
  "attachments": [
    {
      "color": "#ff0000",
      "title": "❌ Example Site is DOWN",
      "fields": [
        {
          "title": "URL",
          "value": "https://example.com",
          "short": true
        },
        {
          "title": "Status Code",
          "value": "0",
          "short": true
        },
        {
          "title": "Load Time",
          "value": "N/A",
          "short": true
        },
        {
          "title": "Timestamp",
          "value": "2025-11-28 10:20:00 (BKK)",
          "short": true
        },
        {
          "title": "Error",
          "value": "net::ERR_CONNECTION_REFUSED",
          "short": false
        },
        {
          "title": "Error Category",
          "value": "NETWORK_ERROR",
          "short": true
        },
        {
          "title": "Status Change",
          "value": "🔴 Downtime detected",
          "short": false
        },
        {
          "title": "📸 Screenshot",
          "value": "Saved at: `test-results/screenshots/Example-Site/failure-1732782000000.png`\nView in Testmo dashboard or locally",
          "short": false
        }
      ],
      "footer": "Website Monitor Testmo",
      "ts": 1732782000
    }
  ]
}
```

### Example 3: Test Failure

```json
{
  "username": "Website Monitor",
  "icon_emoji": ":globe_with_meridians:",
  "attachments": [
    {
      "color": "#ff0000",
      "title": "❌ Test Failed: ScreenCloud Start",
      "fields": [
        {
          "title": "URL",
          "value": "https://start.screencloud.com/",
          "short": true
        },
        {
          "title": "Status Code",
          "value": "0",
          "short": true
        },
        {
          "title": "Load Time",
          "value": "0",
          "short": true
        },
        {
          "title": "Timestamp",
          "value": "2025-11-28 10:25:00 (BKK)",
          "short": true
        },
        {
          "title": "Error",
          "value": "Test timeout after 30000ms",
          "short": false
        },
        {
          "title": "Error Category",
          "value": "TEST_FAILURE",
          "short": true
        },
        {
          "title": "📸 Screenshot",
          "value": "Saved at: `test-results/screenshots/ScreenCloud-Start/failure-1732782300000.png`\nView in Testmo dashboard or locally",
          "short": false
        }
      ],
      "footer": "Website Monitor Testmo",
      "ts": 1732782300
    }
  ]
}
```

---

## Summary Notification Structure

### Fields

| Field | Title | Value | Short |
|-------|-------|-------|-------|
| Total Sites | `Total Sites` | Number of monitored sites | ✅ |
| Sites Up | `Sites Up` | Number of sites that are UP | ✅ |
| Sites Down | `Sites Down` | Number of sites that are DOWN | ✅ |
| Uptime | `Uptime` | Percentage (e.g., `95.50%`) | ✅ |
| Timestamp | `Timestamp` | Bangkok time | ❌ |
| Down Sites | `Down Sites` | List of down sites (if any) | ❌ |

### Example Summary

```json
{
  "username": "Website Monitor",
  "icon_emoji": ":bar_chart:",
  "attachments": [
    {
      "color": "#36a64f",
      "title": "✅ Monitoring Summary",
      "fields": [
        {
          "title": "Total Sites",
          "value": "5",
          "short": true
        },
        {
          "title": "Sites Up",
          "value": "5",
          "short": true
        },
        {
          "title": "Sites Down",
          "value": "0",
          "short": true
        },
        {
          "title": "Uptime",
          "value": "100.00%",
          "short": true
        },
        {
          "title": "Timestamp",
          "value": "2025-11-28 10:30:00 (BKK)",
          "short": false
        }
      ],
      "footer": "Website Monitor Testmo",
      "ts": 1732782600
    }
  ]
}
```

---

## Bot Token vs Webhook

### Bot Token Method (Preferred)
- Uses Slack Web API: `POST https://slack.com/api/chat.postMessage`
- Requires: `SLACK_BOT_TOKEN`, `SLACK_CHANNEL` or `SLACK_CHANNEL_ID`
- More features and flexibility
- Better error handling

### Webhook Method (Legacy)
- Uses incoming webhook URL
- Requires: `SLACK_WEBHOOK_URL` or per-website `webhookUrl`
- Simpler setup but limited features

Both methods use the same payload structure shown above.

---

## Code Reference

The notification structure is defined in:
- `src/utils/slack-notifier.js`
  - `sendSlackNotificationViaBot()` - Bot Token method
  - `sendSlackNotificationViaWebhook()` - Webhook method
  - `sendSummaryNotificationViaBot()` - Summary via Bot Token
  - `sendSummaryNotification()` - Summary via Webhook

---

## Testing

You can test the notification structure using:

```bash
node scripts/test-slack.js
```

This will send a test notification to your configured Slack channel.

