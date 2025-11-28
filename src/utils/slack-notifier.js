/**
 * Slack Notifier
 * Sends notifications to Slack via Bot Token (Web API) or Webhooks
 */

// Load environment variables if not already loaded
if (!process.env.SLACK_BOT_TOKEN && !process.env.SLACK_WEBHOOK_URL) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available, continue without it
  }
}

const https = require('https');
const { URL } = require('url');
const { getBangkokTimestamp, getSeverity, getErrorCategoryMetadata } = require('./monitoring-helpers');

/**
 * Get Slack configuration from environment variables
 */
function getSlackConfig() {
  const botToken = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_CHANNEL;
  const channelId = process.env.SLACK_CHANNEL_ID;
  const notificationEnabled = process.env.SLACK_NOTIFICATION === 'true';
  
  // Check if all required config is present
  const hasRequiredConfig = !!(botToken && (channel || channelId));
  
  return {
    botToken,
    channel: channelId || channel, // Prefer channel ID if provided
    enabled: notificationEnabled && hasRequiredConfig // Return boolean, not channel value
  };
}

/**
 * Send Slack notification via Bot Token (Web API)
 */
async function sendViaBotToken(botToken, channel, payload, retries = 3, delay = 1000) {
  return new Promise((resolve) => {
    const attempt = (remainingRetries) => {
      try {
        // Remove username and icon_emoji for Web API, use blocks instead
        const apiPayload = {
          channel: channel,
          text: payload.attachments[0].title || 'Website Monitor Notification',
          attachments: payload.attachments,
          username: payload.username,
          icon_emoji: payload.icon_emoji
        };

        const data = JSON.stringify(apiPayload);
        const options = {
          hostname: 'slack.com',
          port: 443,
          path: '/api/chat.postMessage',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${botToken}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
          },
          timeout: 10000
        };

        const req = https.request(options, (res) => {
          let responseData = '';
          res.on('data', (chunk) => {
            responseData += chunk;
          });
          res.on('end', () => {
            const response = JSON.parse(responseData || '{}');
            if (res.statusCode >= 200 && res.statusCode < 300 && response.ok) {
              if (retries - remainingRetries > 0) {
                console.log(`✓ Slack notification sent after ${retries - remainingRetries} retry(ies)`);
              }
              resolve(true);
            } else {
              // Retry on 5xx errors or rate limits, but not on 4xx (client errors)
              if ((res.statusCode >= 500 || res.statusCode === 429) && remainingRetries > 0) {
                const retryAfter = res.statusCode === 429 && response.retry_after ? response.retry_after * 1000 : delay;
                console.warn(`⚠️  Slack API failed with ${res.statusCode}, retrying... (${remainingRetries} attempts left)`);
                setTimeout(() => attempt(remainingRetries - 1), retryAfter);
              } else {
                console.error(`❌ Slack API failed: ${res.statusCode} - ${response.error || responseData.substring(0, 200)}`);
                if (response.error) {
                  console.error(`   Error code: ${response.error}`);
                  if (response.error === 'channel_not_found') {
                    console.error(`   💡 Tip: Make sure the bot is invited to the channel: ${channel}`);
                  } else if (response.error === 'not_authed' || response.error === 'invalid_auth') {
                    console.error(`   💡 Tip: Check your SLACK_BOT_TOKEN is correct`);
                  } else if (response.error === 'missing_scope') {
                    console.error(`   💡 Tip: Bot needs 'chat:write' scope`);
                  }
                }
                resolve(false);
              }
            }
          });
        });

        req.on('error', (err) => {
          if (remainingRetries > 0) {
            console.warn(`⚠️  Slack API error: ${err.message}, retrying... (${remainingRetries} attempts left)`);
            setTimeout(() => attempt(remainingRetries - 1), delay);
          } else {
            console.error(`Slack API error after ${retries} attempts: ${err.message}`);
            resolve(false);
          }
        });

        req.on('timeout', () => {
          req.destroy();
          if (remainingRetries > 0) {
            console.warn(`⚠️  Slack API timeout, retrying... (${remainingRetries} attempts left)`);
            setTimeout(() => attempt(remainingRetries - 1), delay);
          } else {
            console.error(`Slack API timeout after ${retries} attempts`);
            resolve(false);
          }
        });

        req.write(data);
        req.end();
      } catch (err) {
        if (remainingRetries > 0) {
          console.warn(`⚠️  Slack API error: ${err.message}, retrying... (${remainingRetries} attempts left)`);
          setTimeout(() => attempt(remainingRetries - 1), delay);
        } else {
          console.error(`Slack API error after ${retries} attempts: ${err.message}`);
          resolve(false);
        }
      }
    };

    attempt(retries);
  });
}

