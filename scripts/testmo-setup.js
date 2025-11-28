#!/usr/bin/env node
/**
 * Testmo Setup and Verification Script
 * Helps set up and verify Testmo integration
 */

// Load environment variables from .env file
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Testmo Setup and Verification\n');

let errors = [];
let warnings = [];
let success = [];

// Check if Testmo CLI is installed
try {
  const version = execSync('testmo --version', { encoding: 'utf8', stdio: 'pipe' }).trim();
  success.push(`✅ Testmo CLI installed: ${version}`);
} catch (e) {
  errors.push('Testmo CLI not found. Install with: npm install -g @testmo/testmo-cli');
}

// Check environment variables
const testmoInstance = process.env.TESTMO_INSTANCE;
const testmoProjectId = process.env.TESTMO_PROJECT_ID;
const testmoApiKey = process.env.TESTMO_API_KEY;

if (testmoInstance) {
  success.push(`✅ TESTMO_INSTANCE set: ${testmoInstance}`);
} else {
  warnings.push('TESTMO_INSTANCE not set. Set it with: export TESTMO_INSTANCE=your-instance.testmo.net');
}

if (testmoProjectId) {
  success.push(`✅ TESTMO_PROJECT_ID set: ${testmoProjectId}`);
} else {
  warnings.push('TESTMO_PROJECT_ID not set. Set it with: export TESTMO_PROJECT_ID=YOUR_PROJECT_ID');
}

if (testmoApiKey) {
  success.push(`✅ TESTMO_API_KEY set: ${testmoApiKey.substring(0, 10)}...`);
} else {
  warnings.push('TESTMO_API_KEY not set (optional if using auth:login)');
}

// Check .env file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('TESTMO_INSTANCE')) {
    success.push('✅ .env file contains TESTMO_INSTANCE');
  } else {
    warnings.push('.env file exists but TESTMO_INSTANCE not found in it');
  }
  if (envContent.includes('TESTMO_PROJECT_ID')) {
    success.push('✅ .env file contains TESTMO_PROJECT_ID');
  } else {
    warnings.push('.env file exists but TESTMO_PROJECT_ID not found in it');
  }
} else {
  warnings.push('.env file not found. Create it from .env.example');
}

// Check JUnit XML reporter in playwright.config.js
const playwrightConfigPath = path.join(__dirname, '..', 'playwright.config.js');
if (fs.existsSync(playwrightConfigPath)) {
  const configContent = fs.readFileSync(playwrightConfigPath, 'utf8');
  if (configContent.includes('junit') && configContent.includes('test-results/junit.xml')) {
    success.push('✅ Playwright configured for JUnit XML output');
  } else {
    errors.push('Playwright config missing JUnit XML reporter');
  }
} else {
  errors.push('playwright.config.js not found');
}

// Check test-results directory
const testResultsDir = path.join(__dirname, '..', 'test-results');
if (fs.existsSync(testResultsDir)) {
  success.push('✅ test-results directory exists');
} else {
  warnings.push('test-results directory not found (will be created on first run)');
}

// Check authentication status
if (testmoInstance) {
  try {
    const authStatus = execSync(`testmo auth:status --instance ${testmoInstance}`, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      timeout: 5000 
    });
    if (authStatus.includes('authenticated') || authStatus.includes('Logged in')) {
      success.push('✅ Testmo authentication verified');
    } else {
      warnings.push('Testmo authentication status unclear. Run: testmo auth:login');
    }
  } catch (e) {
    warnings.push('Could not verify Testmo authentication. Run: testmo auth:login --instance ' + testmoInstance);
  }
}

// Print results
console.log('📊 Testmo Setup Status:\n');

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
  console.log('Please fix the errors above before using Testmo integration.');
  process.exit(1);
}

// Provide next steps
console.log('🚀 Next Steps:\n');
console.log('1. If Testmo CLI not installed:');
console.log('   npm install -g @testmo/testmo-cli\n');
console.log('2. If not authenticated:');
console.log(`   testmo auth:login --instance ${testmoInstance || 'your-instance.testmo.net'}\n`);
console.log('3. Set environment variables (or add to .env):');
console.log('   export TESTMO_INSTANCE=your-instance.testmo.net');
console.log('   export TESTMO_PROJECT_ID=YOUR_PROJECT_ID\n');
console.log('4. Test submission:');
console.log('   npm run testmo:submit\n');
console.log('5. Set up scheduling in Testmo UI:\n');
console.log('   - Go to your Testmo project');
console.log('   - Navigate to Automation → Schedules');
console.log('   - Create hourly schedule\n');

process.exit(0);

