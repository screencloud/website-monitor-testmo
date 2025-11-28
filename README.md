# Website Monitor - Testmo Edition 🚀

A production-ready website monitoring solution built with **Playwright Test** and **Testmo**, featuring advanced monitoring capabilities, beautiful dashboards, and intelligent alerting.

## ✨ Features

- 🔍 **Comprehensive Monitoring**: HTTP status, DNS resolution, SSL certificate validation, performance metrics
- 📊 **Beautiful Dashboard**: Auto-generated HTML dashboard with real-time status visualization
- 🔔 **Smart Notifications**: Slack integration with intelligent alerting (only on status changes or critical issues)
- 📸 **Screenshot Capture**: Automatic screenshots on failures with timestamped history
- 🎯 **Error Categorization**: Intelligent error classification (timeout, SSL, DNS, connection, HTTP, content errors)
- ⚡ **Performance Tracking**: Load time monitoring with configurable thresholds
- 🔐 **SSL Monitoring**: Certificate expiration tracking with early warnings
- 📈 **Status Change Detection**: Tracks downtime duration and recovery events
- 🌏 **Timezone Support**: All timestamps in Bangkok timezone (UTC+7)

## 🏗️ Architecture

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
│       └── slack-notifier.js     # Slack notification handler
├── test-results/              # Test outputs (screenshots, reports, dashboard)
├── playwright.config.js       # Playwright configuration
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 18 or higher (required for Playwright)
  - Check your version: `node --version`
  - If using nvm: `nvm install 18 && nvm use 18`

### 1. Install Dependencies

```bash
npm install
npx playwright install chromium
```

### 2. Configure Websites

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
  }
]
```

**Note**: `webhookUrl` can be `null` if using Slack Bot Token method (recommended).

### 3. Configure Environment (Optional)

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### 4. Run Tests

```bash
# Run all tests
npm test

# Run with UI mode
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Debug mode
npm run test:debug

# View HTML report
npm run test:report
```

## 📊 Dashboard

After running tests, a beautiful HTML dashboard is automatically generated at `test-results/dashboard.html`. Open it in your browser to see:

- Real-time status of all monitored websites
- Performance metrics and load times
- SSL certificate information
- Error details and categorization
- Visual performance indicators

## 🔔 Slack Notifications

Notifications are sent to Slack when:
- Website goes down
- Website recovers (downtime ends)
- SSL certificate is expiring soon (< 30 days)
- Status changes occur

### Configuration Methods

**Method 1: Bot Token (Recommended)** ✅
- Uses Slack Web API for more features and flexibility
- Configure in `.env`:
  ```bash
  SLACK_BOT_TOKEN=xoxb-your-bot-token
  SLACK_CHANNEL=#test-slack-e2e
  SLACK_NOTIFICATION=true
  SLACK_CHANNEL_ID=  # Optional
  ```

**Method 2: Webhook (Legacy)**
- Per website in `config/websites.json` (`webhookUrl` field)
- Globally via `SLACK_WEBHOOK_URL` environment variable

See **[docs/setup/SLACK_SETUP.md](docs/setup/SLACK_SETUP.md)** for complete setup guide.

## 🎯 Testmo Integration

### Quick Start

See **[docs/setup/TESTMO_QUICK_START.md](docs/setup/TESTMO_QUICK_START.md)** for a 5-minute setup guide.

### Setup Testmo Project

1. Create a new project in Testmo
2. Configure automation runs to use Playwright
3. Set up scheduled runs (e.g., every hour)

### Verify Testmo Setup

```bash
npm run testmo:verify
```

This checks:
- ✅ Testmo CLI installation
- ✅ Environment variables
- ✅ Authentication status
- ✅ Playwright configuration

### Submit Test Results

```bash
# Install Testmo CLI (if not already installed)
npm install -g @testmo/testmo-cli

# Set environment variables
export TESTMO_INSTANCE=your-instance.testmo.net
export TESTMO_PROJECT_ID=YOUR_PROJECT_ID

# Submit results to Testmo
npm run testmo:submit
```

The enhanced script will:
- ✅ Validate environment variables
- ✅ Run tests with Playwright
- ✅ Generate JUnit XML report
- ✅ Submit results to Testmo
- ✅ Show you the Testmo run URL

### Testmo Benefits

- ✅ **Centralized Test Management**: All test runs tracked in one place
- ✅ **Historical Data**: Track uptime trends over time
- ✅ **Team Collaboration**: Share results with your team
- ✅ **Scheduling**: Built-in scheduling (no GitHub Actions needed)
- ✅ **Reporting**: Advanced reporting and analytics
- ✅ **Integrations**: Native Slack, Jira, and other integrations

## 📁 Test Results Structure

```
test-results/
├── dashboard.html                    # HTML dashboard
├── results.json                      # JSON test results
├── junit.xml                        # JUnit XML (for Testmo)
├── playwright-report/               # Playwright HTML report
└── screenshots/
    └── Website-Name/
        ├── status.json              # Latest status report
        ├── latest.png              # Latest screenshot
        └── screenshot-*.png       # Timestamped screenshots
