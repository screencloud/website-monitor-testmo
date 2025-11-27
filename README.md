# Website Monitor - Testmo Integration

Website monitoring solution using Playwright Test framework and Testmo for test execution and reporting.

## 🎯 Overview

This repository contains a Testmo-integrated website monitoring solution that:
- Monitors websites using Playwright Test framework
- Executes tests via Testmo scheduled runs
- Captures screenshots and generates status reports
- Integrates with Slack for notifications (via Testmo)
- Tracks DNS, SSL, and performance metrics

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- Testmo account (company account)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd website-monitor-testmo
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npm run install:browsers
```

4. Configure websites to monitor:
Edit `config/websites.json` with your website configurations.

### Running Tests Locally

```bash
# Run all tests
npm test

# Run with UI mode
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Debug mode
npm run test:debug

# View test report
npm run test:report
```

## 📁 Project Structure

```
website-monitor-testmo/
├── config/
│   └── websites.json          # Website configurations
├── tests/
│   └── website-monitor.spec.js # Playwright test file
├── test-results/              # Test results and screenshots (gitignored)
├── playwright.config.js       # Playwright configuration
├── package.json
└── README.md
```

## ⚙️ Configuration

### Website Configuration (`config/websites.json`)

```json
[
  {
    "name": "Website Name",
    "url": "https://example.com",
    "enabled": true,
    "checkInterval": 15,
    "performanceThreshold": 5000,
    "slackChannel": "#alerts",
    "webhookUrl": null,
    "expectedRedirect": "example.com"
  }
]
```

### Playwright Configuration

The `playwright.config.js` file is configured for:
- Test execution in `tests/` directory
- HTML and JSON reporters (Testmo uses JSON)
- Screenshots on failure
- Video recording on failure
- Trace collection on retry

## 🔗 Testmo Integration

### Setting Up Testmo

1. **Create a Testmo Project:**
   - Log in to your Testmo account
   - Create a new project for website monitoring

2. **Configure Test Execution:**
   - Set up scheduled runs (e.g., hourly)
   - Configure test execution environment
   - Set up Slack integration in Testmo

3. **Upload Test Results:**
   - Testmo will automatically pick up JSON reports from `test-results/results.json`
   - Screenshots and artifacts can be uploaded as test attachments

### Testmo Features Used

- ✅ Scheduled test runs
- ✅ Test result tracking
- ✅ Screenshot attachments
- ✅ Slack notifications (via Testmo)
- ✅ Test history and trends
- ✅ Performance metrics

## 📊 Test Output

Tests generate:
- **Status Reports:** `test-results/screenshots/{website-name}/status.json`
- **Screenshots:** Timestamped and latest screenshots
- **Test Results:** JSON format for Testmo import

## 🔔 Notifications

Slack notifications are handled through Testmo's built-in notification system:
- Configure Slack webhook in Testmo settings
- Testmo will send notifications on test failures
- Custom notification rules can be configured in Testmo

## 🆚 Comparison with GitHub Actions Version

| Feature | GitHub Actions | Testmo |
|---------|---------------|--------|
| Execution | GitHub Actions runners | Testmo infrastructure |
| Scheduling | GitHub Actions cron | Testmo scheduler |
| Notifications | Custom Slack scripts | Testmo built-in |
| Reporting | Custom dashboard | Testmo test management |
| Screenshots | Committed to repo | Testmo attachments |
| Minutes Usage | GitHub Actions minutes | No GitHub Actions usage |

## 📝 Notes

- This repository is independent from the GitHub Actions version
- Both can run in parallel for comparison
- Testmo handles all scheduling and execution
- No GitHub Actions workflows needed

## 🤝 Contributing

1. Make changes to test files
2. Test locally with `npm test`
3. Commit and push changes
4. Testmo will pick up changes on next scheduled run

## 📄 License

MIT

