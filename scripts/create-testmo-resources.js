#!/usr/bin/env node
/**
 * Create Testmo Resources File
 * Collects screenshots information for Testmo submission
 * 
 * Note: Testmo requires URLs for artifacts, not local file paths.
 * Screenshots are saved locally and included in Slack notifications.
 * For Testmo dashboard viewing, screenshots would need to be hosted
 * at an accessible URL (e.g., via a file server or CDN).
 */

const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-results', 'screenshots');
const RESOURCES_FILE = path.join(__dirname, '..', 'test-results', 'testmo-resources.json');

function createResourcesFile() {
  const resources = {
    artifacts: [],
    links: []
  };

  let screenshotCount = 0;

  // Find all screenshots and collect information
  if (fs.existsSync(SCREENSHOT_DIR)) {
    const websites = fs.readdirSync(SCREENSHOT_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    websites.forEach(websiteName => {
      const websiteDir = path.join(SCREENSHOT_DIR, websiteName);
      const files = fs.readdirSync(websiteDir)
        .filter(file => file.endsWith('.png'));

      // Collect latest screenshot and failure screenshots info
      files.forEach(file => {
        if (file === 'latest.png' || file.startsWith('failure-')) {
          const filePath = path.join(websiteDir, file);
          const relativePath = path.relative(path.join(__dirname, '..'), filePath);
          const stats = fs.statSync(filePath);
          
          // Note: Testmo requires URLs for artifacts, not local paths
          // Screenshots are available locally and in Slack notifications
          screenshotCount++;
        }
      });
    });
  }

  // Create empty resources file structure
  // Screenshots are handled via:
  // 1. Local storage (test-results/screenshots/)
  // 2. Slack notifications (screenshot path included)
  // 3. For Testmo dashboard: would need hosted URLs
  
  if (screenshotCount > 0) {
    fs.writeFileSync(RESOURCES_FILE, JSON.stringify(resources, null, 2));
    console.log(`✅ Testmo resources file created: ${RESOURCES_FILE}`);
    console.log(`   Found ${screenshotCount} screenshot(s) locally`);
    console.log(`   📸 Screenshots saved at: test-results/screenshots/`);
    console.log(`   📱 Screenshot paths included in Slack notifications`);
    console.log(`   💡 Note: For Testmo dashboard viewing, screenshots need hosted URLs`);
    return RESOURCES_FILE;
  } else {
    console.log(`ℹ️  No screenshots found to include in resources file`);
    return null;
  }
}

if (require.main === module) {
  createResourcesFile();
}

module.exports = { createResourcesFile };

