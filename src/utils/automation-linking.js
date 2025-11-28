/**
 * Automation Linking Utility
 * Helps link automated tests to manual test cases in Testmo
 */

const TestmoAPI = require('./testmo-api');

class AutomationLinking {
  constructor(testmoInstance, repositoryId, apiKey) {
    this.testmoApi = new TestmoAPI(testmoInstance, repositoryId, apiKey);
    this.repositoryId = repositoryId;
  }

  /**
   * Link automated test to manual test case
   * Note: This requires Testmo API support for automation linking
   * 
   * @param {string} repositoryId - Testmo repository ID
   * @param {string} automatedTestId - Automated test ID from Testmo
   * @param {string} manualTestCaseId - Manual test case ID from repository
   * @returns {Promise<Object>} Link result
   */
  async linkTestToCase(repositoryId, automatedTestId, manualTestCaseId) {
    try {
      console.log(`🔗 Linking automated test ${automatedTestId} to manual test case ${manualTestCaseId}`);
      
      // Use TestmoAPI method if available
      if (this.testmoApi.linkAutomationToCase) {
        return await this.testmoApi.linkAutomationToCase(repositoryId, manualTestCaseId, automatedTestId);
      }
      
      // Fallback: Try direct API call
      try {
        return await this.testmoApi.request('POST', `/repositories/${repositoryId}/cases/${manualTestCaseId}/automation`, {
          automation_id: automatedTestId
        });
      } catch (apiError) {
        // If API doesn't support this endpoint, log and return success
        // (linking can be done manually in Testmo UI)
        console.warn(`⚠️  API linking not available: ${apiError.message}`);
        console.log(`ℹ️  You can link manually in Testmo UI: Edit test case ${manualTestCaseId} and link to automation test ${automatedTestId}`);
        return { success: true, message: 'Manual linking required in Testmo UI' };
      }
    } catch (error) {
      console.error(`❌ Failed to link test to case: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get linked tests for a test case
   * 
   * @param {string} repositoryId - Testmo repository ID
   * @param {string} testCaseId - Test case ID
   * @returns {Promise<Array>} Array of linked automation tests
   */
  async getLinkedTests(repositoryId, testCaseId) {
    try {
      // Try to get linked automation tests via API
      try {
        const response = await this.testmoApi.request('GET', `/repositories/${repositoryId}/cases/${testCaseId}/automation`);
        return response.automation || response || [];
      } catch (apiError) {
        // If API doesn't support this endpoint, return empty array
        // (can be checked manually in Testmo UI)
        console.warn(`⚠️  API endpoint not available: ${apiError.message}`);
        console.log(`ℹ️  Check linked automation tests in Testmo UI for test case ${testCaseId}`);
        return [];
      }
    } catch (error) {
      console.error(`❌ Failed to get linked tests: ${error.message}`);
      // Return empty array on error (non-critical)
      return [];
    }
  }

  /**
   * Create mapping configuration
   */
  createMapping(websiteName, automatedTestName, manualTestCaseId) {
    return {
      website: websiteName,
      automatedTest: automatedTestName,
      manualTestCase: manualTestCaseId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Load test case mappings from file
   */
  loadMappings(mappingFile) {
    const fs = require('fs');
    const path = require('path');
    
    try {
      if (fs.existsSync(mappingFile)) {
        return JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
      }
      return {};
    } catch (error) {
      console.warn(`⚠️  Failed to load mappings: ${error.message}`);
      return {};
    }
  }

  /**
   * Save test case mappings to file
   */
  saveMappings(mappingFile, mappings) {
    const fs = require('fs');
    const path = require('path');
    
    try {
      fs.writeFileSync(mappingFile, JSON.stringify(mappings, null, 2));
      return true;
    } catch (error) {
      console.error(`❌ Failed to save mappings: ${error.message}`);
      return false;
    }
  }
}

module.exports = AutomationLinking;

