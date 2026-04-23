/**
 * Testmo API Utility
 * Interacts with Testmo REST API for advanced features
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Try to use axios if available, fallback to native https
let axios = null;
try {
  axios = require('axios');
} catch (e) {
  // axios not available, use native https
}

class TestmoAPI {
  constructor(instance, projectIdOrApiKey, apiKey) {
    // Remove https:// if present
    const cleanInstance = instance.replace(/^https?:\/\//, '');
    this.baseURL = `https://${cleanInstance}/api/v1`;
    
    // Handle both old signature (instance, apiKey) and new (instance, projectId, apiKey)
    if (apiKey) {
      // New signature: (instance, projectId, apiKey)
      this.projectId = projectIdOrApiKey;
      this.apiKey = apiKey;
    } else {
      // Old signature: (instance, apiKey)
      this.projectId = null;
      this.apiKey = projectIdOrApiKey;
    }
    
    // Create axios client if available
    if (axios) {
      this.client = axios.create({
        baseURL: this.baseURL,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
    }
  }

  /**
   * Make API request
   */
  async request(method, endpoint, data = null) {
    // Use axios if available (simpler)
    if (axios) {
      try {
        const url = `${this.baseURL}${endpoint}`;
        const response = await axios({
          method: method,
          url: url,
          data: data,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        return response.data;
      } catch (error) {
        if (error.response) {
          throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
        }
        throw error;
      }
    }
    
    // Fallback to native https
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseURL);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = body ? JSON.parse(body) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(`API Error ${res.statusCode}: ${parsed.message || body}`));
            }
          } catch (e) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(body);
            } else {
              reject(new Error(`API Error ${res.statusCode}: ${body}`));
            }
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  /**
   * Update automation run with custom fields
   */
  async updateRun(runId, data) {
    try {
      return await this.request('PATCH', `/automation/runs/${runId}`, data);
    } catch (error) {
      console.error(`❌ Failed to update run ${runId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add custom fields to run
   */
  async addCustomFields(runId, fields) {
    return this.updateRun(runId, { customFields: fields });
  }

  /**
   * Add tags to run
   */
  async addTags(runId, tags) {
    return this.updateRun(runId, { tags: tags });
  }

  /**
   * Update run description
   */
  async updateDescription(runId, description) {
    return this.updateRun(runId, { description: description });
  }

  /**
   * Get run details
   */
  async getRun(runId) {
    try {
      return await this.request('GET', `/automation/runs/${runId}`);
    } catch (error) {
      console.error(`❌ Failed to get run ${runId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create test case in repository
   */
  async createTestCase(repositoryId, testCaseData) {
    try {
      if (this.client) {
        const response = await this.client.post(`/repositories/${repositoryId}/cases`, testCaseData);
        return response.data;
      }
      return await this.request('POST', `/repositories/${repositoryId}/cases`, testCaseData);
    } catch (error) {
      if (error.response) {
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      }
      throw error;
    }
  }

  /**
   * Link automated test to test case
   */
  async linkAutomationToCase(repositoryId, caseId, automationTestId) {
    try {
      // This endpoint may vary - check Testmo API docs
      const data = {
        automation_test_id: automationTestId,
        test_case_id: caseId
      };
      if (this.client) {
        const response = await this.client.post(`/repositories/${repositoryId}/cases/${caseId}/automation`, data);
        return response.data;
      }
      return await this.request('POST', `/repositories/${repositoryId}/cases/${caseId}/automation`, data);
    } catch (error) {
      if (error.response) {
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      }
      throw error;
    }
  }

  /**
   * Create a new session
   * @param {number} projectId - Project ID
   * @param {Object} sessionData - Session data
   * @param {string} sessionData.name - Session name (required)
   * @param {string|number} sessionData.template - Template ID or name (required)
   * @param {string|number} sessionData.state - State ID or name (required, e.g., "New")
   * @param {string} [sessionData.configuration] - Configuration/environment
   * @param {number} [sessionData.milestone] - Milestone ID
   * @param {string} [sessionData.mission] - Mission/description (rich text)
   * @param {number} [sessionData.assignedTo] - User ID to assign to
   * @param {number} [sessionData.estimate] - Estimate in hours
   * @param {Array<number>} [sessionData.issues] - Issue IDs
   * @param {Array<string>} [sessionData.tags] - Tags
   * @returns {Promise<Object>} Created session
   */
  async createSession(projectId, sessionData) {
    try {
      const endpoint = `/projects/${projectId}/sessions`;
      if (this.client) {
        const response = await this.client.post(endpoint, sessionData);
        return response.data;
      }
      return await this.request('POST', endpoint, sessionData);
    } catch (error) {
      if (error.response) {
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      }
      throw error;
    }
  }

  /**
   * Get session details
   * @param {number} projectId - Project ID
   * @param {number} sessionId - Session ID
   * @returns {Promise<Object>} Session details
   */
  async getSession(projectId, sessionId) {
    try {
      const endpoint = `/projects/${projectId}/sessions/${sessionId}`;
      if (this.client) {
        const response = await this.client.get(endpoint);
        return response.data;
      }
      return await this.request('GET', endpoint);
    } catch (error) {
      if (error.response) {
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      }
      throw error;
    }
  }

  /**
   * Update session
   * @param {number} projectId - Project ID
   * @param {number} sessionId - Session ID
   * @param {Object} sessionData - Updated session data
   * @returns {Promise<Object>} Updated session
   */
  async updateSession(projectId, sessionId, sessionData) {
    try {
      const endpoint = `/projects/${projectId}/sessions/${sessionId}`;
      if (this.client) {
        const response = await this.client.patch(endpoint, sessionData);
        return response.data;
      }
      return await this.request('PATCH', endpoint, sessionData);
    } catch (error) {
      if (error.response) {
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      }
      throw error;
    }
  }

  /**
   * List sessions in a project
   * @param {number} projectId - Project ID
   * @param {Object} [filters] - Filter options
   * @param {string} [filters.state] - Filter by state (e.g., "active", "closed")
   * @param {string} [filters.assignedTo] - Filter by assigned user ID
   * @param {Array<string>} [filters.tags] - Filter by tags
   * @returns {Promise<Array>} List of sessions
   */
  async listSessions(projectId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.state) queryParams.append('state', filters.state);
      if (filters.assignedTo) queryParams.append('assigned_to', filters.assignedTo);
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => queryParams.append('tags[]', tag));
      }
      
      const queryString = queryParams.toString();
      const endpoint = `/projects/${projectId}/sessions${queryString ? `?${queryString}` : ''}`;
      
      if (this.client) {
        const response = await this.client.get(endpoint);
        return response.data;
      }
      return await this.request('GET', endpoint);
    } catch (error) {
      if (error.response) {
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      }
      throw error;
    }
  }

  /**
   * Close a session
   * @param {number} projectId - Project ID
   * @param {number} sessionId - Session ID
   * @returns {Promise<Object>} Updated session
   */
  async closeSession(projectId, sessionId) {
    return this.updateSession(projectId, sessionId, { state: 'closed' });
  }

  /**
   * Link session to automation run
   * @param {number} projectId - Project ID
   * @param {number} sessionId - Session ID
   * @param {number} runId - Automation run ID
   * @returns {Promise<Object>} Link result
   */
  async linkSessionToRun(projectId, sessionId, runId) {
    try {
      const endpoint = `/projects/${projectId}/sessions/${sessionId}/runs`;
      const data = { run_id: runId };
      if (this.client) {
        const response = await this.client.post(endpoint, data);
        return response.data;
      }
      return await this.request('POST', endpoint, data);
    } catch (error) {
      if (error.response) {
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      }
      throw error;
    }
  }
}

module.exports = TestmoAPI;

