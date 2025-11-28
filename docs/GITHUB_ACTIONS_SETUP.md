# GitHub Actions Setup Guide

**Complete guide for setting up GitHub Actions integration**

---

## 📋 Overview

This guide explains how to set up GitHub Actions for automated website monitoring with Testmo integration and GitHub Issues.

---

## 🚀 Quick Start

### Step 1: Add GitHub Secrets

Go to your repository: **Settings > Secrets and variables > Actions**

Add the following secrets:

#### Required Secrets
- `TESTMO_INSTANCE` - Your Testmo instance URL (e.g., `screencloud.testmo.net`)
- `TESTMO_PROJECT_ID` - Your Testmo project ID
- `TESTMO_API_KEY` - Your Testmo API key

#### Optional Secrets (for Slack notifications)
- `SLACK_BOT_TOKEN` - Slack bot token
- `SLACK_CHANNEL` - Slack channel name (e.g., `#monitoring`)
- `SLACK_CHANNEL_ID` - Slack channel ID
- `SLACK_NOTIFICATION` - Set to `true` to enable

#### GitHub Token
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions (no need to add)

---

### Step 2: Workflow File

The workflow file is already created at:
```
.github/workflows/website-monitoring.yml
```

This workflow will:
- ✅ Run every 15 minutes (scheduled)
- ✅ Run on push to main/master
- ✅ Run on pull requests
- ✅ Run manually (workflow_dispatch)
- ✅ Submit results to Testmo
- ✅ Create GitHub issues on failures
- ✅ Upload test artifacts

---

## 🔧 Configuration

### Schedule Configuration

Edit `.github/workflows/website-monitoring.yml` to change the schedule:

```yaml
schedule:
  # Run every 15 minutes
  - cron: '*/15 * * * *'
  
  # Other examples:
  # Every hour: '0 * * * *'
  # Every 30 minutes: '*/30 * * * *'
  # Every day at midnight: '0 0 * * *'
```

### Trigger Configuration

The workflow triggers on:
- **Schedule**: Every 15 minutes
- **Push**: To main/master branches (when config or tests change)
- **Pull Request**: To main/master branches
- **Manual**: Via GitHub Actions UI

---

## 📊 Workflow Steps

### 1. Checkout Code
- Checks out repository code
- Fetches full Git history for Git info

### 2. Setup Node.js
- Installs Node.js 18
- Caches npm dependencies

### 3. Install Dependencies
- Runs `npm ci` for clean install

### 4. Install Playwright
- Installs Chromium browser
- Installs browser dependencies

### 5. Run Tests
- Executes monitoring tests
- Generates test results
- Captures screenshots

### 6. Submit to Testmo
- Submits test results to Testmo
- Includes enhanced metadata
- Links to Testmo dashboard

### 7. Create GitHub Issues
- Detects test failures
- Creates GitHub issues automatically
- Includes detailed failure information

### 8. Upload Artifacts
- Uploads test results
- Uploads screenshots
- Uploads dashboard

---

## 🎯 GitHub Issues Integration

### Automatic Issue Creation

When a website goes down, the workflow will:
1. ✅ Detect the failure
2. ✅ Check if issue already exists
3. ✅ Create new issue if needed
4. ✅ Include detailed failure information
5. ✅ Add appropriate labels

### Issue Content

Each issue includes:
- Website name and URL
- Error details and category
- DNS and SSL information
- Test run information
- Links to Testmo dashboard
- Next steps for resolution

### Issue Labels

Issues are automatically labeled with:
- `monitoring`
- `website-down`
- `automated`
- Error category (e.g., `timeout`, `ssl-error`)

---

## 📝 Environment Variables

The workflow automatically sets:
- `GIT_COMMIT` - GitHub commit SHA
- `GIT_BRANCH` - Branch name
- `GIT_AUTHOR` - GitHub actor
- `GIT_REPOSITORY_URL` - Repository URL
- `NODE_ENV` - Set to `production`

---

## 🔍 Monitoring Workflow

### View Workflow Runs

1. Go to **Actions** tab in GitHub
2. Select **Website Monitoring** workflow
3. View run history and details

### View Test Results

1. Click on a workflow run
2. Scroll to **Upload test results** step
3. Download artifacts to view:
   - Test results
   - Screenshots
   - Dashboard

### View Testmo Results

1. Check workflow logs for Testmo URL
2. Or go to Testmo dashboard directly
3. View enhanced test results with metadata

---

## 🐛 Troubleshooting

### Workflow Not Running

**Check**:
- ✅ Secrets are configured correctly
- ✅ Workflow file is in `.github/workflows/`
- ✅ Schedule syntax is correct
- ✅ Repository has Actions enabled

### Tests Failing

**Check**:
- ✅ Node.js version is correct
- ✅ Dependencies are installed
- ✅ Playwright browsers are installed
- ✅ Network connectivity

### Testmo Submission Failing

**Check**:
- ✅ `TESTMO_INSTANCE` is correct
- ✅ `TESTMO_PROJECT_ID` is correct
- ✅ `TESTMO_API_KEY` is valid
- ✅ API key has correct permissions

### GitHub Issues Not Created

**Check**:
- ✅ `GITHUB_TOKEN` is available (automatic)
- ✅ Repository has Issues enabled
- ✅ Workflow has write permissions
- ✅ No existing open issue for same website

---

## 📚 Related Documentation

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Testmo Integration Guide](./TESTMO_SETUP.md)
- [GitHub Issues Integration](./TESTMO_GITHUB_INTEGRATION.md)
- [XML Format Guide](./TESTMO_XML_FORMAT.md)

---

## 🎯 Best Practices

1. **Monitor Workflow Runs**: Check Actions tab regularly
2. **Review Issues**: Address website failures promptly
3. **Check Artifacts**: Download and review test results
4. **Update Schedule**: Adjust frequency as needed
5. **Test Manually**: Use workflow_dispatch to test

---

**Last Updated**: November 28, 2024

