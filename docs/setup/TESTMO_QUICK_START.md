# 🚀 Testmo Quick Start Guide

**Quick setup guide for Testmo integration**

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Install Testmo CLI

```bash
npm install -g @testmo/testmo-cli
```

### Step 2: Create Testmo Project

1. Log in to your Testmo instance: `https://your-instance.testmo.net`
2. Go to **Projects** → **New Project**
3. Name: "Website Monitor"
4. Type: **Automation**
5. Save and note the **Project ID** from the URL

### Step 3: Authenticate

```bash
testmo auth:login --instance your-instance.testmo.net
```

### Step 4: Configure Environment

Add to your `.env` file:

```bash
TESTMO_INSTANCE=your-instance.testmo.net
TESTMO_PROJECT_ID=your-project-id
TESTMO_API_KEY=your-api-key  # Optional if using auth:login
```

Or export in your shell:

```bash
export TESTMO_INSTANCE=your-instance.testmo.net
export TESTMO_PROJECT_ID=your-project-id
```

### Step 5: Verify Setup

```bash
npm run testmo:verify
```

This will check:
- ✅ Testmo CLI installation
- ✅ Environment variables
- ✅ Authentication status
- ✅ Playwright configuration

### Step 6: Submit Test Results

```bash
npm run testmo:submit
```

This will:
1. Run Playwright tests
2. Generate JUnit XML report
3. Submit results to Testmo
4. Show you the Testmo run URL

---

## 📅 Set Up Scheduling

### Option 1: Testmo UI (Recommended)

1. Go to your Testmo project
2. Navigate to **Automation** → **Schedules**
3. Click **New Schedule**
4. Configure:
   - **Name**: "Hourly Website Monitor"
   - **Frequency**: Every hour
   - **Command**: 
     ```bash
     cd /path/to/website-monitor-testmo && npm run testmo:submit
     ```
   - **Environment Variables**:
     - `TESTMO_INSTANCE=your-instance.testmo.net`
     - `TESTMO_PROJECT_ID=your-project-id`
     - `NODE_VERSION=18` (if needed)

### Option 2: Testmo API

Use Testmo's API to create schedules programmatically.

---

## 🔔 Configure Notifications

### Slack Integration in Testmo

1. Go to **Settings** → **Integrations** → **Slack**
2. Connect your Slack workspace
3. Configure:
   - **On test run completion**: ✅ Enabled
   - **On test failures**: ✅ Enabled
   - **Channel**: `#alerts` (or your channel)

**Note**: You can also use the built-in Slack notifier in the code:
- **Bot Token method** (recommended): Configure `SLACK_BOT_TOKEN`, `SLACK_CHANNEL`, `SLACK_NOTIFICATION` in `.env`
- **Webhook method** (legacy): Configure `SLACK_WEBHOOK_URL` in `.env` or `webhookUrl` in `websites.json`

See **[SLACK_SETUP.md](SLACK_SETUP.md)** for complete setup guide.

---

## 📊 View Results

After runs complete:

1. Go to your Testmo project
2. Navigate to **Automation** → **Runs**
3. View:
   - Test results
   - Screenshots (on failures)
   - Performance metrics
   - Historical trends

---

## 🛠️ Troubleshooting

### Testmo CLI Not Found

```bash
npm install -g @testmo/testmo-cli
```

### Authentication Issues

```bash
testmo auth:login --instance your-instance.testmo.net
testmo auth:status
```

### JUnit XML Not Generated

Check `playwright.config.js` has:
```javascript
reporter: [
  ['junit', { outputFile: 'test-results/junit.xml' }],
  // ...
]
```

### Project ID Not Found

1. Check the URL: `https://your-instance.testmo.net/projects/PROJECT_ID`
2. Verify you have access to the project
3. Check project settings

### Environment Variables Not Set

```bash
# Check current values
echo $TESTMO_INSTANCE
echo $TESTMO_PROJECT_ID

# Set them
export TESTMO_INSTANCE=your-instance.testmo.net
export TESTMO_PROJECT_ID=your-project-id
```

---

## ✅ Verification Checklist

- [ ] Testmo CLI installed (`testmo --version`)
- [ ] Testmo project created
- [ ] Project ID noted
- [ ] Authenticated (`testmo auth:login`)
- [ ] Environment variables set
- [ ] Setup verified (`npm run testmo:verify`)
- [ ] Test submission works (`npm run testmo:submit`)
- [ ] Results appear in Testmo dashboard
- [ ] Scheduling configured (optional)
- [ ] Slack notifications configured (optional)

---

## 🎯 Next Steps

1. **Set up scheduling** - Configure hourly runs in Testmo
2. **Configure alerts** - Set up Slack/Jira notifications
3. **Create dashboards** - Build monitoring dashboards in Testmo
4. **Review trends** - Monitor uptime trends over time
5. **Add more websites** - Expand monitoring to more URLs

---

## 📚 Additional Resources

- **Full Setup Guide**: See `docs/TESTMO_SETUP.md`
- **Testmo Documentation**: https://www.testmo.com/docs
- **CLI Reference**: `testmo --help`

---

**Last Updated**: November 27, 2024

