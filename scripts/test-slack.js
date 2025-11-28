#!/usr/bin/env node
/**
 * Test Slack Notification
 * Sends a test notification to verify Slack integration
 */

require('dotenv').config();
const { sendSlackNotification, getSlackConfig } = require('../src/utils/slack-notifier');

async function testSlack() {
  console.log('🧪 Testing Slack Notification...\n');
  
  const config = getSlackConfig();
  console.log('📋 Configuration:');
  console.log('  SLACK_NOTIFICATION:', process.env.SLACK_NOTIFICATION);
  console.log('  SLACK_BOT_TOKEN:', process.env.SLACK_BOT_TOKEN ? 'Set (' + process.env.SLACK_BOT_TOKEN.substring(0, 20) + '...)' : 'Not set');
  console.log('  SLACK_CHANNEL:', process.env.SLACK_CHANNEL || 'Not set');
  console.log('  SLACK_CHANNEL_ID:', process.env.SLACK_CHANNEL_ID || 'Not set');
  console.log('  Config enabled:', config.enabled);
  console.log('  Config channel:', config.channel);
  console.log('');

  if (!config.enabled) {
    console.error('❌ Slack is not enabled!');
    console.error('   Check your .env file:');
    console.error('   - SLACK_NOTIFICATION must be "true"');
    console.error('   - SLACK_BOT_TOKEN must be set');
    console.error('   - SLACK_CHANNEL or SLACK_CHANNEL_ID must be set');
    process.exit(1);
  }

  console.log('📤 Sending test notification...\n');
  
  try {
    const result = await sendSlackNotification(null, '🧪 Test Notification', {
      siteName: 'Test Website',
      url: 'https://example.com',
      isUp: true,
      statusCode: 200,
      loadTime: 1000,
      errorMessage: null,
      errorCategory: null,
      sslInfo: { valid: true, daysUntilExpiry: 365 },
      changeInfo: { changed: true, isRecovery: false, isDowntime: false },
      screenshotPath: null
    });

    if (result) {
      console.log('✅ Test notification sent successfully!');
      console.log('   Check your Slack channel: #test-slack-e2e');
    } else {
      console.error('❌ Notification returned false (may have failed silently)');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error sending notification:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

testSlack();

