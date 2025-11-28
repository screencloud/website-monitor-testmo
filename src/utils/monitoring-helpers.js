/**
 * Monitoring Helper Utilities
 * Advanced utilities for website monitoring
 */

const https = require('https');
const http = require('http');
const dns = require('dns').promises;
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

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
  UNKNOWN_ERROR: 'unknown_error',
  TEST_FAILURE: 'test_failure'
};

/**
 * Error category metadata with severity and retry information
 */
const ERROR_CATEGORY_METADATA = {
  [ERROR_CATEGORIES.TIMEOUT]: { severity: 'high', retry: true, priority: 1 },
  [ERROR_CATEGORIES.CONNECTION_ERROR]: { severity: 'high', retry: true, priority: 1 },
  [ERROR_CATEGORIES.SSL_ERROR]: { severity: 'high', retry: false, priority: 1 },
  [ERROR_CATEGORIES.DNS_ERROR]: { severity: 'medium', retry: true, priority: 2 },
  [ERROR_CATEGORIES.HTTP_ERROR]: { severity: 'medium', retry: false, priority: 2 },
  [ERROR_CATEGORIES.CONTENT_ERROR]: { severity: 'low', retry: false, priority: 3 },
  [ERROR_CATEGORIES.TEST_FAILURE]: { severity: 'high', retry: true, priority: 1 },
  [ERROR_CATEGORIES.UNKNOWN_ERROR]: { severity: 'medium', retry: false, priority: 2 }
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
 * Checks SSL certificate validity and expiration
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
        // Only disable certificate validation if explicitly allowed via environment variable
        // This is needed for monitoring sites with self-signed certificates
        // For production, set ALLOW_SELF_SIGNED_CERTS=false and ensure all monitored sites have valid certificates
        rejectUnauthorized: process.env.ALLOW_SELF_SIGNED_CERTS !== 'true'
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
            issuer: cert.issuer?.CN || 'Unknown',
            subject: cert.subject?.CN || 'Unknown'
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
 * Checks DNS resolution with IPv4 and IPv6 support
 */
async function checkDNSResolution(hostname) {
  const dnsStartTime = Date.now();
  const result = {
    success: false,
    time: 0,
    addresses: [],
    ipv6Addresses: [],
    error: null
  };

  try {
    // Try IPv4
    try {
      const addresses = await dns.resolve4(hostname);
      result.addresses = addresses;
      result.success = true;
    } catch (e) {
      result.error = e.message;
    }

    // Try IPv6 (optional, don't fail if not available)
    try {
      const ipv6Addresses = await dns.resolve6(hostname);
      result.ipv6Addresses = ipv6Addresses;
    } catch (e) {
      // IPv6 not available, that's okay
    }

    result.time = Date.now() - dnsStartTime;
    return result;
  } catch (err) {
    result.time = Date.now() - dnsStartTime;
    result.error = err.message;
    return result;
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

/**
 * Calculate performance score based on load time
 */
function calculatePerformanceScore(loadTime, threshold) {
  if (!loadTime) return null;
  if (loadTime <= threshold * 0.5) return 'excellent';
  if (loadTime <= threshold * 0.75) return 'good';
  if (loadTime <= threshold) return 'acceptable';
  return 'poor';
}

/**
 * Get severity level based on error and status
 */
function getSeverity(isUp, errorCategory, statusCode) {
  if (isUp) return 'info';
  if (errorCategory === ERROR_CATEGORIES.TIMEOUT || errorCategory === ERROR_CATEGORIES.CONNECTION_ERROR) {
    return 'critical';
  }
  if (statusCode >= 500) return 'critical';
  if (statusCode >= 400) return 'warning';
  return 'warning';
}

/**
 * Get error category metadata (severity, retry, priority)
 */
function getErrorCategoryMetadata(errorCategory) {
  return ERROR_CATEGORY_METADATA[errorCategory] || ERROR_CATEGORY_METADATA[ERROR_CATEGORIES.UNKNOWN_ERROR];
}

/**
 * Load previous status for comparison
 */
function loadPreviousStatus(statusPath) {
  try {
    if (fs.existsSync(statusPath)) {
      const content = fs.readFileSync(statusPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    // Ignore errors
  }
  return null;
}

/**
 * Detect status changes
 */
function detectStatusChange(currentStatus, previousStatus) {
  if (!previousStatus) {
    return {
      changed: true,
      previousStatus: null,
      currentStatus: currentStatus,
      isRecovery: false,
      isDowntime: !currentStatus.isUp
    };
  }

  const statusChanged = previousStatus.isUp !== currentStatus.isUp;
  const isRecovery = !previousStatus.isUp && currentStatus.isUp;
  const isDowntime = previousStatus.isUp && !currentStatus.isUp;

  return {
    changed: statusChanged,
    previousStatus: previousStatus.status,
    currentStatus: currentStatus.status,
    isRecovery,
    isDowntime,
    downtimeDuration: isRecovery ? (Date.now() - new Date(previousStatus.timestampISO).getTime()) : null
  };
}

module.exports = {
  ERROR_CATEGORIES,
  ERROR_CATEGORY_METADATA,
  categorizeError,
  checkSSLCertificate,
  checkDNSResolution,
  getBangkokTimestamp,
  calculatePerformanceScore,
  getSeverity,
  getErrorCategoryMetadata,
  loadPreviousStatus,
  detectStatusChange
};


