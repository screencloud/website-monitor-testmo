/**
 * Testmo Session Manager
 * Utility for managing Testmo Sessions (manual testing sessions)
 */

const TestmoAPI = require('./testmo-api');

class SessionManager {
  constructor(testmoInstance, projectId, apiKey) {
    this.testmoApi = new TestmoAPI(testmoInstance, projectId, apiKey);
    this.projectId = projectId;
  }

  /**
   * Create a new exploratory session
   * @param {Object} options - Session options
   * @param {string} options.name - Session name
   * @param {string} [options.mission] - Mission/description
   * @param {string} [options.configuration] - Configuration/environment
   * @param {number} [options.milestone] - Milestone ID
   * @param {number} [options.assignedTo] - User ID to assign to
   * @param {Array<string>} [options.tags] - Tags
   * @param {number} [options.estimate] - Estimate in hours
   * @returns {Promise<Object>} Created session
   */
  async createExploratorySession(options) {
    try {
      const sessionData = {
        name: options.name || `Exploratory Session - ${new Date().toISOString()}`,
        template: 'Exploratory session', // Default template
        state: 'New',
        ...(options.mission && { mission: options.mission }),
        ...(options.configuration && { configuration: options.configuration }),
        ...(options.milestone && { milestone: options.milestone }),
        ...(options.assignedTo && { assigned_to: options.assignedTo }),
        ...(options.tags && { tags: options.tags }),
        ...(options.estimate && { estimate: options.estimate })
      };

      console.log(`📝 Creating exploratory session: ${sessionData.name}`);
      const session = await this.testmoApi.createSession(this.projectId, sessionData);
      console.log(`✅ Session created: ${session.id}`);
      console.log(`🔗 View at: https://${this.testmoApi.baseURL.replace('/api/v1', '')}/sessions/${session.id}`);
      return session;
    } catch (error) {
      console.error(`❌ Failed to create session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a session for manual verification of automated test results
   * @param {Object} options - Session options
   * @param {number} options.runId - Automation run ID to verify
   * @param {string} [options.name] - Session name (auto-generated if not provided)
   * @param {number} [options.assignedTo] - User ID to assign to
   * @returns {Promise<Object>} Created session
   */
  async createVerificationSession(options) {
    try {
      const runId = options.runId;
      if (!runId) {
        throw new Error('runId is required for verification session');
      }

      // Get run details to include in session
      let runDetails = null;
      try {
        runDetails = await this.testmoApi.getRun(runId);
      } catch (e) {
        console.warn(`⚠️  Could not fetch run details: ${e.message}`);
      }

      const sessionName = options.name || 
        `Manual Verification - Run #${runId} - ${new Date().toISOString().split('T')[0]}`;

      const mission = runDetails 
        ? `Manual verification of automated test run #${runId}.\n\nRun Details:\n- Status: ${runDetails.status || 'Unknown'}\n- Tests: ${runDetails.tests || 'N/A'}\n- Passed: ${runDetails.passed || 'N/A'}\n- Failed: ${runDetails.failed || 'N/A'}`
        : `Manual verification of automated test run #${runId}`;

      const sessionData = {
        name: sessionName,
        template: 'Exploratory session',
        state: 'New',
        mission: mission,
        tags: ['verification', 'manual-testing', `run-${runId}`],
        ...(options.assignedTo && { assigned_to: options.assignedTo })
      };

      console.log(`📝 Creating verification session for run #${runId}`);
      const session = await this.testmoApi.createSession(this.projectId, sessionData);
      
      // Link session to run if possible
      try {
        await this.testmoApi.linkSessionToRun(this.projectId, session.id, runId);
        console.log(`🔗 Linked session to run #${runId}`);
      } catch (e) {
        console.warn(`⚠️  Could not link session to run: ${e.message}`);
      }

      console.log(`✅ Verification session created: ${session.id}`);
      console.log(`🔗 View at: https://${this.testmoApi.baseURL.replace('/api/v1', '')}/sessions/${session.id}`);
      return session;
    } catch (error) {
      console.error(`❌ Failed to create verification session: ${error.message}`);
      throw error;
    }
  }

  /**
   * List active sessions
   * @param {Object} [filters] - Additional filters
   * @returns {Promise<Array>} List of active sessions
   */
  async listActiveSessions(filters = {}) {
    try {
      return await this.testmoApi.listSessions(this.projectId, {
        state: 'active',
        ...filters
      });
    } catch (error) {
      console.error(`❌ Failed to list active sessions: ${error.message}`);
      throw error;
    }
  }

  /**
   * List closed sessions
   * @param {Object} [filters] - Additional filters
   * @returns {Promise<Array>} List of closed sessions
   */
  async listClosedSessions(filters = {}) {
    try {
      return await this.testmoApi.listSessions(this.projectId, {
        state: 'closed',
        ...filters
      });
    } catch (error) {
      console.error(`❌ Failed to list closed sessions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get session details
   * @param {number} sessionId - Session ID
   * @returns {Promise<Object>} Session details
   */
  async getSession(sessionId) {
    try {
      return await this.testmoApi.getSession(this.projectId, sessionId);
    } catch (error) {
      console.error(`❌ Failed to get session ${sessionId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Close a session
   * @param {number} sessionId - Session ID
   * @returns {Promise<Object>} Updated session
   */
  async closeSession(sessionId) {
    try {
      console.log(`🔒 Closing session ${sessionId}`);
      const session = await this.testmoApi.closeSession(this.projectId, sessionId);
      console.log(`✅ Session closed: ${sessionId}`);
      return session;
    } catch (error) {
      console.error(`❌ Failed to close session ${sessionId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update session
   * @param {number} sessionId - Session ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated session
   */
  async updateSession(sessionId, updates) {
    try {
      console.log(`📝 Updating session ${sessionId}`);
      const session = await this.testmoApi.updateSession(this.projectId, sessionId, updates);
      console.log(`✅ Session updated: ${sessionId}`);
      return session;
    } catch (error) {
      console.error(`❌ Failed to update session ${sessionId}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = SessionManager;

