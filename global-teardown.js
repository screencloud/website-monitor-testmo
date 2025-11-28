/**
 * Global Teardown Hook
 * Generates dashboard after all tests complete
 */

const fs = require('fs');
const path = require('path');
const { generateDashboard } = require('./src/utils/dashboard-generator');

module.exports = async function globalTeardown() {
  console.log('\n📊 Generating dashboard...');
  
  const screenshotsDir = path.join(__dirname, 'test-results', 'screenshots');
  const dashboardPath = path.join(__dirname, 'test-results', 'dashboard.html');
  
  if (!fs.existsSync(screenshotsDir)) {
    console.log('⚠️  No test results found. Skipping dashboard generation.');
    return;
  }

  const results = [];
  
  try {
    const siteDirs = fs.readdirSync(screenshotsDir);
    
    for (const siteDir of siteDirs) {
      const statusPath = path.join(screenshotsDir, siteDir, 'status.json');
      if (fs.existsSync(statusPath)) {
        try {
          const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
          results.push({
            name: status.name,
            url: status.url,
            isUp: status.isUp,
            statusCode: status.statusCode,
            loadTime: status.loadTime,
            errorMessage: status.errorMessage,
            errorCategory: status.errorCategory,
            performanceScore: status.performanceScore,
            performanceThreshold: status.performanceThreshold,
            sslInfo: status.ssl
          });
        } catch (e) {
          console.warn(`⚠️  Could not load status for ${siteDir}: ${e.message}`);
        }
      }
    }

    if (results.length > 0) {
      generateDashboard(results, dashboardPath);
      console.log(`✅ Dashboard generated: ${dashboardPath}`);
    } else {
      console.log('⚠️  No status reports found. Skipping dashboard generation.');
    }
  } catch (error) {
    console.error(`❌ Error generating dashboard: ${error.message}`);
  }
};