/**
 * Send Slack notification
 * Supports both Bot Token (Web API) and Webhook methods
 */
async function sendSlackNotification(webhookUrl, message, options = {}) {
  // Check if Bot Token method is configured
  const slackConfig = getSlackConfig();
  
  if (slackConfig.enabled) {
    // Use Bot Token method
    if (!slackConfig.botToken || !slackConfig.channel) {
      console.warn('Slack Bot Token or Channel not configured properly');
      return false;
    }
    return sendSlackNotificationViaBot(options);
  }
  
  // Fallback to webhook method
  if (!webhookUrl) {
    console.warn('No Slack webhook URL or Bot Token provided');
    return false;
  }
  
  return sendSlackNotificationViaWebhook(webhookUrl, options);
}

/**
 * Calculate response time trend compared to previous check
 */
function calculateResponseTimeTrend(currentLoadTime, previousStatus) {
  if (!previousStatus || !previousStatus.loadTime || !currentLoadTime) {
    return null;
  }

  const previousLoadTime = previousStatus.loadTime;
  const diff = currentLoadTime - previousLoadTime;
  const percentChange = (diff / previousLoadTime) * 100;

  // Consider within 5% as "same"
  if (Math.abs(percentChange) < 5) {
    return '→ Same as previous check';
  } else if (diff < 0) {
    return `↓ ${Math.abs(percentChange).toFixed(1)}% faster than previous`;
  } else {
    return `↑ ${percentChange.toFixed(1)}% slower than previous`;
  }
}

/**
 * Get status summary message
 */
function getStatusSummaryMessage(isUp, siteName) {
  if (isUp) {
    return `✅ Website is active and running fine!`;
  } else {
    return `❌ Website is experiencing issues!`;
  }
}

/**
 * Send Slack notification via Bot Token
 */
