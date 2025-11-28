/**
 * JUnit XML Enhancer
 * Adds properties, metadata, and enhanced information to JUnit XML reports
 */

const fs = require('fs');
const { parseString, Builder } = require('xml2js');
const { getAllGitInfo } = require('./git-info');

/**
 * Enhance JUnit XML with properties and metadata
 */
async function enhanceJUnitXML(xmlPath) {
  if (!fs.existsSync(xmlPath)) {
    console.warn(`⚠️  JUnit XML file not found: ${xmlPath}`);
    return false;
  }

  try {
    const xml = fs.readFileSync(xmlPath, 'utf8');
    const result = await new Promise((resolve, reject) => {
      parseString(xml, { 
        explicitArray: false,
        mergeAttrs: true,
        explicitRoot: false
      }, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });

    // Get Git information
    const gitInfo = getAllGitInfo();

    // Get environment information
    const envInfo = {
      node_version: process.version,
      platform: process.platform,
      architecture: process.arch,
      playwright_version: require('@playwright/test/package.json').version || 'N/A',
      browser: 'chromium',
      environment: process.env.NODE_ENV || 'development',
      execution_time: new Date().toISOString(),
      ...gitInfo
    };

    // Process each testsuite
    const processTestsuite = (testsuite) => {
      // Add properties to testsuite
      if (!testsuite.properties) {
        testsuite.properties = [{}];
      }
      if (!testsuite.properties[0].property) {
        testsuite.properties[0].property = [];
      }

      // Add environment properties
      Object.entries(envInfo).forEach(([key, value]) => {
        testsuite.properties[0].property.push({
          $: {
            name: key,
            value: String(value)
          }
        });
      });
    };

    if (result.testsuites) {
      if (result.testsuites.testsuite) {
        // Handle array of testsuites
        const suites = Array.isArray(result.testsuites.testsuite) 
          ? result.testsuites.testsuite 
          : [result.testsuites.testsuite];
        suites.forEach(processTestsuite);
      } else if (result.testsuites.$) {
        // Handle testsuites with attributes but no testsuite children yet
        // This shouldn't happen, but handle it
      }
    } else if (result.testsuite) {
      // Handle single testsuite format
      processTestsuite(result.testsuite);
    }

    // Enhance testcase elements with metadata
    const enhanceTestCases = (testcases) => {
      if (!testcases) return;
      
      // Handle both array and single object
      const cases = Array.isArray(testcases) ? testcases : [testcases];
      
      cases.forEach((testcase) => {
        // Extract test name to get website config
        const testName = (testcase.$ && testcase.$.name) || testcase.name || '';
        
        // Add properties to testcase if not exists
        if (!testcase.properties) {
          testcase.properties = [{}];
        }
        if (!testcase.properties[0].property) {
          testcase.properties[0].property = [];
        }

        // Try to extract URL from test name or system-out
        const systemOut = (testcase['system-out'] && 
          (typeof testcase['system-out'] === 'string' 
            ? testcase['system-out'] 
            : (testcase['system-out'][0]?._ || testcase['system-out'][0] || ''))) || '';
        const urlMatch = systemOut.match(/Checking website: (https?:\/\/[^\s]+)/);
        const url = urlMatch ? urlMatch[1] : 'N/A';

        // Add test-specific properties
        testcase.properties[0].property.push(
          { $: { name: 'test_url', value: url } },
          { $: { name: 'test_type', value: 'website_monitoring' } },
          { $: { name: 'test_category', value: 'uptime' } }
        );

        // Add attachment property if screenshot exists
        const screenshotMatch = systemOut.match(/screenshot[^:]*:\s*([^\s\n]+)/i);
        if (screenshotMatch) {
          const screenshotPath = screenshotMatch[1];
          // For GitHub Actions, use artifact URL
          if (process.env.GITHUB_ACTIONS && process.env.GITHUB_SERVER_URL) {
            const artifactUrl = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
            testcase.properties[0].property.push({
              $: { name: 'attachment', value: `${artifactUrl}/artifacts` }
            });
          } else {
            // Local path (will need to be hosted for Testmo)
            testcase.properties[0].property.push({
              $: { name: 'screenshot_path', value: screenshotPath }
            });
          }
        }
      });
    };

    // Process testcases in testsuites
    const processTestCases = (testsuite) => {
      if (testsuite.testcase) {
        enhanceTestCases(testsuite.testcase);
      }
    };

    if (result.testsuites && result.testsuites.testsuite) {
      const suites = Array.isArray(result.testsuites.testsuite) 
        ? result.testsuites.testsuite 
        : [result.testsuites.testsuite];
      suites.forEach(processTestCases);
    } else if (result.testsuite) {
      processTestCases(result.testsuite);
    }

    // Build enhanced XML
    const builder = new Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' },
      renderOpts: { pretty: true, indent: '  ' }
    });
    
    const enhancedXml = builder.buildObject(result);
    fs.writeFileSync(xmlPath, enhancedXml);
    
    console.log(`✅ Enhanced JUnit XML with properties and metadata`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to enhance JUnit XML: ${error.message}`);
    return false;
  }
}

/**
 * Enhance failure messages with structured data
 */
function enhanceFailureMessage(errorMessage, errorCategory, statusCode, loadTime, dnsInfo, sslInfo) {
  const structuredData = {
    error_category: errorCategory || 'UNKNOWN',
    status_code: statusCode || 0,
    load_time: loadTime || 0,
    dns_resolution: dnsInfo?.success ? 'success' : 'failed',
    ssl_check: sslInfo?.valid ? 'valid' : 'invalid',
    timestamp: new Date().toISOString()
  };

  const structuredMessage = `
Error Category: ${structuredData.error_category}
Status Code: ${structuredData.status_code}
Load Time: ${structuredData.load_time}ms
DNS Resolution: ${structuredData.dns_resolution}
SSL Check: ${structuredData.ssl_check}
Timestamp: ${structuredData.timestamp}

Original Error: ${errorMessage}
  `.trim();

  return structuredMessage;
}

/**
 * Add attachment property to testcase
 */
function addAttachmentProperty(testcase, attachmentUrl, attachmentType = 'screenshot') {
  if (!testcase.properties) {
    testcase.properties = [{}];
  }
  if (!testcase.properties[0].property) {
    testcase.properties[0].property = [];
  }

  testcase.properties[0].property.push({
    $: {
      name: 'attachment',
      value: attachmentUrl,
      type: attachmentType
    }
  });
}

module.exports = {
  enhanceJUnitXML,
  enhanceFailureMessage,
  addAttachmentProperty
};

