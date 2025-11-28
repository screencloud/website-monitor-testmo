#!/usr/bin/env node
/**
 * Setup Testmo Features
 * 
 * This script helps set up additional Testmo features:
 * - Documentation links
 * - Custom fields configuration
 * - Alert rules
 * - Dashboard setup
 * 
 * Usage:
 *   node scripts/setup-testmo-features.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Testmo Features Setup Guide\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 Features to Set Up:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const features = [
  {
    name: '1. Project Documentation',
    description: 'Upload or link documentation to Testmo',
    url: 'https://screencloud.testmo.net/projects/docs/12',
    steps: [
      'Go to Project > Documentation',
      'Upload docs/TESTMO_PROJECT_DOCUMENTATION.md',
      'Or add links to GitHub repository',
      'See: docs/TESTMO_UPLOAD_GUIDE.md for details'
    ]
  },
  {
    name: '2. Automation Source Documentation',
    description: 'Add automation-specific documentation',
    url: 'https://screencloud.testmo.net/automation/sources/12',
    steps: [
      'Go to Automation > Sources',
      'Add documentation about test execution',
      'Document submission process',
      'Include troubleshooting info'
    ]
  },
  {
    name: '3. Custom Dashboards',
    description: 'Create custom dashboards for monitoring',
    url: 'https://screencloud.testmo.net/projects/12',
    steps: [
      'Go to Project > Reports (or Dashboards)',
      'Create new dashboard',
      'Add widgets for:',
      '  - Test run trends',
      '  - Uptime percentages',
      '  - Performance metrics',
      '  - Failure rates'
    ]
  },
  {
    name: '4. Slack Integration (in Testmo)',
    description: 'Configure Slack notifications in Testmo',
    url: 'https://screencloud.testmo.net/admin/integrations',
    steps: [
      'Go to Admin > Integrations > Slack',
      'Connect Slack workspace',
      'Configure notifications:',
      '  - On test run completion',
      '  - On test failures',
      '  - Daily/weekly summaries',
      'Set notification channel'
    ]
  },
  {
    name: '5. GitHub Issues Integration',
    description: 'Link GitHub issues to test cases',
    url: 'https://screencloud.testmo.net/admin/integrations',
    steps: [
      'Go to Admin > Integrations > GitHub',
      'Connect GitHub account',
      'Enable issue push/link features',
      'Link test cases to GitHub issues',
      'See: docs/TESTMO_GITHUB_INTEGRATION.md'
    ]
  },
  {
    name: '6. Milestones',
    description: 'Create milestones for tracking releases',
    url: 'https://screencloud.testmo.net/projects/12/milestones',
    steps: [
      'Go to Project > Milestones',
      'Create milestone (e.g., "Q1 2025")',
      'Link test runs to milestones',
      'Track progress per milestone'
    ]
  },
  {
    name: '7. Alert Rules',
    description: 'Configure alerts for failures',
    url: 'https://screencloud.testmo.net/projects/12',
    steps: [
      'Go to Project > Settings > Alerts',
      'Create alert rule:',
      '  - Trigger: Test failure',
      '  - Condition: Consecutive failures',
      '  - Action: Send notification',
      'Configure notification channel'
    ]
  },
  {
    name: '8. Custom Fields',
    description: 'Add custom fields to runs',
    url: 'https://screencloud.testmo.net/admin/fields',
    steps: [
      'Go to Admin > Fields',
      'Create custom fields:',
      '  - Environment (production, staging)',
      '  - Priority (critical, high, medium)',
      '  - Website Category',
      'Fields will appear in test runs'
    ]
  }
];

features.forEach((feature, index) => {
  console.log(`${feature.name}`);
  console.log(`   ${feature.description}`);
  console.log(`   URL: ${feature.url}`);
  console.log(`   Steps:`);
  feature.steps.forEach(step => {
    console.log(`     • ${step}`);
  });
  console.log('');
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📚 Documentation:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('• Upload Guide: docs/TESTMO_UPLOAD_GUIDE.md');
console.log('• Project Docs: docs/TESTMO_PROJECT_DOCUMENTATION.md');
console.log('• GitHub Integration: docs/TESTMO_GITHUB_INTEGRATION.md');
console.log('• Full Documentation: docs/DOCUMENTATION.md\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Next Steps:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('1. Upload documentation to Testmo (see TESTMO_UPLOAD_GUIDE.md)');
console.log('2. Set up custom dashboards');
console.log('3. Configure Slack integration in Testmo');
console.log('4. Create milestones for tracking');
console.log('5. Set up alert rules\n');