async function sendSlackNotificationViaBot(options = {}) {
  const slackConfig = getSlackConfig();
  if (!slackConfig.enabled) {
    return false;
  }

  const { timestamp } = getBangkokTimestamp();
  const color = options.color || (options.isUp ? '#36a64f' : '#ff0000');
  const emoji = options.isUp ? '✅' : '❌';
  const status = options.isUp ? 'UP' : 'DOWN';
  const statusMessage = options.isUp ? 'Running Fine!' : 'Issues Detected!';

  // Calculate response time trend
  const responseTimeTrend = calculateResponseTimeTrend(options.loadTime, options.previousStatus);

  const payload = {
    username: 'Website Monitor',
    icon_emoji: ':bar_chart:',
    attachments: [
      {
        color: color,
        title: `📊 Website Monitoring Results`,
        text: `${emoji} Website Status: ${status} - ${statusMessage}`,
        fields: [
          {
            title: '🌐 URL',
            value: options.url || 'N/A',
            short: true
          }
        ],
        footer: 'Website Monitor Testmo',
        ts: Math.floor(Date.now() / 1000)
      }
    ]
  };

  // Add Final URL if different from URL (redirect occurred)
  if (options.finalUrl && options.finalUrl !== options.url) {
    payload.attachments[0].fields.push({
      title: '🔗 Final URL',
      value: options.finalUrl,
      short: true
    });
  }

  // Add Page Title if available
  if (options.pageTitle && options.pageTitle !== 'N/A') {
    payload.attachments[0].fields.push({
      title: '📄 Page Title',
      value: options.pageTitle,
      short: false
    });
  }

  // Add Status indicator
  const statusEmoji = options.isUp ? '🟢' : '🔴';
  payload.attachments[0].fields.push({
    title: `${statusEmoji} Status`,
    value: status,
    short: true
  });

  // Add Status Code
  payload.attachments[0].fields.push({
    title: '📊 Status Code',
    value: String(options.statusCode || 'N/A'),
    short: true
  });

  // Add Load Time
  payload.attachments[0].fields.push({
    title: '⏱️ Load Time',
    value: options.loadTime ? `${options.loadTime}ms` : 'N/A',
    short: true
  });

  // Add Response Time Trend if available
  if (responseTimeTrend) {
    payload.attachments[0].fields.push({
      title: '📈 Response Time Trend',
      value: responseTimeTrend,
      short: true
    });
  }

  // Add Check Duration
  if (options.checkDuration) {
    payload.attachments[0].fields.push({
      title: '⏳ Check Duration',
      value: `${options.checkDuration}ms`,
      short: true
    });
  }

  // Add Timestamp
  payload.attachments[0].fields.push({
    title: '🕐 Check Time',
    value: timestamp,
    short: true
  });

  // Add Redirect Confirmation if redirect is expected
  if (options.redirectedToExpected !== null && options.redirectedToExpected !== undefined) {
    const redirectEmoji = options.redirectedToExpected ? '✅' : '⚠️';
    const redirectMessage = options.redirectedToExpected ? 'Yes (Expected)' : 'No (Unexpected)';
    payload.attachments[0].fields.push({
      title: `${redirectEmoji} Redirected to Auth`,
      value: redirectMessage,
      short: true
    });
  }

  // Add error information if website is down
  if (options.errorMessage) {
    payload.attachments[0].fields.push({
      title: '❌ Error',
      value: options.errorMessage.substring(0, 500),
      short: false
    });
  }

  if (options.errorCategory) {
    const errorMetadata = getErrorCategoryMetadata(options.errorCategory);
    payload.attachments[0].fields.push({
      title: '🔴 Error Category',
      value: options.errorCategory,
      short: true
    });
    payload.attachments[0].fields.push({
      title: '⚠️ Severity',
      value: errorMetadata.severity.toUpperCase(),
      short: true
    });
    payload.attachments[0].fields.push({
      title: '📊 Priority',
      value: `P${errorMetadata.priority}`,
      short: true
    });
  }

  if (options.sslInfo && !options.sslInfo.valid) {
    payload.attachments[0].fields.push({
      title: '⚠️ SSL Certificate',
      value: options.sslInfo.error || 'Invalid',
      short: true
    });
  }

  if (options.changeInfo && options.changeInfo.changed) {
    const changeEmoji = options.changeInfo.isRecovery ? '🟢' : '🔴';
    payload.attachments[0].fields.push({
      title: '🔴 Status Change',
      value: `${changeEmoji} ${options.changeInfo.isRecovery ? 'Recovered' : 'Downtime detected'}`,
      short: false
    });
  }

  // Add screenshot information if available
  if (options.screenshotPath) {
    // Convert absolute path to relative path for better readability
    const screenshotPath = options.screenshotPath.replace(process.cwd() + '/', '');
    payload.attachments[0].fields.push({
      title: '📸 Screenshot',
      value: `Saved at: \`${screenshotPath}\`\nView in Testmo dashboard or locally`,
      short: false
    });
  }

  // Add status summary message
  const summaryMessage = getStatusSummaryMessage(options.isUp, options.siteName);
  payload.attachments[0].fields.push({
    title: summaryMessage,
    value: '',
    short: false
  });

  return sendViaBotToken(slackConfig.botToken, slackConfig.channel, payload);
}

