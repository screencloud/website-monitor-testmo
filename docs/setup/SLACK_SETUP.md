# 🔔 Slack Integration Setup

**Guide for configuring Slack notifications using Bot Token**

---

## 📋 Configuration Options

### Method 1: Bot Token (Recommended) ✅

Uses Slack Web API with Bot Token - more flexible and feature-rich.

**Environment Variables**:
```bash
SLACK_BOT_TOKEN=xoxb-YOUR-SLACK-BOT-TOKEN-HERE
SLACK_CHANNEL=#test-slack-e2e
SLACK_NOTIFICATION=true
SLACK_CHANNEL_ID=  # Optional: Use channel ID instead of channel name
```

### Method 2: Webhook (Legacy)

Uses Slack Incoming Webhooks - simpler but less flexible.

**Environment Variables**:
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**OR in `config/websites.json`**:
```json
{
  "webhookUrl": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
}
```

---

## 🚀 Bot Token Setup (Recommended)

### Step 1: Create Slack App

1. Go to https://api.slack.com/apps
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. Enter app name: `Website Monitor`
5. Select your workspace
6. Click **"Create App"**

### Step 2: Configure Bot Token Scopes

1. In your app settings, go to **"OAuth & Permissions"**
2. Scroll to **"Scopes"** → **"Bot Token Scopes"**
3. Add the following scopes:
   - `chat:write` - Send messages
   - `chat:write.public` - Send messages to public channels (if needed)

### Step 3: Install App to Workspace

1. Scroll to top of **"OAuth & Permissions"** page
2. Click **"Install to Workspace"**
3. Review permissions and click **"Allow"**
4. Copy the **"Bot User OAuth Token"** (starts with `xoxb-YOUR-SLACK-BOT-TOKEN-HERE`)

### Step 4: Invite Bot to Channel

1. Go to your Slack channel (e.g., `#test-slack-e2e`)
2. Type: `/invite @Website Monitor`
3. Or add the bot manually via channel settings

### Step 5: Get Channel ID (Optional)

If you want to use Channel ID instead of channel name:

1. Open Slack in browser
2. Go to your channel
3. Look at the URL: `https://workspace.slack.com/archives/C1234567890`
4. The `C1234567890` part is your Channel ID

### Step 6: Configure Environment Variables

Edit `.env` file:

```bash
# Slack Bot Token Configuration
SLACK_BOT_TOKEN=xoxb-YOUR-SLACK-BOT-TOKEN-HERE
SLACK_CHANNEL=#test-slack-e2e
SLACK_NOTIFICATION=true
SLACK_CHANNEL_ID=  # Optional: Leave empty to use SLACK_CHANNEL
```

**Example**:
```bash
SLACK_BOT_TOKEN=xoxb-YOUR-SLACK-BOT-TOKEN-HERE
SLACK_CHANNEL=#test-slack-e2e
SLACK_NOTIFICATION=true
SLACK_CHANNEL_ID=
```

---

## 🔧 Configuration Details

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SLACK_BOT_TOKEN` | Yes* | Bot token from Slack app | `xoxb-YOUR-SLACK-BOT-TOKEN-HERE...` |
| `SLACK_CHANNEL` | Yes* | Channel name (with #) | `#test-slack-e2e` |
| `SLACK_CHANNEL_ID` | No | Channel ID (alternative to name) | `C1234567890` |
| `SLACK_NOTIFICATION` | Yes | Enable/disable notifications | `true` or `false` |

*Required if using Bot Token method

### Priority

1. **Bot Token method** (if `SLACK_BOT_TOKEN` and `SLACK_CHANNEL` are set and `SLACK_NOTIFICATION=true`)
2. **Webhook method** (if `SLACK_WEBHOOK_URL` is set or `webhookUrl` in `websites.json`)

---

## ✅ Verification

### Test Configuration

```bash
# Check if variables are set
echo $SLACK_BOT_TOKEN
echo $SLACK_CHANNEL
echo $SLACK_NOTIFICATION
```

### Test Notification

```bash
# Run a test
npm test

# Check Slack channel for notification
```

### Verify Bot Permissions

1. Go to your Slack app settings
2. Check **"OAuth & Permissions"** → **"Bot Token Scopes"**
3. Ensure `chat:write` is added
4. Ensure bot is invited to the channel

---

## 📝 Example Configuration

### `.env` file:
```bash
# Slack Integration
SLACK_BOT_TOKEN=xoxb-YOUR-SLACK-BOT-TOKEN-HERE
SLACK_CHANNEL=#test-slack-e2e
SLACK_NOTIFICATION=true
SLACK_CHANNEL_ID=
```

### `config/websites.json`:
```json
[
  {
    "name": "ScreenCloud Start",
    "url": "https://start.screencloud.com/",
    "enabled": true,
    "performanceThreshold": 5000,
    "webhookUrl": null,
    "expectedRedirect": "auth.screencloud.com"
  }
]
```

**Note**: `webhookUrl` can be `null` when using Bot Token method.

---

## 🔔 Notification Behavior

Notifications are sent when:

- ✅ Website goes **DOWN**
- ✅ Website **recovers** (comes back UP)
- ⚠️ Performance threshold **exceeded**
- 🔐 SSL certificate **expiring soon** (< 30 days)

**Notifications are NOT sent**:
- ❌ On every successful check (only on status changes)
- ❌ For minor performance issues (unless threshold exceeded)

---

## 🛠️ Troubleshooting

### Bot Token Not Working

**Error**: `Slack API failed: 403 - not_authed`

**Solutions**:
1. Verify bot token is correct
2. Check bot has `chat:write` scope
3. Ensure bot is invited to channel
4. Verify `SLACK_NOTIFICATION=true`

### Channel Not Found

**Error**: `Slack API failed: 404 - channel_not_found`

**Solutions**:
1. Verify channel name includes `#` (e.g., `#test-slack-e2e`)
2. Ensure bot is invited to channel
3. Try using `SLACK_CHANNEL_ID` instead
4. Check channel is public or bot has access

### Notifications Not Sending

**Check**:
1. `SLACK_NOTIFICATION=true` is set
2. `SLACK_BOT_TOKEN` is valid
3. `SLACK_CHANNEL` is correct
4. Bot has proper permissions
5. Bot is in the channel

### Fallback to Webhook

If Bot Token method fails, the system will:
1. Try Bot Token method first
2. Fallback to webhook if Bot Token not configured
3. Log warnings if both methods fail

---

## 🔄 Migration from Webhook to Bot Token

If you're currently using webhooks:

1. **Keep webhook** (as backup) or remove it
2. **Add Bot Token** configuration to `.env`
3. **Set** `SLACK_NOTIFICATION=true`
4. **Test** with `npm test`
5. **Remove** webhook URLs once confirmed working

---

## 📚 Related Documentation

- **Setup Guide**: [SETUP_AND_USAGE.md](SETUP_AND_USAGE.md) (same directory)
- **Features**: [../FEATURES.md](../FEATURES.md)
- **Security**: [SECURITY_CONFIG.md](SECURITY_CONFIG.md)

---

**Last Updated**: November 27, 2024

