# 🚀 Setup and Usage Guide

**Complete guide to set up and use Website Monitor Testmo**

---

## 📋 Quick Setup Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed
- [ ] Playwright browsers installed
- [ ] Websites configured
- [ ] Environment variables configured
- [ ] Testmo credentials configured (optional)
- [ ] Slack webhook configured (optional)
- [ ] Tests verified
- [ ] Dashboard generated
- [ ] Testmo integration (optional)

---

## 🎯 Step-by-Step Setup

### Step 1: Verify Node.js Version

```bash
node --version
```

**Required**: Node.js 18 or higher

If you need to upgrade:
```bash
# Using nvm (recommended)
nvm install 18
nvm use 18

# Or download from nodejs.org
```

---

### Step 2: Install Dependencies

```bash
# Install npm packages
npm install

# Install Playwright browsers
npx playwright install chromium
```

---

### Step 3: Configure Websites to Monitor

Edit `config/websites.json`:

```json
[
  {
    "name": "ScreenCloud Start",
    "url": "https://start.screencloud.com/",
    "enabled": true,
    "performanceThreshold": 5000,
    "webhookUrl": null,
    "expectedRedirect": "auth.screencloud.com"
  },
  {
    "name": "ScreenCloud App",
    "url": "https://app.screencloud.com/",
    "enabled": true,
    "performanceThreshold": 5000,
    "webhookUrl": null
  }
]
```

**Fields**:
- `name`: Display name for the website
- `url`: Full URL to monitor
- `enabled`: `true` to monitor, `false` to skip
- `performanceThreshold`: Max load time in milliseconds
- `webhookUrl`: Slack webhook URL (optional, can be `null` if using Bot Token)
- `expectedRedirect`: Expected redirect domain (optional)

---

### Step 4: Configure Environment Variables

Create or edit `.env` file:

```bash
# Copy example if needed
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

**Required** (for Testmo integration):
```bash
TESTMO_INSTANCE=your-instance.testmo.net
TESTMO_PROJECT_ID=your-project-id
TESTMO_API_KEY=your-api-key  # Optional if using auth:login
```

**Optional** (for Slack notifications - Bot Token method recommended):
```bash
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_CHANNEL=#test-slack-e2e
SLACK_NOTIFICATION=true
SLACK_CHANNEL_ID=  # Optional

# Or use webhook (legacy):
# SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**Security** (optional):
```bash
API_KEY=your-api-key  # For status API authentication
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com  # CORS origins
ALLOW_SELF_SIGNED_CERTS=false  # SSL validation (true for testing only)
```

---

### Step 5: Verify Setup

```bash
# Verify everything is configured correctly
npm run verify
```

This checks:
- ✅ Node.js version
- ✅ Dependencies installed
- ✅ Configuration files exist
- ✅ Websites configured
- ✅ Playwright installed

---

### Step 6: Run Your First Test

```bash
# Run all monitoring tests
npm test
```

**What happens**:
1. Tests each enabled website
2. Checks HTTP status, DNS, SSL, performance
3. Captures screenshots on failure
4. Generates dashboard
5. Creates JUnit XML for Testmo

**Expected output**:
```
Running 1 test using 1 worker

  ✓  1 [chromium] › tests/website-monitor.spec.js:48:3 › Monitor: ScreenCloud Start (9.2s)

📊 Generating dashboard...
✅ Dashboard generated: test-results/dashboard.html

  1 passed (22.3s)
```

---

### Step 7: View Dashboard

```bash
# Open dashboard in browser
open test-results/dashboard.html

# Or manually navigate to:
# test-results/dashboard.html
```

**Dashboard shows**:
- ✅ Website status (UP/DOWN)
- 📊 Performance metrics
- 🔐 SSL certificate info
- 📸 Screenshots (on failures)
- ⏰ Last check timestamp

---

### Step 8: Start Status API Server (Optional)

```bash
# Start the API server
npm run server

# Server runs on http://localhost:3000
```

**Endpoints**:
- `http://localhost:3000/` - Dashboard
- `http://localhost:3000/api/status` - All statuses
- `http://localhost:3000/api/summary` - Summary
- `http://localhost:3000/api/status/:website` - Specific website
- `http://localhost:3000/health` - Health check

---

## 🔧 Testmo Integration (Optional)

### Step 1: Install Testmo CLI

```bash
npm install -g @testmo/testmo-cli
```

### Step 2: Create Testmo Project

1. Log in to your Testmo instance
2. Create new project: "Website Monitor"
3. Type: **Automation**
4. Note the **Project ID**

### Step 3: Configure Testmo

```bash
# Edit .env file
TESTMO_INSTANCE=your-instance.testmo.net
TESTMO_PROJECT_ID=your-project-id
```

### Step 4: Authenticate

```bash
testmo auth:login --instance your-instance.testmo.net
```

### Step 5: Verify Testmo Setup

```bash
npm run testmo:verify
```

### Step 6: Submit Test Results

```bash
# Run tests and submit to Testmo
npm run testmo:submit
```

This will:
1. Run all tests
2. Generate JUnit XML
3. Submit results to Testmo
4. Show Testmo run URL

### Step 7: Set Up Scheduling in Testmo

1. Go to your Testmo project
2. Navigate to **Automation → Schedules**
3. Create new schedule:
   - **Frequency**: Hourly (or as needed)
   - **Command**: `npm run testmo:submit`
   - **Working Directory**: Your project directory