/**
 * Send Slack notification via Webhook (legacy method)
 */
async function sendSlackNotificationViaWebhook(webhookUrl, options = {}) {
  const { timestamp } = getBangkokTimestamp();
  const color = options.color || (options.isUp ? '#36a64f' : '#ff0000');
  const emoji = options.isUp ? '✅' : '❌';
  const status = options.isUp ? 'UP' : 'DOWN';
  const statusMessage = options.isUp ? 'Running Fine!' : 'Issues Detected!';

  // Calculate response time trend
  const responseTimeTrend = calculateResponseTimeTrend(options.loadTime, options.previousStatus);

  const payload = {
    username: 'Website Monitor',
    icon_emoji: ':bar_chart:',
    attachments: [
      {
        color: color,
        title: `📊 Website Monitoring Results`,
        text: `${emoji} Website Status: ${status} - ${statusMessage}`,
        fields: [
          {
            title: '🌐 URL',
            value: options.url || 'N/A',
            short: true
          }
        ],
        footer: 'Website Monitor Testmo',
        ts: Math.floor(Date.now() / 1000)
      }
    ]
  };

  // Add Final URL if different from URL (redirect occurred)
  if (options.finalUrl && options.finalUrl !== options.url) {
    payload.attachments[0].fields.push({
      title: '🔗 Final URL',
      value: options.finalUrl,
      short: true
    });
  }

  // Add Page Title if available
  if (options.pageTitle && options.pageTitle !== 'N/A') {
    payload.attachments[0].fields.push({
      title: '📄 Page Title',
      value: options.pageTitle,
      short: false
    });
  }

  // Add Status indicator
  const statusEmoji = options.isUp ? '🟢' : '🔴';
  payload.attachments[0].fields.push({
    title: `${statusEmoji} Status`,
    value: status,
    short: true
  });

  // Add Status Code
  payload.attachments[0].fields.push({
    title: '📊 Status Code',
    value: String(options.statusCode || 'N/A'),
    short: true
  });

  // Add Load Time
  payload.attachments[0].fields.push({
    title: '⏱️ Load Time',
    value: options.loadTime ? `${options.loadTime}ms` : 'N/A',
    short: true
  });

  // Add Response Time Trend if available
  if (responseTimeTrend) {
    payload.attachments[0].fields.push({
      title: '📈 Response Time Trend',
      value: responseTimeTrend,
      short: true
    });
  }

  // Add Check Duration
  if (options.checkDuration) {
    payload.attachments[0].fields.push({
      title: '⏳ Check Duration',
      value: `${options.checkDuration}ms`,
      short: true
    });
  }

  // Add Timestamp
  payload.attachments[0].fields.push({
    title: '🕐 Check Time',
    value: timestamp,
    short: true
  });

  // Add Redirect Confirmation if redirect is expected
  if (options.redirectedToExpected !== null && options.redirectedToExpected !== undefined) {
    const redirectEmoji = options.redirectedToExpected ? '✅' : '⚠️';
    const redirectMessage = options.redirectedToExpected ? 'Yes (Expected)' : 'No (Unexpected)';
    payload.attachments[0].fields.push({
      title: `${redirectEmoji} Redirected to Auth`,
      value: redirectMessage,
      short: true
    });
  }

  // Add error information if website is down
  if (options.errorMessage) {
    payload.attachments[0].fields.push({
      title: '❌ Error',
      value: options.errorMessage.substring(0, 500),
      short: false
    });
  }

  if (options.errorCategory) {
    const errorMetadata = getErrorCategoryMetadata(options.errorCategory);
    payload.attachments[0].fields.push({
      title: '🔴 Error Category',
      value: options.errorCategory,
      short: true
    });
    payload.attachments[0].fields.push({
      title: '⚠️ Severity',
      value: errorMetadata.severity.toUpperCase(),
      short: true
    });
    payload.attachments[0].fields.push({
      title: '📊 Priority',
      value: `P${errorMetadata.priority}`,
      short: true
    });
  }

  if (options.sslInfo && !options.sslInfo.valid) {
    payload.attachments[0].fields.push({
      title: '⚠️ SSL Certificate',
      value: options.sslInfo.error || 'Invalid',
      short: true
    });
  }

  if (options.changeInfo && options.changeInfo.changed) {
    const changeEmoji = options.changeInfo.isRecovery ? '🟢' : '🔴';
    payload.attachments[0].fields.push({
      title: '🔴 Status Change',
      value: `${changeEmoji} ${options.changeInfo.isRecovery ? 'Recovered' : 'Downtime detected'}`,
      short: false
    });
  }

  // Add screenshot information if available
  if (options.screenshotPath) {
    // Convert absolute path to relative path for better readability
    const screenshotPath = options.screenshotPath.replace(process.cwd() + '/', '');
    payload.attachments[0].fields.push({
      title: '📸 Screenshot',
      value: `Saved at: \`${screenshotPath}\`\nView in Testmo dashboard or locally`,
      short: false
    });
  }

  // Add status summary message
  const summaryMessage = getStatusSummaryMessage(options.isUp, options.siteName);
  payload.attachments[0].fields.push({
    title: summaryMessage,
    value: '',
    short: false
  });

  return sendWebhook(webhookUrl, payload);
}

