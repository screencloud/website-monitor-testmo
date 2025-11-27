// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const dns = require('dns').promises;
const { URL } = require('url');

// Load website configurations
const websitesConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../config/websites.json'), 'utf8')
);

// Filter enabled websites
const enabledWebsites = websitesConfig.filter(site => site.enabled !== false);

/**
 * Error categories for better categorization
 */
const ERROR_CATEGORIES = {
  TIMEOUT: 'timeout',
  SSL_ERROR: 'ssl_error',
  DNS_ERROR: 'dns_error',
  CONNECTION_ERROR: 'connection_error',
  HTTP_ERROR: 'http_error',
  CONTENT_ERROR: 'content_error',
  UNKNOWN_ERROR: 'unknown_error'
};

/**
 * Categorizes errors into specific types
 */
function categorizeError(errorMessage, statusCode) {
  if (!errorMessage) return ERROR_CATEGORIES.UNKNOWN_ERROR;
  const msg = errorMessage.toLowerCase();
  if (msg.includes('timeout')) return ERROR_CATEGORIES.TIMEOUT;
  if (msg.includes('ssl') || msg.includes('tls') || msg.includes('certificate')) return ERROR_CATEGORIES.SSL_ERROR;
  if (msg.includes('dns') || msg.includes('name_not_resolved')) return ERROR_CATEGORIES.DNS_ERROR;
  if (msg.includes('connection_refused') || msg.includes('connection_error')) return ERROR_CATEGORIES.CONNECTION_ERROR;
  if (statusCode >= 400) return ERROR_CATEGORIES.HTTP_ERROR;
  if (msg.includes('404') || msg.includes('nosuchbucket') || msg.includes('error')) return ERROR_CATEGORIES.CONTENT_ERROR;
  return ERROR_CATEGORIES.UNKNOWN_ERROR;
}

/**
 * Checks SSL certificate validity
 */
async function checkSSLCertificate(url) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const port = urlObj.port || 443;
      const options = {
        hostname: hostname,
        port: port,
        method: 'HEAD',
        rejectUnauthorized: false
      };
      const req = https.request(options, (res) => {
        const cert = res.socket.getPeerCertificate();
        if (cert && cert.valid_to) {
          const expirationDate = new Date(cert.valid_to);
          const daysUntilExpiry = Math.floor((expirationDate - new Date()) / (1000 * 60 * 60 * 24));
          resolve({
            valid: true,
            expirationDate: expirationDate.toISOString(),
            daysUntilExpiry: daysUntilExpiry,
            issuer: cert.issuer?.CN || 'Unknown'
          });
        } else {
          resolve({ valid: false, error: 'No certificate found' });
        }
        req.destroy();
      });
      req.on('error', (err) => {
        resolve({ valid: false, error: err.message });
      });
      req.setTimeout(5000, () => {
        req.destroy();
        resolve({ valid: false, error: 'Timeout' });
      });
      req.end();
    } catch (err) {
      resolve({ valid: false, error: err.message });
    }
  });
}

/**
 * Checks DNS resolution
 */
async function checkDNSResolution(hostname) {
  const dnsStartTime = Date.now();
  try {
    const addresses = await dns.resolve4(hostname);
    const dnsTime = Date.now() - dnsStartTime;
    return {
      success: true,
      time: dnsTime,
      addresses: addresses
    };
  } catch (err) {
    const dnsTime = Date.now() - dnsStartTime;
    return {
      success: false,
      time: dnsTime,
      error: err.message
    };
  }
}

/**
 * Generate timestamp in Bangkok timezone
 */
function getBangkokTimestamp() {
  const now = new Date();
  const timestampISO = now.toISOString();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  const hours = parts.find(p => p.type === 'hour').value;
  const minutes = parts.find(p => p.type === 'minute').value;
  const seconds = parts.find(p => p.type === 'second').value;
  const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} (BKK)`;
  return { timestamp, timestampISO };
}

// Create test results directory
const TEST_RESULTS_DIR = path.join(__dirname, '../test-results');
const SCREENSHOT_DIR = path.join(TEST_RESULTS_DIR, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

/**
 * Test each enabled website
 */
enabledWebsites.forEach((websiteConfig) => {
  test(`Monitor: ${websiteConfig.name}`, async ({ page, browser }) => {
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
      statusCode = response.status();
      statusText = response.statusText();

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
    const severity = isUp ? 'info' : (errorCategory === ERROR_CATEGORIES.TIMEOUT || errorCategory === ERROR_CATEGORIES.CONNECTION_ERROR ? 'critical' : 'warning');
    const isSlow = loadTime && loadTime > PERFORMANCE_THRESHOLD;

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
      error: errorMessage || null,
      errorCategory: errorCategory,
      severity: severity,
      checkDuration: Date.now() - startTime,
      isSlow: isSlow || false,
      performanceThreshold: PERFORMANCE_THRESHOLD,
      dns: {
        success: dnsInfo.success,
        time: dnsInfo.time,
        addresses: dnsInfo.addresses || [],
        error: dnsInfo.error || null
      },
      ssl: {
        valid: sslInfo.valid,
        expirationDate: sslInfo.expirationDate || null,
        daysUntilExpiry: sslInfo.daysUntilExpiry || null,
        issuer: sslInfo.issuer || null,
        error: sslInfo.error || null,
        expiringSoon: sslInfo.daysUntilExpiry !== null && sslInfo.daysUntilExpiry < 30
      }
    };

    // Save status report
    const statusPath = path.join(websiteStatusDir, 'status.json');
    fs.writeFileSync(statusPath, JSON.stringify(report, null, 2));

    console.log(`\n📊 [${websiteConfig.name}] Status Report:`);
    console.log(JSON.stringify(report, null, 2));

    // Assert website is up (Testmo will track this)
    if (!isUp) {
      test.fail(true, `Website ${websiteConfig.name} is DOWN: ${errorMessage}`);
    }

    // Performance assertion
    if (isSlow) {
      console.warn(`⚠️ [${websiteConfig.name}] Performance warning: Load time ${loadTime}ms exceeds threshold of ${PERFORMANCE_THRESHOLD}ms`);
    }
  });
});

