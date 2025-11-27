# Testmo Setup Guide

This guide walks you through setting up Testmo for website monitoring.

## Prerequisites

- Testmo company account
- Access to Testmo project creation
- Slack workspace (for notifications)

## Step 1: Create Testmo Project

1. Log in to your Testmo account
2. Navigate to Projects
3. Click "New Project"
4. Name: "Website Monitor"
5. Description: "Automated website monitoring using Playwright"
6. Save the project

## Step 2: Configure Test Execution

### Option A: Testmo Cloud Execution

1. Go to Project Settings → Execution
2. Select "Cloud Execution" (Testmo-managed runners)
3. Configure environment:
   - Node.js version: 18.x or higher
   - Operating System: Linux (recommended)
   - Browser: Chromium (Playwright)

### Option B: Self-Hosted Runner

1. Set up a self-hosted runner in Testmo
2. Install Node.js and Playwright on the runner
3. Configure runner to execute tests from this repository

## Step 3: Set Up Scheduled Runs

1. Go to Project Settings → Schedules
2. Create a new schedule:
   - **Name:** "Hourly Website Monitor"
   - **Frequency:** Hourly
   - **Time:** Configure based on your timezone
   - **Test Suite:** Select the website monitoring tests
   - **Execution Environment:** Select your configured environment

3. For multiple schedules (e.g., different intervals per website):
   - Create separate schedules
   - Use Testmo's filtering to run specific tests

## Step 4: Configure Slack Integration

1. In Testmo, go to Settings → Integrations
2. Select "Slack"
3. Connect your Slack workspace
4. Configure notification rules:
   - **On Test Failure:** Send notification to `#alerts` channel
   - **On Test Pass:** Optional (can be disabled to reduce noise)
   - **On Schedule Completion:** Send summary report

5. Customize notification format:
   - Include test name, website URL, error message
   - Include screenshot attachment
   - Include performance metrics

## Step 5: Configure Test Results Upload

Testmo will automatically:
- Import JSON test results from `test-results/results.json`
- Attach screenshots from test runs
- Track test history and trends

### Manual Configuration (if needed):

1. Go to Project Settings → Results
2. Configure result import:
   - Format: Playwright JSON
   - Path: `test-results/results.json`
   - Auto-import: Enabled

## Step 6: Set Up Environment Variables

If you need environment variables (e.g., for webhooks):

1. Go to Project Settings → Environment Variables
2. Add variables:
   - `SLACK_WEBHOOK_URL` (if using custom Slack integration)
   - `PAGERDUTY_WEBHOOK` (optional)
   - `OPSGENIE_WEBHOOK` (optional)

## Step 7: Test the Setup

1. Trigger a manual test run in Testmo
2. Verify:
   - Tests execute successfully
   - Screenshots are captured
   - Status reports are generated
   - Slack notifications are sent (on failure)

## Step 8: Monitor and Maintain

- Review test results in Testmo dashboard
- Check scheduled runs are executing
- Monitor Slack notifications
- Review performance trends in Testmo

## Troubleshooting

### Tests Not Executing

- Check Testmo runner status
- Verify Node.js and Playwright are installed
- Check test file paths are correct

### Screenshots Not Appearing

- Verify screenshot paths in test code
- Check file permissions on runner
- Ensure screenshots are saved before test completion

### Slack Notifications Not Working

- Verify Slack integration is connected
- Check notification rules are configured
- Test Slack webhook manually

### Performance Issues

- Review Testmo execution logs
- Check runner resources (CPU, memory)
- Consider adjusting test concurrency

## Next Steps

- Set up additional websites in `config/websites.json`
- Configure custom notification rules
- Set up dashboards in Testmo
- Review and optimize test execution time

