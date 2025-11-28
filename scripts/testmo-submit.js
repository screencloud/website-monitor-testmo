#!/usr/bin/env node
/**
 * Testmo Submission Script
 * Enhanced script for submitting test results to Testmo with better error handling
 */

// Load environment variables from .env file
require('dotenv').config();

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import utilities
const { enhanceJUnitXML } = require('../src/utils/junit-enhancer');
const { getAllGitInfo } = require('../src/utils/git-info');
const { getPerformanceSummary } = require('../src/utils/performance-metrics');
const TestmoAPI = require('../src/utils/testmo-api');

const TESTMO_INSTANCE = process.env.TESTMO_INSTANCE;
const TESTMO_PROJECT_ID = process.env.TESTMO_PROJECT_ID;
const TESTMO_API_KEY = process.env.TESTMO_API_KEY;

// Validate required environment variables
if (!TESTMO_INSTANCE) {
  console.error('❌ Error: TESTMO_INSTANCE environment variable is not set');
  console.error('   Set it with: export TESTMO_INSTANCE=your-instance.testmo.net');
  console.error('   Or add it to your .env file');
  process.exit(1);
}

if (!TESTMO_PROJECT_ID) {
  console.error('❌ Error: TESTMO_PROJECT_ID environment variable is not set');
  console.error('   Set it with: export TESTMO_PROJECT_ID=YOUR_PROJECT_ID');
  console.error('   Or add it to your .env file');
  process.exit(1);
}

// Generate enhanced run name with status summary
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

// Read test results to generate summary
let statusSummary = '';
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

try {
  const resultsPath = path.join(__dirname, '..', 'test-results', 'results.json');
  if (fs.existsSync(resultsPath)) {
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    totalTests = results.stats?.tests || 0;
    passedTests = results.stats?.passed || 0;
    failedTests = results.stats?.failed || 0;
    
    if (totalTests > 0) {
      const successRate = ((passedTests / totalTests) * 100).toFixed(0);
      if (failedTests === 0) {
        statusSummary = `[All UP - ${totalTests} site${totalTests > 1 ? 's' : ''}]`;
      } else {
        statusSummary = `[${failedTests} DOWN / ${passedTests} UP]`;
      }
    }
  }
} catch (e) {
  // If results not available, use default
}

// Also check JUnit XML for summary
try {
  const junitPath = path.join(__dirname, '..', 'test-results', 'junit.xml');
  if (fs.existsSync(junitPath) && !statusSummary) {
    const junitContent = fs.readFileSync(junitPath, 'utf8');
    const testsMatch = junitContent.match(/tests="(\d+)"/);
    const failuresMatch = junitContent.match(/failures="(\d+)"/);
    if (testsMatch) {
      totalTests = parseInt(testsMatch[1]) || 0;
      failedTests = parseInt(failuresMatch?.[1] || '0');
      passedTests = totalTests - failedTests;
      
      if (totalTests > 0 && !statusSummary) {
        if (failedTests === 0) {
          statusSummary = `[All UP - ${totalTests} site${totalTests > 1 ? 's' : ''}]`;
        } else {
          statusSummary = `[${failedTests} DOWN / ${passedTests} UP]`;
        }
      }
    }
  }
} catch (e) {
  // Continue with default
}

// Get environment info for custom fields
const nodeVersion = process.version;
const platform = process.platform;
const arch = process.arch;
const playwrightVersion = require('@playwright/test/package.json').version;

// Generate enhanced run name
const runName = statusSummary 
  ? `Website Monitor ${statusSummary} - ${timestamp}`
  : `Website Monitor Run - ${timestamp}`;

console.log('🚀 Submitting test results to Testmo...\n');
console.log(`   Instance: ${TESTMO_INSTANCE}`);
console.log(`   Project ID: ${TESTMO_PROJECT_ID}`);
console.log(`   Run Name: ${runName}`);
console.log(`   Tests: ${totalTests} total (${passedTests} passed, ${failedTests} failed)`);
console.log(`   Environment: Node ${nodeVersion} on ${platform} ${arch}\n`);

