# Testmo Setup Guide

This guide will help you set up Testmo for automated website monitoring.

## Prerequisites

- Testmo account (company account)
- Testmo project created
- Testmo API key or CLI access

## Step 1: Create Testmo Project

1. Log in to your Testmo instance
2. Navigate to **Projects** → **New Project**
3. Name it "Website Monitor" or similar
4. Select **Automation** as the project type
5. Save the project and note the **Project ID**

## Step 2: Configure Testmo CLI

### Install Testmo CLI

```bash
npm install -g @testmo/testmo-cli
```

### Authenticate

```bash
testmo auth:login --instance your-instance.testmo.net
```

Or set environment variables:

```bash
export TESTMO_INSTANCE=your-instance.testmo.net
export TESTMO_API_KEY=your-api-key
export TESTMO_PROJECT_ID=your-project-id
```

## Step 3: Configure Playwright for Testmo

The `playwright.config.js` is already configured to generate JUnit XML reports that Testmo can consume:

```javascript
reporter: [
  ['junit', { outputFile: 'test-results/junit.xml' }],
  // ... other reporters
]
```

## Step 4: Submit Test Results

### Manual Submission

```bash
testmo automation:run:submit \
  --instance your-instance.testmo.net \
  --project-id YOUR_PROJECT_ID \
  --name "Website Monitor Run - $(date +%Y-%m-%d\ %H:%M)" \
  --source "Playwright" \
  --results test-results/junit.xml \
  -- npx playwright test
```

### Using npm Script

Add to `package.json`:

```json
{
  "scripts": {
    "testmo:submit": "testmo automation:run:submit --instance $TESTMO_INSTANCE --project-id $TESTMO_PROJECT_ID --name \"Playwright Monitor Run\" --source \"Playwright\" --results test-results/junit.xml -- npx playwright test"
  }
}
```

Then run:

```bash
TESTMO_INSTANCE=your-instance.testmo.net \
TESTMO_PROJECT_ID=YOUR_PROJECT_ID \
npm run testmo:submit
```

## Step 5: Set Up Scheduling in Testmo

1. Go to your Testmo project
2. Navigate to **Automation** → **Schedules**
3. Click **New Schedule**
4. Configure:
   - **Name**: "Hourly Website Monitor"
   - **Frequency**: Every hour (or as needed)
   - **Command**: Your testmo:submit command
   - **Environment**: Set `TESTMO_INSTANCE`, `TESTMO_PROJECT_ID`, etc.

## Step 6: Configure Slack Integration in Testmo

1. Go to **Settings** → **Integrations** → **Slack**
2. Connect your Slack workspace
3. Configure notifications:
   - **On test run completion**: Enabled
   - **On test failures**: Enabled
   - **Channel**: Your monitoring channel (e.g., `#alerts`)

## Step 7: Custom Fields (Optional)

Testmo supports custom fields. You can enhance test results with:

- Website name
- Load time
- Status code
- Error category
- SSL expiration

These can be added via Testmo's API or custom test attributes.

## Step 8: View Results

After runs complete:

1. Go to your Testmo project
2. Navigate to **Automation** → **Runs**
3. View detailed results, screenshots, and trends
4. Set up dashboards for monitoring overview

## Benefits of Testmo Integration

✅ **No GitHub Actions Minutes**: Runs on Testmo infrastructure  
✅ **Centralized Management**: All test runs in one place  
✅ **Historical Tracking**: Track uptime trends over time  
✅ **Team Collaboration**: Share results with your team  
✅ **Advanced Reporting**: Built-in analytics and dashboards  
✅ **Native Integrations**: Slack, Jira, and more  
✅ **Scheduling**: Built-in scheduling (no cron needed)  

## Troubleshooting

### JUnit XML Not Found

Ensure Playwright is configured to generate JUnit XML:

```javascript
reporter: [['junit', { outputFile: 'test-results/junit.xml' }]]
```

### Authentication Issues

Verify your Testmo credentials:

```bash
testmo auth:status
```

### Project ID Not Found

Check your project ID in Testmo:
1. Go to your project
2. Check the URL: `https://your-instance.testmo.net/projects/PROJECT_ID`
3. Or check project settings

## Next Steps

- Set up dashboards in Testmo
- Configure alerting rules
- Integrate with other tools (Jira, etc.)
- Set up custom reports

---

For more information, see [Testmo Documentation](https://www.testmo.com/docs).