/**
 * Send webhook request with retry logic
 */
function sendWebhook(webhookUrl, payload, retries = 3, delay = 1000) {
  return new Promise((resolve) => {
    const attempt = (remainingRetries) => {
      try {
        const url = new URL(webhookUrl);
        const data = JSON.stringify(payload);
        const options = {
          hostname: url.hostname,
          port: url.port || 443,
          path: url.pathname + url.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
          },
          timeout: 5000
        };

        const req = https.request(options, (res) => {
          let responseData = '';
          res.on('data', (chunk) => {
            responseData += chunk;
          });
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              if (retries - remainingRetries > 0) {
                console.log(`✓ Slack notification sent after ${retries - remainingRetries} retry(ies)`);
              }
              resolve(true);
            } else {
              // Retry on 5xx errors, but not on 4xx (client errors)
              if (res.statusCode >= 500 && remainingRetries > 0) {
                console.warn(`⚠️  Slack webhook failed with ${res.statusCode}, retrying... (${remainingRetries} attempts left)`);
                setTimeout(() => attempt(remainingRetries - 1), delay);
              } else {
                console.error(`Slack webhook failed: ${res.statusCode} - ${responseData.substring(0, 200)}`);
                resolve(false);
              }
            }
          });
        });

        req.on('error', (err) => {
          if (remainingRetries > 0) {
            console.warn(`⚠️  Slack webhook error: ${err.message}, retrying... (${remainingRetries} attempts left)`);
            setTimeout(() => attempt(remainingRetries - 1), delay);
          } else {
            console.error(`Slack webhook error after ${retries} attempts: ${err.message}`);
            resolve(false);
          }
        });

        req.on('timeout', () => {
          req.destroy();
          if (remainingRetries > 0) {
            console.warn(`⚠️  Slack webhook timeout, retrying... (${remainingRetries} attempts left)`);
            setTimeout(() => attempt(remainingRetries - 1), delay);
          } else {
            console.error(`Slack webhook timeout after ${retries} attempts`);
            resolve(false);
          }
        });

        req.write(data);
        req.end();
      } catch (err) {
        if (remainingRetries > 0) {
          console.warn(`⚠️  Slack webhook error: ${err.message}, retrying... (${remainingRetries} attempts left)`);
          setTimeout(() => attempt(remainingRetries - 1), delay);
        } else {
          console.error(`Slack webhook error after ${retries} attempts: ${err.message}`);
          resolve(false);
        }
      }
    };

    attempt(retries);
  });
}