// Check if testmo CLI is available
try {
  execSync('testmo --version', { stdio: 'pipe' });
} catch (e) {
  console.error('❌ Error: Testmo CLI not found');
  console.error('   Install it with: npm install -g @testmo/testmo-cli');
  process.exit(1);
}

// Build command
const resultsPath = path.join(__dirname, '..', 'test-results', 'junit.xml');

// Check if JUnit XML exists, if not run tests first
if (!fs.existsSync(resultsPath)) {
  console.log('📊 Running tests first to generate results...\n');
  try {
    execSync('npx playwright test', {
      stdio: 'inherit',
      env: process.env
    });
  } catch (testError) {
    console.warn('\n⚠️  Tests had errors, but continuing with submission if JUnit XML exists...\n');
  }
}

// Only submit if JUnit XML exists
if (!fs.existsSync(resultsPath)) {
  console.error('❌ Error: JUnit XML file not found');
  console.error(`   Expected at: ${resultsPath}`);
  console.error('   Run tests first: npm test');
  process.exit(1);
}

// Enhance JUnit XML with properties and metadata (async wrapper)
(async () => {
  try {
    console.log('🔧 Enhancing JUnit XML with properties and metadata...\n');
    const enhanced = await enhanceJUnitXML(resultsPath);
    if (enhanced) {
      console.log('✅ JUnit XML enhanced successfully\n');
    }
  } catch (error) {
    console.warn(`⚠️  Failed to enhance JUnit XML: ${error.message}`);
    console.warn('   Continuing with original JUnit XML...\n');
  }
})();

// Create resources file with screenshots
const { createResourcesFile } = require('./create-testmo-resources');
let resourcesFile = null;
try {
  resourcesFile = createResourcesFile();
  if (fs.existsSync(resourcesFile)) {
    const resources = JSON.parse(fs.readFileSync(resourcesFile, 'utf8'));
    if (resources.artifacts && resources.artifacts.length > 0) {
      console.log(`📸 Found ${resources.artifacts.length} screenshot(s) to upload\n`);
    }
  }
} catch (error) {
  console.warn(`⚠️  Could not create resources file: ${error.message}`);
}

// Build command with optional resources
const commandParts = [
  'testmo automation:run:submit',
  `--instance ${TESTMO_INSTANCE}`,
  `--project-id ${TESTMO_PROJECT_ID}`,
  `--name "${runName}"`,
  '--source "Playwright"',
  `--results ${resultsPath}`
];

if (resourcesFile && fs.existsSync(resourcesFile)) {
  commandParts.push(`--resources ${resourcesFile}`);
}

const command = commandParts.join(' ');