---

## 📱 Daily Usage

### Run Tests Manually

```bash
# Run all tests
npm test

# Run with UI (interactive)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Debug mode
npm run test:debug
```

### View Results

```bash
# View HTML report
npm run test:report

# View dashboard
open test-results/dashboard.html

# Start API server
npm run server
```

### Submit to Testmo

```bash
npm run testmo:submit
```

---

## 🔔 Slack Notifications

### Method 1: Bot Token (Recommended) ✅

Uses Slack Web API - more flexible and feature-rich.

1. **Create Slack App**:
   - Go to https://api.slack.com/apps
   - Create new app → "From scratch"
   - Name: "Website Monitor"
   - Select workspace

2. **Configure Bot Token Scopes**:
   - Go to "OAuth & Permissions"
   - Add scopes: `chat:write`, `chat:write.public`

3. **Install App to Workspace**:
   - Click "Install to Workspace"
   - Copy Bot Token (starts with `xoxb-`)

4. **Invite Bot to Channel**:
   - Go to your channel (e.g., `#test-slack-e2e`)
   - Type: `/invite @Website Monitor`

5. **Configure `.env`**:
   ```bash
   SLACK_BOT_TOKEN=xoxb-your-bot-token-here
   SLACK_CHANNEL=#test-slack-e2e
   SLACK_NOTIFICATION=true
   SLACK_CHANNEL_ID=  # Optional
   ```

### Method 2: Webhook (Legacy)

1. Go to Slack → Apps → Incoming Webhooks
2. Create new webhook
3. Copy webhook URL
4. Add to `.env`:
   ```bash
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```
5. Or add to `config/websites.json`:
   ```json
   {
     "name": "Website Name",
     "webhookUrl": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
   }
   ```

**Notifications sent when**:
- ✅ Website goes DOWN
- ✅ Website recovers (comes back UP)
- ⚠️ Performance threshold exceeded
- 🔐 SSL certificate expiring soon

**See [SLACK_SETUP.md](SLACK_SETUP.md) for detailed setup guide.**

---

## 🛠️ Troubleshooting

### Node.js Version Error

```
Error: You are running Node.js 16.20.2. Playwright requires Node.js 18 or higher.
```

**Solution**:
```bash
nvm install 18
nvm use 18
```

### Playwright Browsers Not Found

```
Error: Executable doesn't exist
```

**Solution**:
```bash
npx playwright install chromium
```

### Testmo Authentication Failed

```
Error: Authentication failed
```

**Solution**:
```bash
testmo auth:login --instance your-instance.testmo.net
```

### No Websites Found

```
Error: No enabled websites found
```

**Solution**: Check `config/websites.json` and ensure at least one website has `"enabled": true`

### Dashboard Not Generated

**Solution**:
```bash
npm run dashboard
```

---

## 📊 Understanding Results

### Test Output

```
✓ Monitor: ScreenCloud Start (9.2s)
```

- ✅ **Green checkmark**: Website is UP
- ❌ **Red X**: Website is DOWN
- ⏱️ **Time**: How long the test took

### Dashboard Status

- 🟢 **Green**: Website is UP
- 🔴 **Red**: Website is DOWN
- 🟡 **Yellow**: Performance warning
- ⚠️ **Warning**: SSL expiring soon

### Status API Response

```json
{
  "name": "ScreenCloud Start",
  "url": "https://start.screencloud.com/",
  "isUp": true,
  "statusCode": 200,
  "loadTime": 6988,
  "ssl": {
    "valid": true,
    "expirationDate": "2026-12-20T23:59:59.000Z",
    "daysUntilExpiry": 387
  }
}
```

---

## 🎯 Common Workflows

### Daily Monitoring

```bash
# 1. Run tests
npm test

# 2. Check dashboard
open test-results/dashboard.html

# 3. Submit to Testmo (if configured)
npm run testmo:submit
```

### Add New Website

1. Edit `config/websites.json`
2. Add new entry:
   ```json
   {
     "name": "New Website",
     "url": "https://example.com/",
     "enabled": true,
     "performanceThreshold": 5000,
     "webhookUrl": null
   }
   ```
3. Run tests: `npm test`

### Debug Failed Test

```bash
# Run in debug mode
npm run test:debug

# Or run with UI
npm run test:ui

# Check screenshots
ls test-results/screenshots/
```

---

## 📚 Next Steps

1. ✅ **Complete Setup**: Follow steps 1-8 above
2. ✅ **Add More Websites**: Edit `config/websites.json`
3. ✅ **Configure Slack**: Add webhook URLs
4. ✅ **Set Up Testmo**: Follow Testmo integration steps
5. ✅ **Schedule Monitoring**: Set up hourly runs in Testmo
6. ✅ **Monitor Dashboard**: Check regularly for issues

---

## 🆘 Need Help?

- **Documentation**: See [DOCUMENTATION.md](DOCUMENTATION.md)
- **Quick Start**: See [TESTMO_QUICK_START.md](TESTMO_QUICK_START.md) (same directory)
- **Features**: See [../FEATURES.md](../FEATURES.md)
- **Security**: See [SECURITY_AUDIT.md](SECURITY_AUDIT.md)

---

**Last Updated**: November 27, 2024

