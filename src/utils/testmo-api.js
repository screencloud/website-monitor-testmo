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
  constructor(instance, apiKey) {
    // Remove https:// if present
    const cleanInstance = instance.replace(/^https?:\/\//, '');
    this.baseURL = `https://${cleanInstance}/api/v1`;
    this.apiKey = apiKey;
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
}

module.exports = TestmoAPI;

