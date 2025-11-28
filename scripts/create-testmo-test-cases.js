#!/usr/bin/env node
/**
 * Create Test Cases in Testmo Repository
 * Creates manual test cases for each monitored website in the Testmo repository
 * 
 * Usage:
 *   TESTMO_REPOSITORY_ID=12 node scripts/create-testmo-test-cases.js
 */

require('dotenv').config();
const TestmoAPI = require('../src/utils/testmo-api');
const fs = require('fs');
const path = require('path');

const TESTMO_INSTANCE = process.env.TESTMO_INSTANCE;
const TESTMO_REPOSITORY_ID = process.env.TESTMO_REPOSITORY_ID || process.env.TESTMO_PROJECT_ID;
const TESTMO_API_KEY = process.env.TESTMO_API_KEY;

if (!TESTMO_INSTANCE || !TESTMO_REPOSITORY_ID || !TESTMO_API_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   Required: TESTMO_INSTANCE, TESTMO_REPOSITORY_ID (or TESTMO_PROJECT_ID), TESTMO_API_KEY');
  console.error('\n   Add to .env file:');
  console.error('   TESTMO_REPOSITORY_ID=12');
  process.exit(1);
}

// Load website configuration
const websitesConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'config', 'websites.json'), 'utf8')
);

// Handle both array format and object with websites property
const websites = Array.isArray(websitesConfig) 
  ? websitesConfig 
  : (websitesConfig.websites || []);
  
const enabledWebsites = websites.filter(w => w.enabled !== false);

/**
 * Create test case in Testmo repository
 */
async function createTestCase(api, repositoryId, website) {
  try {
    const testCase = {
      name: `Monitor: ${website.name}`,
      description: `Automated monitoring test for ${website.name}

**Website URL**: ${website.url}
**Expected Status**: ${website.expectedStatus || '200 OK'}
**Performance Threshold**: ${website.performanceThreshold || 5000}ms
${website.expectedRedirect ? `**Expected Redirect**: ${website.expectedRedirect}` : ''}

## Monitoring Checks
- ✅ HTTP Status Code
- ✅ DNS Resolution
- ✅ SSL Certificate Validation
- ✅ Page Load Time
- ✅ Content Verification
- ✅ Screenshot Capture

## Automation
This test case is linked to automated Playwright tests that run every 15 minutes.
Test results are automatically submitted to Testmo automation runs.

## Test Steps
1. Navigate to ${website.url}
2. Verify HTTP status code is ${website.expectedStatus || '200'}
3. Check DNS resolution succeeds
4. Verify SSL certificate is valid
5. Measure page load time (should be < ${website.performanceThreshold || 5000}ms)
6. Verify page content loads correctly
7. Capture screenshot for verification

## Expected Results
- Website is accessible
- All checks pass
- Performance is within threshold`,
      type: 'test_case',
      priority: website.priority || 'normal',
      tags: ['monitoring', 'website', 'uptime', 'automated']
    };

    console.log(`📝 Creating test case for: ${website.name}`);
    
    const response = await api.createTestCase(repositoryId, testCase);
    
    console.log(`✅ Created test case: ${response.id || response.key || 'N/A'}`);
    return response;
  } catch (error) {
    if (error.message.includes('404')) {
      console.warn(`⚠️  Repository ${repositoryId} not found or API endpoint may differ`);
      console.warn(`   Check Testmo API documentation for correct endpoint`);
      console.warn(`   Error: ${error.message}`);
    } else if (error.message.includes('401') || error.message.includes('403')) {
      console.error(`❌ Authentication failed. Check your TESTMO_API_KEY`);
      console.error(`   Error: ${error.message}`);
    } else {
      console.error(`❌ Failed to create test case for ${website.name}: ${error.message}`);
    }
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Creating test cases in Testmo repository...\n');
  console.log(`   Instance: ${TESTMO_INSTANCE}`);
  console.log(`   Repository ID: ${TESTMO_REPOSITORY_ID}`);
  console.log(`   Repository URL: ${TESTMO_INSTANCE.replace(/\/$/, '')}/repositories/${TESTMO_REPOSITORY_ID}`);
  console.log(`   Websites: ${enabledWebsites.length}\n`);

  const api = new TestmoAPI(TESTMO_INSTANCE, TESTMO_REPOSITORY_ID, TESTMO_API_KEY);
  
  const results = [];
  
  for (const website of enabledWebsites) {
    const testCase = await createTestCase(api, TESTMO_REPOSITORY_ID, website);
    if (testCase) {
      results.push({
        website: website.name,
        websiteUrl: website.url,
        testCaseId: testCase.id,
        testCaseKey: testCase.key,
        testCaseName: testCase.name
      });
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Created: ${results.length} test cases`);
  console.log(`   ❌ Failed: ${enabledWebsites.length - results.length} test cases`);
  
  if (results.length > 0) {
    // Save mapping for automation linking
    const mappingFile = path.join(__dirname, '..', 'config', 'testmo-test-cases.json');
    fs.writeFileSync(mappingFile, JSON.stringify(results, null, 2));
    console.log(`\n✅ Test case mappings saved to: ${mappingFile}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Enable automation linking in Testmo:');
    console.log('      Admin > Automation > Enable automation linking');
    console.log('   2. Link automated tests to these test cases:');
    console.log('      Edit each test case > Link to automated test');
    console.log('   3. View test cases at:');
    console.log(`      ${TESTMO_INSTANCE.replace(/\/$/, '')}/repositories/${TESTMO_REPOSITORY_ID}`);
    console.log('\n📋 Test Cases Created:');
    results.forEach(r => {
      console.log(`   • ${r.testCaseName} (${r.testCaseKey || r.testCaseId})`);
    });
  } else {
    console.log('\n⚠️  No test cases were created.');
    console.log('   Check:');
    console.log('   - Testmo API key is valid');
    console.log('   - Repository ID is correct');
    console.log('   - You have permissions to create test cases');
    console.log('   - Testmo API endpoint is correct');
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
