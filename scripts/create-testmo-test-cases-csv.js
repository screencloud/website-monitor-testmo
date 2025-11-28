#!/usr/bin/env node
/**
 * Create Test Cases CSV for Testmo Import
 * Generates a CSV file that can be imported into Testmo repository
 * 
 * Usage:
 *   node scripts/create-testmo-test-cases-csv.js
 *   Then import the CSV in Testmo: Repository > Import > CSV
 */

const fs = require('fs');
const path = require('path');

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
 * Generate CSV content for Testmo import
 */
function generateCSV() {
  // CSV header (Testmo format)
  const headers = [
    'Name',
    'Description',
    'Priority',
    'Tags',
    'Folder'
  ];
  
  const rows = [headers.join(',')];
  
  enabledWebsites.forEach(website => {
    const description = `Automated monitoring test for ${website.name}

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
- Performance is within threshold`;
    
    const name = `Monitor: ${website.name}`;
    const priority = website.priority || 'Normal';
    const tags = 'monitoring,website,uptime,automated';
    const folder = ''; // Empty folder = top level (since we selected "at top level")
    
    // Escape CSV fields (handle commas and quotes in description)
    const escapeCSV = (field) => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };
    
    rows.push([
      escapeCSV(name),
      escapeCSV(description),
      escapeCSV(priority),
      escapeCSV(tags),
      escapeCSV(folder)
    ].join(','));
  });
  
  return rows.join('\n');
}

/**
 * Main function
 */
function main() {
  console.log('📝 Generating CSV file for Testmo import...\n');
  console.log(`   Websites: ${enabledWebsites.length}\n`);
  
  const csvContent = generateCSV();
        const outputFile = path.join(__dirname, '..', 'docs', 'testmo-test-cases-import.csv');
  
  fs.writeFileSync(outputFile, csvContent, 'utf8');
  
  console.log('✅ CSV file created successfully!');
  console.log(`   File: ${outputFile}\n`);
  console.log('📋 Next steps:');
  console.log('   1. Go to: https://screencloud.testmo.net/repositories/12');
  console.log('   2. Click "Import" button (top right)');
  console.log('   3. Select "CSV" import type');
        console.log('   4. Upload the file: docs/testmo-test-cases-import.csv');
  console.log('   5. Map columns if needed');
  console.log('   6. Import the test cases\n');
  console.log('📊 Test cases to be created:');
  enabledWebsites.forEach(w => {
    console.log(`   • Monitor: ${w.name}`);
  });
}

main();

