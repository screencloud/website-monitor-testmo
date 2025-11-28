# Website Monitor - Testmo Project Documentation

**Project**: Monitor Services and Website  
**Repository**: https://github.com/screencloud/website-monitor-testmo  
**Testmo Instance**: https://screencloud.testmo.net

---

## 📋 Project Overview

This project provides automated website monitoring with comprehensive test coverage, intelligent alerting, and detailed reporting through Testmo integration.

### Key Features

- ✅ **Comprehensive Monitoring**: HTTP status, DNS resolution, SSL certificate validation, performance metrics
- ✅ **Automated Testing**: Playwright-based test automation with scheduled runs
- ✅ **Testmo Integration**: Full integration with Testmo for test management and reporting
- ✅ **Slack Notifications**: Real-time alerts on status changes and failures
- ✅ **Performance Tracking**: Historical performance metrics and trend analysis
- ✅ **Screenshot Capture**: Automatic screenshots on failures with timestamped history
- ✅ **Error Categorization**: Intelligent error classification with severity levels

---

## 🏗️ Architecture

### Test Structure

```
website-monitor-testmo/
├── config/
│   └── websites.json          # Website configurations
├── tests/
│   └── website-monitor.spec.js # Playwright Test specifications
├── src/
│   └── utils/
│       ├── monitoring-helpers.js  # Core monitoring utilities
│       ├── dashboard-generator.js # HTML dashboard generator
│       ├── slack-notifier.js     # Slack notification handler
│       ├── testmo-api.js         # Testmo API client
│       ├── github-issues.js       # GitHub Issues integration
│       └── junit-enhancer.js      # JUnit XML enhancement
├── scripts/
│   └── testmo-submit.js      # Testmo submission script
└── test-results/              # Test outputs
```

### Monitoring Checks

Each website is monitored for:

1. **HTTP Status Code**: Verifies expected status (200, 301, etc.)
2. **DNS Resolution**: Checks DNS lookup success and response time
3. **SSL Certificate**: Validates certificate and checks expiration
4. **Page Load Time**: Measures performance against threshold
5. **Content Verification**: Ensures page content loads correctly
6. **Screenshot Capture**: Captures screenshot on failures

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (required for Playwright)
- Testmo account and API key
- Slack workspace (optional, for notifications)

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browser
npx playwright install chromium

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

### Running Tests

```bash
# Run tests locally
npm test

# Submit results to Testmo
npm run testmo:submit

# Run and submit in one command
npm test && npm run testmo:submit
```

---

## 📊 Testmo Integration

### Automation Runs

Test results are automatically submitted to Testmo after each test run. Each run includes:

- **Enhanced Metadata**: Environment info, Git information, performance metrics
- **Custom Fields**: Node.js version, platform, Playwright version, test statistics
- **Tags**: `@monitoring`, `@website`, `@uptime` (per test)
- **Screenshots**: Attached to failed tests
- **Detailed Results**: Full test execution details

### Viewing Results

1. Go to **Automation > Runs & results** in Testmo
2. View run history and trends
3. Click on any run to see detailed results
4. Check screenshots and error details

### Test Cases

Test cases are stored in the Testmo repository and linked to automated tests:

- **Repository**: https://screencloud.testmo.net/repositories/12
- **Test Cases**: One per monitored website
- **Automation Linking**: Test cases linked to automated Playwright tests

---

## 🔧 Configuration

### Website Configuration

Edit `config/websites.json` to add/modify monitored websites:

```json
{
  "name": "Website Name",
  "url": "https://example.com",
  "enabled": true,
  "expectedStatus": 200,
  "performanceThreshold": 12000,
  "expectedRedirect": "https://redirect-url.com"
}
```

### Environment Variables

Required:
- `TESTMO_INSTANCE` - Your Testmo instance URL
- `TESTMO_PROJECT_ID` - Your Testmo project ID
- `TESTMO_API_KEY` - Your Testmo API key

Optional:
- `SLACK_BOT_TOKEN` - Slack bot token (for notifications)
- `SLACK_CHANNEL` - Slack channel name
- `GITHUB_TOKEN` - GitHub token (for issue creation)

---

## 📈 Monitoring & Reporting

