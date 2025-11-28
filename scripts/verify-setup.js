#!/usr/bin/env node
/**
 * Setup Verification Script
 * Verifies that all components are properly configured
 */

const fs = require('fs');
const path = require('path');

let errors = [];
let warnings = [];
let success = [];

console.log('🔍 Verifying Website Monitor Testmo Setup...\n');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
  errors.push(`Node.js version ${nodeVersion} detected. Playwright requires Node.js 18 or higher.`);
} else {
  success.push(`✅ Node.js version ${nodeVersion} is compatible`);
}

// Check if dependencies are installed
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  errors.push('node_modules directory not found. Run `npm install` first.');
} else {
  success.push('✅ Dependencies installed (node_modules exists)');
}

// Check if Playwright is installed
const playwrightPath = path.join(nodeModulesPath, '@playwright', 'test');
if (!fs.existsSync(playwrightPath)) {
  errors.push('@playwright/test not found. Run `npm install` first.');
} else {
  success.push('✅ Playwright is installed');
}

// Check utility modules
const utilsDir = path.join(__dirname, '..', 'src', 'utils');
const requiredModules = [
  'monitoring-helpers.js',
  'dashboard-generator.js',
  'slack-notifier.js',
  'status-api.js'
];

requiredModules.forEach(module => {
  const modulePath = path.join(utilsDir, module);
  if (!fs.existsSync(modulePath)) {
    errors.push(`Required module not found: ${module}`);
  } else {
    success.push(`✅ ${module} exists`);
  }
});

// Check configuration files
const configPath = path.join(__dirname, '..', 'config', 'websites.json');
if (!fs.existsSync(configPath)) {
  errors.push('config/websites.json not found');
} else {
  try {
    // Use config validator if available
    try {
      const { validateWebsitesConfig } = require('../src/utils/config-validator');
      const validation = validateWebsitesConfig(configPath);
      
      if (validation.valid) {
        success.push(`✅ Found ${validation.enabledCount} enabled website(s) in configuration`);
        if (validation.warnings.length > 0) {
          validation.warnings.forEach(w => warnings.push(`Config: ${w}`));
        }
      } else {
        validation.errors.forEach(e => errors.push(`Config: ${e}`));
        if (validation.warnings.length > 0) {
          validation.warnings.forEach(w => warnings.push(`Config: ${w}`));
        }
      }
    } catch (validatorError) {
      // Fallback to basic validation if validator not available
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (!Array.isArray(config) || config.length === 0) {
        warnings.push('config/websites.json is empty or invalid');
      } else {
        const enabledSites = config.filter(site => site.enabled !== false);
        success.push(`✅ Found ${enabledSites.length} enabled website(s) in configuration`);
      }
    }
  } catch (e) {
    errors.push(`config/websites.json is invalid JSON: ${e.message}`);
  }
}

// Check .env file
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  warnings.push('.env file not found. Copy .env.example to .env if you need environment variables.');
} else {
  success.push('✅ .env file exists');
}

// Check playwright config
const playwrightConfigPath = path.join(__dirname, '..', 'playwright.config.js');
if (!fs.existsSync(playwrightConfigPath)) {
  errors.push('playwright.config.js not found');
} else {
  success.push('✅ playwright.config.js exists');
}

// Check global teardown
const teardownPath = path.join(__dirname, '..', 'global-teardown.js');
if (!fs.existsSync(teardownPath)) {
  errors.push('global-teardown.js not found');
} else {
  success.push('✅ global-teardown.js exists');
}

// Print results
console.log('📊 Verification Results:\n');

if (success.length > 0) {
  console.log('✅ Success:');
  success.forEach(msg => console.log(`   ${msg}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  Warnings:');
  warnings.forEach(msg => console.log(`   ${msg}`));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ Errors:');
  errors.forEach(msg => console.log(`   ${msg}`));
  console.log('');
  console.log('Please fix the errors above before running tests.');
  process.exit(1);
}

console.log('🎉 Setup verification complete! All checks passed.\n');
console.log('Next steps:');
console.log('  1. If Node.js < 18, install Node.js 18+: nvm install 18 && nvm use 18');
console.log('  2. Install Playwright browsers: npx playwright install chromium');
console.log('  3. Run tests: npm test');
console.log('  4. View dashboard: npm run dashboard');
console.log('  5. Start API server: npm run server\n');

process.exit(0);

