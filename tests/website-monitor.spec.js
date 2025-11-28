// @ts-check
// Load environment variables from .env file
require('dotenv').config();

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Import utilities
const {
  ERROR_CATEGORIES,
  categorizeError,
  checkSSLCertificate,
  checkDNSResolution,
  getBangkokTimestamp,
  calculatePerformanceScore,
  getSeverity,
  loadPreviousStatus,
  detectStatusChange
} = require('../src/utils/monitoring-helpers');
const { sendSlackNotification } = require('../src/utils/slack-notifier');
const { generateDashboard } = require('../src/utils/dashboard-generator');
const { storeMetrics } = require('../src/utils/performance-metrics');
const { getErrorCategoryMetadata } = require('../src/utils/monitoring-helpers');

// GitHub Issues integration (optional)
let GitHubIssues = null;
try {
  GitHubIssues = require('../src/utils/github-issues');
} catch (e) {
  // GitHub integration not available
}

// Import configuration validator
const { loadWebsitesConfig } = require('../src/utils/config-validator');

// Load and validate website configurations
let websitesConfig;
try {
  websitesConfig = loadWebsitesConfig();
} catch (error) {
  console.error('❌ Configuration validation failed:', error.message);
  process.exit(1);
}

// Filter enabled websites
const enabledWebsites = websitesConfig.filter(site => site.enabled !== false);