### Dashboards

- **Testmo Dashboard**: View all test runs, trends, and metrics
- **Local Dashboard**: Auto-generated HTML dashboard in `test-results/dashboard.html`
- **Status API**: REST API for programmatic access

### Metrics Tracked

- **Uptime Percentage**: Website availability over time
- **Average Load Time**: Performance trends
- **Load Time Trends**: Improving/degrading/stable
- **Failure Rate**: Percentage of failed checks
- **SSL Expiration**: Days until certificate expiration

### Reports

- **Test Run Reports**: Detailed results for each run
- **Trend Analysis**: Performance and uptime trends
- **Failure Reports**: Detailed error information
- **Weekly/Monthly Summaries**: Aggregate statistics

---

## 🔔 Notifications

### Slack Integration

Slack notifications are sent for:

- **Status Changes**: When website goes up/down
- **Critical Failures**: SSL errors, DNS failures
- **Performance Warnings**: When load time exceeds threshold

### GitHub Issues

When configured, GitHub issues are automatically created for:

- **Website Failures**: When monitoring detects downtime
- **SSL Expiration Warnings**: When certificates are expiring soon
- **Performance Degradation**: When load times consistently exceed threshold

---

## 🎯 Test Execution

### Manual Execution

```bash
# Run all tests
npm test

# Run specific test
npm test -- --grep "Website Name"

# Run with UI
npm run test:ui

# Debug mode
npm run test:debug
```

### Automated Execution

Tests can be scheduled via:

- **External Scheduler**: Cron jobs, cloud schedulers
- **CI/CD Pipeline**: GitHub Actions (in separate project)
- **Testmo Scheduling**: If available in your plan

---

## 📚 Documentation

### GitHub Repository

Full documentation is available in the GitHub repository:

- **Main README**: https://github.com/screencloud/website-monitor-testmo
- **Documentation Index**: https://github.com/screencloud/website-monitor-testmo/blob/main/docs/DOCUMENTATION.md
- **Setup Guide**: https://github.com/screencloud/website-monitor-testmo/blob/main/docs/setup/SETUP_AND_USAGE.md

### Key Documentation Files

- `README.md` - Main project documentation
- `docs/DOCUMENTATION.md` - Documentation index
- `docs/setup/SETUP_AND_USAGE.md` - Complete setup guide
- `docs/TESTMO_SETUP.md` - Testmo integration guide
- `docs/TESTMO_GITHUB_INTEGRATION.md` - GitHub integration guide

---

## 🔗 Integrations

### Testmo Features Used

- ✅ **Automation Runs**: Test result submission
- ✅ **Test Cases**: Manual test cases in repository
- ✅ **Automation Linking**: Link automated tests to manual cases
- ✅ **Custom Fields**: Environment and metadata tracking
- ✅ **Tags**: Test categorization and filtering
- ✅ **Reports**: Run history and trend analysis

### External Integrations

- **Slack**: Real-time notifications
- **GitHub Issues**: Automatic issue creation on failures
- **GitHub Repository**: Source code and documentation

---

## 🛠️ Troubleshooting

### Common Issues

**Tests Not Submitting to Testmo**
- Check `TESTMO_INSTANCE`, `TESTMO_PROJECT_ID`, and `TESTMO_API_KEY`
- Verify API key has correct permissions
- Check Testmo CLI authentication: `testmo auth:status`

**Slack Notifications Not Working**
- Verify `SLACK_BOT_TOKEN` and `SLACK_CHANNEL` are set
- Check Slack app permissions (chat:write, files:write)
- Verify channel ID if using channel ID instead of name

**Performance Warnings**
- Adjust `performanceThreshold` in `config/websites.json`
- Check network connectivity
- Review website performance

---

## 📞 Support

### Resources

- **GitHub Issues**: https://github.com/screencloud/website-monitor-testmo/issues
- **Testmo Support**: https://support.testmo.com
- **Documentation**: See `docs/` folder in repository

### Getting Help

1. Check documentation in `docs/` folder
2. Review GitHub repository issues
3. Contact Testmo support for Testmo-specific questions

---

**Last Updated**: November 28, 2024  
**Project Status**: ✅ Production Ready