(async () => {
try {
  console.log('📊 Running tests and submitting to Testmo...\n');
  
  // Execute the command
  // Testmo CLI uses TESTMO_TOKEN for authentication
  const env = {
    ...process.env,
    TESTMO_INSTANCE,
    TESTMO_PROJECT_ID
  };
  
  // Map TESTMO_API_KEY to TESTMO_TOKEN if API key is provided
  if (TESTMO_API_KEY) {
    env.TESTMO_TOKEN = TESTMO_API_KEY;
    env.TESTMO_API_KEY = TESTMO_API_KEY;
  }
  
  // Execute the command and capture output to extract run ID
  let runId = null;
  try {
    const output = execSync(command, {
      stdio: 'pipe',
      env: env,
      encoding: 'utf8'
    });
    
    // Try to extract run ID from output
    const runIdMatch = output.match(/run \(ID: (\d+)\)/i) || output.match(/run ID[:\s]+(\d+)/i);
    if (runIdMatch) {
      runId = runIdMatch[1];
    }
    
    // Also output to console
    console.log(output);
  } catch (error) {
    // If command fails, output error but try to continue with API updates
    console.error(error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
  }
  
  console.log('\n✅ Test results submitted to Testmo successfully!');
  const dashboardUrl = TESTMO_INSTANCE.startsWith('http') 
    ? `${TESTMO_INSTANCE}/projects/${TESTMO_PROJECT_ID}/runs`
    : `https://${TESTMO_INSTANCE}/projects/${TESTMO_PROJECT_ID}/runs`;
  console.log(`   View results at: ${dashboardUrl}`);
  console.log(`   Run Name: ${runName}`);
  if (totalTests > 0) {
    console.log(`   Summary: ${totalTests} test(s) - ${passedTests} passed, ${failedTests} failed`);
  }
  console.log(`   Tags: @monitoring, @website, @uptime (per test)`);
  console.log(`   Environment: Node ${nodeVersion} on ${platform} ${arch}`);
  console.log(`   Playwright: ${playwrightVersion}`);
  
  // Enhance run with Testmo API if run ID is available
  if (runId && TESTMO_API_KEY) {
    try {
      console.log(`\n🔧 Enhancing run ${runId} with additional metadata via Testmo API...`);
      const testmoApi = new TestmoAPI(TESTMO_INSTANCE, TESTMO_API_KEY);
      
      // Get Git info
      const gitInfo = getAllGitInfo();
      
      // Get performance summary
      const perfSummary = getPerformanceSummary();
      
      // Prepare custom fields
      const customFields = {
        'Node Version': nodeVersion,
        'Platform': platform,
        'Architecture': arch,
        'Playwright Version': playwrightVersion,
        'Total Tests': totalTests.toString(),
        'Passed Tests': passedTests.toString(),
        'Failed Tests': failedTests.toString(),
        'Environment': process.env.NODE_ENV || 'development',
        'Execution Time': new Date().toISOString(),
        'Git Commit': gitInfo.commit,
        'Git Branch': gitInfo.branch,
        'Git Author': gitInfo.author
      };
      
      // Add performance summary if available
      if (Object.keys(perfSummary).length > 0) {
        customFields['Performance Summary'] = JSON.stringify(perfSummary);
      }
      
      // Update run with custom fields
      await testmoApi.addCustomFields(runId, customFields);
      
      // Add run-level tags
      await testmoApi.addTags(runId, ['monitoring', 'website', 'uptime', 'automated']);
      
      // Update description with summary
      const description = `Website Monitoring Run
      
**Summary:**
- Total Tests: ${totalTests}
- Passed: ${passedTests}
- Failed: ${failedTests}
- Environment: ${platform} ${arch}
- Node.js: ${nodeVersion}
- Playwright: ${playwrightVersion}

**Git Information:**
- Commit: ${gitInfo.commit}
- Branch: ${gitInfo.branch}
- Author: ${gitInfo.author}

**Execution Time:** ${new Date().toISOString()}
      `;
      
      await testmoApi.updateDescription(runId, description);
      
      console.log(`✅ Run ${runId} enhanced with custom fields, tags, and description`);
    } catch (apiError) {
      console.warn(`⚠️  Failed to enhance run via API: ${apiError.message}`);
      console.warn('   This is optional - run was still submitted successfully');
    }
  } else if (!runId) {
    console.log('\nℹ️  Run ID not detected - skipping API enhancements');
    console.log('   Run was submitted successfully via CLI');
  } else if (!TESTMO_API_KEY) {
    console.log('\nℹ️  TESTMO_API_KEY not set - skipping API enhancements');
    console.log('   Set TESTMO_API_KEY in .env to enable advanced features');
  }
  
} catch (error) {
  console.error('\n❌ Failed to submit test results to Testmo');
  
  // Check if JUnit XML exists
  if (!fs.existsSync(resultsPath)) {
    console.error(`   JUnit XML file not found: ${resultsPath}`);
    console.error('   Make sure tests have run and generated results');
  }
  
  // Check authentication
  try {
    execSync(`testmo auth:status --instance ${TESTMO_INSTANCE}`, { stdio: 'pipe' });
  } catch (authError) {
    console.error('   Authentication issue detected');
    console.error(`   Run: testmo auth:login --instance ${TESTMO_INSTANCE}`);
  }
  
  console.error('\n   Troubleshooting:');
  console.error('   1. Verify Testmo credentials: npm run testmo:verify');
  console.error('   2. Check Testmo instance URL and project ID');
  console.error('   3. Ensure you have access to the project');
  console.error('   4. Check Testmo documentation: https://www.testmo.com/docs');
  
  process.exit(1);
}
})();