// Create test results directory
const TEST_RESULTS_DIR = path.join(__dirname, '../test-results');
const SCREENSHOT_DIR = path.join(TEST_RESULTS_DIR, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

/**
 * Website Monitoring Test Suite
 * Comprehensive monitoring with DNS, SSL, HTTP, and performance checks
 */
test.describe('Website Monitoring', () => {
  test.describe('Production Sites', () => {
    /**
     * Test each enabled website
     */
    enabledWebsites.forEach((websiteConfig) => {
  /**
   * Comprehensive monitoring for ${websiteConfig.url}
   * 
   * Monitoring Checks:
   * - HTTP Status Code validation
   * - DNS resolution (IPv4 & IPv6)
   * - SSL certificate validity and expiration
   * - Page load time and performance
   * - Redirect validation (if expected)
   * - Page title verification
   * - Screenshot capture on failures
   * 
   * Performance Threshold: ${websiteConfig.performanceThreshold || 5000}ms
   * Expected Redirect: ${websiteConfig.expectedRedirect || 'None'}
   * Monitoring Interval: ${websiteConfig.checkInterval || 15} minutes
   */
  test(`Monitor: ${websiteConfig.name}`, {
    tag: ['@monitoring', '@website', '@uptime', `@${websiteConfig.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`]
  }, async ({ page, browser }) => {
    const startTime = Date.now();
    const WEBSITE_URL = websiteConfig.url;
    const TIMEOUT = 30000; // 30 seconds
    const PERFORMANCE_THRESHOLD = websiteConfig.performanceThreshold || 5000;

    // Validate URL
    let urlObj;
    try {
      urlObj = new URL(WEBSITE_URL);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Website URL must use HTTP or HTTPS protocol');
      }
    } catch (err) {
      test.fail(true, `Invalid website URL: ${err.message}`);
      return;
    }

    const { timestamp, timestampISO } = getBangkokTimestamp();

    // Check DNS
    let dnsInfo = { success: false, time: 0 };
    try {
      console.log(`🔍 [${websiteConfig.name}] Checking DNS resolution for: ${urlObj.hostname}`);
      dnsInfo = await checkDNSResolution(urlObj.hostname);
      if (dnsInfo.success) {
        console.log(`✓ [${websiteConfig.name}] DNS resolved in ${dnsInfo.time}ms to: ${dnsInfo.addresses.join(', ')}`);
      } else {
        console.warn(`⚠️ [${websiteConfig.name}] DNS resolution failed: ${dnsInfo.error}`);
      }
    } catch (err) {
      console.warn(`⚠️ [${websiteConfig.name}] DNS check error: ${err.message}`);
    }

    // Check SSL
    let sslInfo = { valid: false };
    try {
      console.log(`🔍 [${websiteConfig.name}] Checking SSL certificate...`);
      sslInfo = await checkSSLCertificate(WEBSITE_URL);
      if (sslInfo.valid) {
        console.log(`✓ [${websiteConfig.name}] SSL certificate valid until: ${sslInfo.expirationDate} (${sslInfo.daysUntilExpiry} days remaining)`);
      } else {
        console.warn(`⚠️ [${websiteConfig.name}] SSL certificate check failed: ${sslInfo.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.warn(`⚠️ [${websiteConfig.name}] SSL check error: ${err.message}`);
    }

    // Navigate to website
    let response;
    let statusCode = 0;
    let statusText = '';
    let loadTime = null;
    let title = '';
    let errorMessage = '';
    let isUp = false;
    let finalUrl = '';
    let redirectedToExpected = false;

    try {
      console.log(`🔍 [${websiteConfig.name}] Checking website: ${WEBSITE_URL}`);

      const navigationStart = Date.now();
      response = await page.goto(WEBSITE_URL, {
        waitUntil: 'networkidle',
        timeout: TIMEOUT
      });

      loadTime = Date.now() - navigationStart;
      statusCode = response?.status() || 0;
      statusText = response?.statusText() || '';

      console.log(`✓ [${websiteConfig.name}] Response received`);
      console.log(`✓ [${websiteConfig.name}] Status Code: ${statusCode} ${statusText}`);
      console.log(`✓ [${websiteConfig.name}] Load Time: ${loadTime}ms`);

      finalUrl = page.url();
      console.log(`✓ [${websiteConfig.name}] Final URL after redirects: ${finalUrl}`);

      if (websiteConfig.expectedRedirect && finalUrl.includes(websiteConfig.expectedRedirect)) {
        redirectedToExpected = true;
        console.log(`✅ [${websiteConfig.name}] Successfully redirected to ${websiteConfig.expectedRedirect}`);
      }

      title = await page.title();
      console.log(`✓ [${websiteConfig.name}] Page Title: ${title || '(empty)'}`);

    } catch (navError) {
      loadTime = Date.now() - startTime;

      if (navError.message.includes('timeout') || navError.message.includes('Navigation timeout')) {
        errorMessage = `Navigation timeout after ${TIMEOUT}ms`;
      } else if (navError.message.includes('net::ERR_SSL') || navError.message.includes('SSL')) {
        errorMessage = `SSL/TLS error: ${navError.message}`;
      } else if (navError.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
        errorMessage = `DNS resolution failed: ${navError.message}`;
      } else if (navError.message.includes('net::ERR_CONNECTION_REFUSED')) {
        errorMessage = `Connection refused: ${navError.message}`;
      } else {
        errorMessage = `Navigation error: ${navError.message}`;
      }

      console.error(`❌ [${websiteConfig.name}] ${errorMessage}`);

      try {
        response = navError.response;
        if (response) {
          statusCode = response.status();
          statusText = response.statusText();
        }
      } catch (e) {
        // No response available
      }
    }

    // Check page content for errors
    let bodyText = '';
    try {
      bodyText = await page.textContent('body', { timeout: 5000 }) || '';
      console.log(`✓ [${websiteConfig.name}] Page content retrieved (${bodyText.length} characters)`);
    } catch (e) {
      console.warn(`⚠️ [${websiteConfig.name}] Could not retrieve page content: ${e.message}`);
    }

    // Determine if website is up
    if (statusCode >= 200 && statusCode < 400) {
      const errorPatterns = ['404 Not Found', 'NoSuchBucket', 'Code: NoSuchBucket'];
      let foundError = false;
      for (const pattern of errorPatterns) {
        if (bodyText.includes(pattern)) {
          isUp = false;
          errorMessage = `Page contains error: "${pattern}"`;
          console.error(`❌ [${websiteConfig.name}] ${errorMessage}`);
          foundError = true;
          break;
        }
      }

      if (!foundError && redirectedToExpected) {
        isUp = true;
      } else if (!foundError && finalUrl.includes(urlObj.hostname)) {
        if (!bodyText || bodyText.trim().length === 0) {
          isUp = false;
          errorMessage = 'Page loaded but appears to be empty (no body content)';
        } else {
          isUp = true;
        }
      } else if (!foundError) {
        isUp = true;
      }
    } else if (statusCode >= 400) {
      isUp = false;
      errorMessage = errorMessage || `HTTP ${statusCode} ${statusText}`;
    } else if (statusCode === 0) {
      isUp = false;
    }

    // Take screenshots
    const websiteStatusDir = path.join(SCREENSHOT_DIR, websiteConfig.name.replace(/[^a-zA-Z0-9]/g, '-'));
    if (!fs.existsSync(websiteStatusDir)) {
      fs.mkdirSync(websiteStatusDir, { recursive: true });
    }

    const screenshotTimestamp = timestampISO.replace(/[:.]/g, '-');
    const timestampedScreenshot = path.join(websiteStatusDir, `screenshot-${screenshotTimestamp}.png`);

    try {
      await page.screenshot({
        path: timestampedScreenshot,
        fullPage: true
      });
      console.log(`✓ [${websiteConfig.name}] Timestamped screenshot saved: ${timestampedScreenshot}`);
    } catch (screenshotError) {
      console.error(`❌ [${websiteConfig.name}] Failed to save timestamped screenshot: ${screenshotError.message}`);
    }

    try {
      await page.screenshot({
        path: path.join(websiteStatusDir, 'latest.png'),
        fullPage: true
      });
      console.log(`✓ [${websiteConfig.name}] Latest screenshot saved`);
    } catch (screenshotError) {
      console.error(`❌ [${websiteConfig.name}] Failed to save latest screenshot: ${screenshotError.message}`);
    }

    // Generate status report
    const errorCategory = categorizeError(errorMessage, statusCode);
    const severity = getSeverity(isUp, errorCategory, statusCode);
    const isSlow = loadTime && loadTime > PERFORMANCE_THRESHOLD;
    const performanceScore = calculatePerformanceScore(loadTime, PERFORMANCE_THRESHOLD);

    // Load previous status for comparison
    const statusPath = path.join(websiteStatusDir, 'status.json');
    const previousStatus = loadPreviousStatus(statusPath);
    const changeInfo = detectStatusChange({ isUp, status: isUp ? 'UP' : 'DOWN', timestampISO }, previousStatus);

    const report = {
      name: websiteConfig.name,
      timestamp: timestamp,
      timestampISO: timestampISO,
      timezone: 'Asia/Bangkok (UTC+7)',
      url: WEBSITE_URL,
      finalUrl: finalUrl || WEBSITE_URL,
      isUp: isUp,
      status: isUp ? 'UP' : 'DOWN',
      statusCode: statusCode,
      statusText: statusText || 'N/A',
      loadTime: loadTime,
      title: title || 'N/A',
      redirectedToExpected: redirectedToExpected,
      errorMessage: errorMessage || null,
      errorCategory: errorCategory,
      severity: severity,
      checkDuration: Date.now() - startTime,
      isSlow: isSlow || false,
      performanceThreshold: PERFORMANCE_THRESHOLD,
      performanceScore: performanceScore,
      dns: {
        success: dnsInfo.success,
        time: dnsInfo.time,
        addresses: dnsInfo.addresses || [],
        ipv6Addresses: dnsInfo.ipv6Addresses || [],
        error: dnsInfo.error || null
      },
      ssl: {
        valid: sslInfo.valid,
        expirationDate: sslInfo.expirationDate || null,
        daysUntilExpiry: sslInfo.daysUntilExpiry || null,
        issuer: sslInfo.issuer || null,
        subject: sslInfo.subject || null,
        error: sslInfo.error || null,
        expiringSoon: sslInfo.daysUntilExpiry !== null && sslInfo.daysUntilExpiry < 30
      },
      changeInfo: changeInfo
    };

    // Save status report
    fs.writeFileSync(statusPath, JSON.stringify(report, null, 2));
    
    // Store performance metrics
    storeMetrics(websiteConfig.name, {
      loadTime: loadTime || 0,
      dnsTime: dnsInfo.time || 0,
      sslCheckTime: 0, // Could be tracked separately
      totalTime: report.checkDuration || 0,
      isUp: isUp,
      statusCode: statusCode,
      errorCategory: errorCategory,
      timestamp: timestampISO
    });

    // Create GitHub issue if website is down (optional)
    if (!isUp && GitHubIssues && process.env.GITHUB_TOKEN && process.env.GITHUB_REPOSITORY) {
      try {
        const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
        const githubIssues = new GitHubIssues(process.env.GITHUB_TOKEN, owner, repo);
        
        // Check if issue already exists
        const existingIssue = await githubIssues.findExistingIssue(websiteConfig.name);
        
        if (!existingIssue) {
          // Create new issue
          const workflowRunId = process.env.GITHUB_RUN_ID;
          const workflowRunUrl = process.env.GITHUB_SERVER_URL 
            ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${workflowRunId}`
            : null;
          
          await githubIssues.createWebsiteFailureIssue(report, {
            workflowRunId: workflowRunId,
            workflowRunUrl: workflowRunUrl,
            commitSha: process.env.GITHUB_SHA,
            branch: process.env.GITHUB_REF_NAME || process.env.GITHUB_REF,
            author: process.env.GITHUB_ACTOR
          });
          
          console.log(`✅ [${websiteConfig.name}] GitHub issue created for website failure`);
        } else {
          console.log(`ℹ️ [${websiteConfig.name}] GitHub issue already exists: #${existingIssue.number}`);
        }
      } catch (githubError) {
        console.warn(`⚠️ [${websiteConfig.name}] Failed to create GitHub issue: ${githubError.message}`);
      }
    } else if (!isUp && (!GitHubIssues || !process.env.GITHUB_TOKEN)) {
      // Website is down but GitHub integration not configured
      console.log(`ℹ️ [${websiteConfig.name}] Website is DOWN - GitHub issue creation skipped (not configured)`);
    }

    console.log(`\n📊 [${websiteConfig.name}] Status Report:`);
    console.log(JSON.stringify(report, null, 2));

    // Send Slack notification if configured
    // Supports both Bot Token (preferred) and Webhook methods
    const { getSlackConfig } = require('../src/utils/slack-notifier');
    const slackConfig = getSlackConfig();
    const hasWebhook = websiteConfig.webhookUrl || process.env.SLACK_WEBHOOK_URL;
    
    if (slackConfig.enabled || hasWebhook) {
      const webhookUrl = websiteConfig.webhookUrl || process.env.SLACK_WEBHOOK_URL;
      // Only send notifications when test fails (website is down)
      const shouldNotify = !isUp;
      
      if (shouldNotify) {
        try {
          // Include latest screenshot path if available
          const latestScreenshot = path.join(websiteStatusDir, 'latest.png');
          const screenshotPath = fs.existsSync(latestScreenshot) ? latestScreenshot : null;
          
          console.log(`📤 [${websiteConfig.name}] Sending Slack notification...`);
          const notificationResult = await sendSlackNotification(webhookUrl, `Website ${isUp ? 'UP' : 'DOWN'}`, {
            siteName: websiteConfig.name,
            url: WEBSITE_URL,
            finalUrl: finalUrl || WEBSITE_URL,
            pageTitle: title || 'N/A',
            isUp: isUp,
            statusCode: statusCode,
            loadTime: loadTime,
            checkDuration: Date.now() - startTime,
            redirectedToExpected: websiteConfig.expectedRedirect ? redirectedToExpected : null,
            previousStatus: previousStatus,
            errorMessage: errorMessage,
            errorCategory: errorCategory,
            sslInfo: sslInfo,
            changeInfo: changeInfo,
            screenshotPath: screenshotPath
          });
          
          if (notificationResult) {
            console.log(`✓ [${websiteConfig.name}] Slack notification sent successfully`);
          } else {
            console.warn(`⚠️ [${websiteConfig.name}] Slack notification returned false (may have failed silently)`);
          }
        } catch (slackError) {
          console.error(`❌ [${websiteConfig.name}] Failed to send Slack notification: ${slackError.message}`);
          console.error(`   Error details:`, slackError);
        }
      } else {
        console.log(`ℹ️ [${websiteConfig.name}] Slack notification skipped (test passed - notifications only sent on failures)`);
      }
    } else {
      console.log(`ℹ️ [${websiteConfig.name}] Slack not configured (enabled=${slackConfig.enabled}, hasWebhook=${hasWebhook})`);
    }

    // Assert website is up (Testmo will track this)
    if (!isUp) {
      // Take failure screenshot before failing
      try {
        const failureScreenshot = path.join(websiteStatusDir, `failure-${Date.now()}.png`);
        await page.screenshot({ path: failureScreenshot, fullPage: true });
        console.log(`📸 [${websiteConfig.name}] Failure screenshot saved: ${failureScreenshot}`);
      } catch (screenshotError) {
        console.warn(`⚠️ [${websiteConfig.name}] Failed to save failure screenshot: ${screenshotError.message}`);
      }
      
      test.fail(true, `Website ${websiteConfig.name} is DOWN: ${errorMessage || 'Unknown error'}`);
    }

    // Performance assertion
    if (isSlow) {
      console.warn(`⚠️ [${websiteConfig.name}] Performance warning: Load time ${loadTime}ms exceeds threshold of ${PERFORMANCE_THRESHOLD}ms`);
    }

    // SSL expiration warning
    if (sslInfo.daysUntilExpiry !== null && sslInfo.daysUntilExpiry < 30) {
      console.warn(`⚠️ [${websiteConfig.name}] SSL certificate expiring soon: ${sslInfo.daysUntilExpiry} days remaining`);
    }
  });
    });

    // Add afterEach hook to handle test failures and send Slack notifications
    test.afterEach(async ({ page }, testInfo) => {
    // Only process if test failed
    if (testInfo.status === 'failed' || testInfo.status === 'timedOut') {
      const websiteConfig = enabledWebsites.find(site => testInfo.title.includes(site.name));
      if (!websiteConfig) return;

      const websiteStatusDir = path.join(SCREENSHOT_DIR, websiteConfig.name.replace(/[^a-zA-Z0-9]/g, '-'));
      if (!fs.existsSync(websiteStatusDir)) {
        fs.mkdirSync(websiteStatusDir, { recursive: true });
      }

      const failureMessage = testInfo.error?.message || testInfo.error?.toString() || 'Test failed';
      const failureScreenshot = path.join(websiteStatusDir, `failure-${Date.now()}.png`);
      let screenshotSaved = false;

      // Take screenshot on failure (if page is available)
      try {
        if (page && !page.isClosed()) {
          await page.screenshot({ 
            path: failureScreenshot, 
            fullPage: true 
          });
          screenshotSaved = true;
          console.log(`📸 [${websiteConfig.name}] Failure screenshot saved: ${failureScreenshot}`);
        }
      } catch (screenshotError) {
        console.warn(`⚠️ [${websiteConfig.name}] Failed to save failure screenshot: ${screenshotError.message}`);
      }

      // Send Slack notification on failure
      const { getSlackConfig, sendSlackNotification } = require('../src/utils/slack-notifier');
      const slackConfig = getSlackConfig();
      const hasWebhook = websiteConfig.webhookUrl || process.env.SLACK_WEBHOOK_URL;
      
      if (slackConfig.enabled || hasWebhook) {
        const webhookUrl = websiteConfig.webhookUrl || process.env.SLACK_WEBHOOK_URL;
        try {
          // Load previous status for comparison
          const statusPath = path.join(websiteStatusDir, 'status.json');
          const previousStatus = loadPreviousStatus(statusPath);

          await sendSlackNotification(webhookUrl, `❌ Test Failed: ${websiteConfig.name}`, {
            siteName: websiteConfig.name,
            url: websiteConfig.url,
            finalUrl: websiteConfig.url,
            pageTitle: 'N/A',
            isUp: false,
            statusCode: 0,
            loadTime: 0,
            checkDuration: testInfo.duration || 0,
            redirectedToExpected: null,
            previousStatus: previousStatus,
            errorMessage: failureMessage,
            errorCategory: 'TEST_FAILURE',
            sslInfo: null,
            changeInfo: null,
            screenshotPath: screenshotSaved ? failureScreenshot : null
          });
          console.log(`✓ [${websiteConfig.name}] Failure notification sent to Slack`);
        } catch (slackError) {
          console.warn(`⚠️ [${websiteConfig.name}] Failed to send failure notification: ${slackError.message}`);
        }
      }
    }
    });
  });
});

