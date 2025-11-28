# 🔧 Environment Variables Configuration

**Complete guide for `.env` file configuration**

---

## 📋 Quick Setup

```bash
# Copy example file
cp .env.example .env

# Edit with your values
nano .env  # or use your preferred editor
```

---

## 📝 Required Variables

### Testmo Integration (if using Testmo)

```bash
TESTMO_INSTANCE=your-instance.testmo.net
TESTMO_PROJECT_ID=your-project-id
TESTMO_API_KEY=your-api-key  # Optional
```

### Slack Integration (if using Slack)

**Method 1: Bot Token (Recommended)** ✅

```bash
SLACK_BOT_TOKEN=xoxb-YOUR-SLACK-BOT-TOKEN-HERE
SLACK_CHANNEL=#test-slack-e2e
SLACK_NOTIFICATION=true
SLACK_CHANNEL_ID=  # Optional
```

**Method 2: Webhook (Legacy)**

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

---

## 🔍 Variable Details

### Testmo Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `TESTMO_INSTANCE` | Yes* | Your Testmo instance URL | `screencloud.testmo.net` |
| `TESTMO_PROJECT_ID` | Yes* | Project ID from Testmo | `12345` |
| `TESTMO_API_KEY` | No | API key (optional if using auth:login) | `abc123...` |

*Required if using Testmo integration

### Slack Bot Token Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SLACK_BOT_TOKEN` | Yes* | Bot token from Slack app | `xoxb-YOUR-SLACK-BOT-TOKEN-HERE...` |
| `SLACK_CHANNEL` | Yes* | Channel name with # | `#test-slack-e2e` |
| `SLACK_NOTIFICATION` | Yes* | Enable notifications | `true` or `false` |
| `SLACK_CHANNEL_ID` | No | Channel ID (alternative to name) | `C1234567890` |

*Required if using Bot Token method

### Slack Webhook Variables (Legacy)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SLACK_WEBHOOK_URL` | Yes* | Webhook URL from Slack | `https://hooks.slack.com/...` |

*Required if using webhook method (not needed if using Bot Token)

### Security Variables (Optional)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `API_KEY` | No | API key for status API auth | `your-secret-key` |
| `ALLOWED_ORIGINS` | No | CORS allowed origins | `http://localhost:3000` |
| `ALLOW_SELF_SIGNED_CERTS` | No | Allow self-signed SSL (testing) | `false` |

---

## 📋 Complete Example

```bash
# Testmo Configuration
TESTMO_INSTANCE=screencloud.testmo.net
TESTMO_PROJECT_ID=12345
TESTMO_API_KEY=abc123def456

# Slack Bot Token (Recommended)
SLACK_BOT_TOKEN=xoxb-YOUR-SLACK-BOT-TOKEN-HERE
SLACK_CHANNEL=#test-slack-e2e
SLACK_NOTIFICATION=true
SLACK_CHANNEL_ID=

# Security (Optional)
API_KEY=my-secret-api-key-123
ALLOWED_ORIGINS=http://localhost:3000,https://dashboard.example.com
ALLOW_SELF_SIGNED_CERTS=false
```

---

## 🔐 Security Notes

1. **Never commit `.env` to git** - It's already in `.gitignore`
2. **Use strong API keys** - Generate random strings for production
3. **Restrict CORS origins** - Don't use `*` in production
4. **Keep tokens secret** - Don't share `.env` file

---

## ✅ Verification

Check if variables are loaded:

```bash
# Check specific variable
echo $SLACK_BOT_TOKEN

# Or in Node.js
node -e "require('dotenv').config(); console.log(process.env.SLACK_BOT_TOKEN)"
```

---

## 🛠️ Troubleshooting

### Variables Not Loading

- Ensure `.env` file exists in project root
- Check for typos in variable names
- Verify no extra spaces around `=`
- Restart your terminal/process after changes

### Slack Bot Token Not Working

- Verify token starts with `xoxb-YOUR-SLACK-BOT-TOKEN-HERE`
- Check `SLACK_NOTIFICATION=true`
- Ensure bot is invited to channel
- Verify channel name includes `#`

### Testmo Variables Not Working

- Check instance URL format (no https://)
- Verify project ID is correct
- Run `npm run testmo:verify` to check

---

## 📚 Related Documentation

- **[SLACK_SETUP.md](SLACK_SETUP.md)** - Complete Slack setup guide
- **[docs/setup/SETUP_AND_USAGE.md](setup/SETUP_AND_USAGE.md)** - Full setup guide
- **[docs/setup/TESTMO_QUICK_START.md](setup/TESTMO_QUICK_START.md)** - Testmo setup

---

**Last Updated**: November 27, 2024