/**
 * Send summary notification
 */
async function sendSummaryNotification(webhookUrl, summary) {
  // Check if Bot Token method is configured
  const slackConfig = getSlackConfig();
  
  if (slackConfig.enabled) {
    return sendSummaryNotificationViaBot(summary);
  }
  
  // Fallback to webhook method
  if (!webhookUrl) return false;

  const { timestamp } = getBangkokTimestamp();
  const totalSites = summary.total || 0;
  const upSites = summary.up || 0;
  const downSites = summary.down || 0;
  const uptimePercentage = totalSites > 0 ? ((upSites / totalSites) * 100).toFixed(2) : 0;

  const color = downSites === 0 ? '#36a64f' : '#ff0000';
  const emoji = downSites === 0 ? '✅' : '⚠️';

  const payload = {
    username: 'Website Monitor',
    icon_emoji: ':bar_chart:',
    attachments: [
      {
        color: color,
        title: `${emoji} Monitoring Summary`,
        fields: [
          {
            title: 'Total Sites',
            value: String(totalSites),
            short: true
          },
          {
            title: 'Sites Up',
            value: String(upSites),
            short: true
          },
          {
            title: 'Sites Down',
            value: String(downSites),
            short: true
          },
          {
            title: 'Uptime',
            value: `${uptimePercentage}%`,
            short: true
          },
          {
            title: 'Timestamp',
            value: timestamp,
            short: false
          }
        ],
        footer: 'Website Monitor Testmo',
        ts: Math.floor(Date.now() / 1000)
      }
    ]
  };

  if (summary.downSites && summary.downSites.length > 0) {
    const downList = summary.downSites.map(site => `• ${site.name}: ${site.errorMessage || 'Unknown error'}`).join('\n');
    payload.attachments[0].fields.push({
      title: 'Down Sites',
      value: downList.substring(0, 1000),
      short: false
    });
  }

  return sendWebhook(webhookUrl, payload);
}

/**
 * Send summary notification via Bot Token
 */
async function sendSummaryNotificationViaBot(summary) {
  const slackConfig = getSlackConfig();
  if (!slackConfig.enabled) {
    return false;
  }

  const { timestamp } = getBangkokTimestamp();
  const totalSites = summary.total || 0;
  const upSites = summary.up || 0;
  const downSites = summary.down || 0;
  const uptimePercentage = totalSites > 0 ? ((upSites / totalSites) * 100).toFixed(2) : 0;

  const color = downSites === 0 ? '#36a64f' : '#ff0000';
  const emoji = downSites === 0 ? '✅' : '⚠️';

  const payload = {
    username: 'Website Monitor',
    icon_emoji: ':bar_chart:',
    attachments: [
      {
        color: color,
        title: `${emoji} Monitoring Summary`,
        fields: [
          {
            title: 'Total Sites',
            value: String(totalSites),
            short: true
          },
          {
            title: 'Sites Up',
            value: String(upSites),
            short: true
          },
          {
            title: 'Sites Down',
            value: String(downSites),
            short: true
          },
          {
            title: 'Uptime',
            value: `${uptimePercentage}%`,
            short: true
          },
          {
            title: 'Timestamp',
            value: timestamp,
            short: false
          }
        ],
        footer: 'Website Monitor Testmo',
        ts: Math.floor(Date.now() / 1000)
      }
    ]
  };

  if (summary.downSites && summary.downSites.length > 0) {
    const downList = summary.downSites.map(site => `• ${site.name}: ${site.errorMessage || 'Unknown error'}`).join('\n');
    payload.attachments[0].fields.push({
      title: 'Down Sites',
      value: downList.substring(0, 1000),
      short: false
    });
  }

  return sendViaBotToken(slackConfig.botToken, slackConfig.channel, payload);
}

module.exports = {
  sendSlackNotification,
  sendSummaryNotification,
  getSlackConfig
};