```

## 🔧 Configuration Options

### Website Configuration (`config/websites.json`)

```json
{
  "name": "Website Name",              // Display name
  "url": "https://example.com",       // URL to monitor
  "enabled": true,                     // Enable/disable monitoring
  "performanceThreshold": 5000,       // Load time threshold (ms)
  "webhookUrl": null,                  // Slack webhook (optional, null if using Bot Token)
  "expectedRedirect": "domain.com"     // Expected redirect domain (optional)
}
```

### Playwright Configuration (`playwright.config.js`)

- **Timeout**: 60 seconds per test
- **Retries**: 2 retries on CI
- **Workers**: 1 worker on CI (sequential), parallel locally
- **Reporters**: HTML, JSON, JUnit XML, Console

## 📈 Monitoring Capabilities

### HTTP Status Monitoring
- Status code validation (2xx, 3xx = success)
- Response time tracking
- Redirect validation

### DNS Resolution
- IPv4 resolution check
- IPv6 resolution check (optional)
- DNS resolution time

### SSL Certificate Validation
- Certificate validity check
- Expiration date tracking
- Days until expiry calculation
- Early warning (< 30 days)

### Performance Monitoring
- Page load time measurement
- Performance score calculation (excellent/good/acceptable/poor)
- Configurable thresholds

### Error Detection
- Timeout detection
- SSL/TLS errors
- DNS resolution failures
- Connection errors
- HTTP errors (4xx, 5xx)
- Content errors (404 pages, empty content)

## 🎨 Dashboard Features

- **Real-time Status**: Live status of all websites
- **Performance Metrics**: Visual performance indicators
- **Error Details**: Comprehensive error information
- **SSL Status**: Certificate expiration tracking
- **Responsive Design**: Works on desktop and mobile
- **Beautiful UI**: Modern gradient design with smooth animations

## 🔐 Security

- Environment variables for sensitive data
- `.env` file in `.gitignore`
- Secure webhook handling
- No hardcoded credentials

## 📝 Scripts

- `npm test` - Run all tests
- `npm run test:ui` - Run with Playwright UI
- `npm run test:headed` - Run in headed mode (see browser)
- `npm run test:debug` - Debug mode
- `npm run test:report` - View HTML report
- `npm run verify` - Verify setup (Node.js version, dependencies, config)
- `npm run testmo:setup` - Testmo setup and verification
- `npm run testmo:verify` - Verify Testmo configuration
- `npm run testmo:submit` - Submit test results to Testmo
- `npm run install:browsers` - Install Chromium browser
- `npm run dashboard` - Manually generate dashboard from existing results
- `npm run server` - Start status API server (port 3000)
- `npm run verify` - Verify setup and configuration

## 📚 Documentation

- **[README.md](README.md)** - This file (main documentation)
- **[docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)** - 📚 **Complete documentation index**
- **[docs/setup/SETUP_AND_USAGE.md](docs/setup/SETUP_AND_USAGE.md)** - ⭐ **Complete setup and usage guide**
- **[docs/setup/SLACK_SETUP.md](docs/setup/SLACK_SETUP.md)** - ⭐ **Slack Bot Token integration guide**
- **[docs/setup/TESTMO_QUICK_START.md](docs/setup/TESTMO_QUICK_START.md)** - Quick Testmo setup
- **[FEATURES.md](FEATURES.md)** - Complete feature overview
- **[docs/security/SECURITY_AUDIT.md](docs/security/SECURITY_AUDIT.md)** - Security audit report
- **[docs/security/SECURITY_CONFIG.md](docs/security/SECURITY_CONFIG.md)** - Security configuration
- **[docs/ENV_CONFIG.md](docs/ENV_CONFIG.md)** - Environment variables guide
- **[docs/status/IMPROVEMENTS.md](docs/status/IMPROVEMENTS.md)** - Future enhancements roadmap

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT

## 🙏 Acknowledgments

- Built with [Playwright](https://playwright.dev/)
- Integrated with [Testmo](https://www.testmo.com/)
- Inspired by modern monitoring best practices

---

**Made with ❤️ for reliable website monitoring**
