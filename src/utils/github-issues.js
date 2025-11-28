/**
 * GitHub Issues Integration
 * Creates and manages GitHub issues for website monitoring failures
 */

const https = require('https');
const { URL } = require('url');

class GitHubIssues {
  constructor(token, owner, repo) {
    this.token = token;
    this.owner = owner;
    this.repo = repo;
    this.baseURL = 'https://api.github.com';
  }

  /**
   * Make GitHub API request
   */
  async request(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseURL);
      
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Authorization': `token ${this.token}`,
          'User-Agent': 'Website-Monitor-Testmo',
          'Accept': 'application/vnd.github.v3+json',
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
              reject(new Error(`GitHub API Error ${res.statusCode}: ${parsed.message || body}`));
            }
          } catch (e) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(body);
            } else {
              reject(new Error(`GitHub API Error ${res.statusCode}: ${body}`));
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
   * Create a GitHub issue
   */
  async createIssue(title, body, labels = []) {
    try {
      const issue = await this.request('POST', `/repos/${this.owner}/${this.repo}/issues`, {
        title: title,
        body: body,
        labels: labels
      });
      
      console.log(`✅ Created GitHub issue #${issue.number}: ${title}`);
      return issue;
    } catch (error) {
      console.error(`❌ Failed to create GitHub issue: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create issue for website failure
   */
  async createWebsiteFailureIssue(statusReport, options = {}) {
    const {
      workflowRunId,
      workflowRunUrl,
      commitSha,
      branch,
      author
    } = options;

    const title = `🚨 Website Monitoring Alert: ${statusReport.name} is DOWN`;
    
    const body = `## Website Monitoring Alert

**Website**: ${statusReport.name}
**URL**: ${statusReport.url}
**Status**: ${statusReport.status}
**Status Code**: ${statusReport.statusCode}
**Error**: ${statusReport.errorMessage || 'Unknown error'}
**Error Category**: ${statusReport.errorCategory || 'UNKNOWN'}
**Severity**: ${statusReport.severity || 'warning'}
**Load Time**: ${statusReport.loadTime || 'N/A'}ms
**Timestamp**: ${statusReport.timestamp}

### Details
- **Final URL**: ${statusReport.finalUrl || statusReport.url}
- **Page Title**: ${statusReport.title || 'N/A'}
- **DNS Resolution**: ${statusReport.dns?.success ? '✅ Success' : '❌ Failed'}
  ${statusReport.dns?.addresses ? `  - IPs: ${statusReport.dns.addresses.join(', ')}` : ''}
- **SSL Certificate**: ${statusReport.ssl?.valid ? '✅ Valid' : '❌ Invalid'}
  ${statusReport.ssl?.daysUntilExpiry ? `  - Expires in: ${statusReport.ssl.daysUntilExpiry} days` : ''}
- **Check Duration**: ${statusReport.checkDuration || 'N/A'}ms
- **Performance Score**: ${statusReport.performanceScore || 'N/A'}

### Change Information
${statusReport.changeInfo?.changed ? `
- **Status Changed**: ${statusReport.changeInfo.isRecovery ? '🟢 Recovered' : '🔴 Downtime detected'}
- **Previous Status**: ${statusReport.changeInfo.previousStatus?.status || 'N/A'}
` : '- **Status**: No change detected'}

### Test Run Information
${workflowRunId ? `- **Workflow Run ID**: ${workflowRunId}` : ''}
${workflowRunUrl ? `- **Workflow Run**: [View Run](${workflowRunUrl})` : ''}
${commitSha ? `- **Commit**: ${commitSha.substring(0, 7)}` : ''}
${branch ? `- **Branch**: ${branch}` : ''}
${author ? `- **Author**: ${author}` : ''}

### Screenshots
Screenshots are available in the test artifacts or Testmo dashboard.

### Next Steps
1. ✅ Check website status manually
2. ✅ Review monitoring logs
3. ✅ Check for infrastructure issues
4. ✅ Verify DNS and SSL certificates
5. ✅ Check for recent deployments
6. ✅ Review error logs

### Related Links
- [Testmo Dashboard](${process.env.TESTMO_INSTANCE ? `https://${process.env.TESTMO_INSTANCE}/projects/${process.env.TESTMO_PROJECT_ID}/runs` : 'N/A'})
- [Website](${statusReport.url})

---
*This issue was automatically created by the Website Monitoring system.*
*Issue will be automatically closed when website recovers.*`;

    const labels = [
      'monitoring',
      'website-down',
      'automated',
      statusReport.errorCategory || 'unknown-error'
    ];

    if (statusReport.severity === 'critical') {
      labels.push('critical');
    }

    return this.createIssue(title, body, labels);
  }

  /**
   * Check if issue already exists for this failure
   */
  async findExistingIssue(websiteName, state = 'open') {
    try {
      const issues = await this.request('GET', `/repos/${this.owner}/${this.repo}/issues`, {
        state: state,
        labels: 'monitoring,website-down',
        per_page: 100
      });

      // Find issue matching website name
      const matchingIssue = issues.find(issue => 
        issue.title.includes(websiteName) && issue.state === state
      );

      return matchingIssue || null;
    } catch (error) {
      console.warn(`⚠️  Failed to check existing issues: ${error.message}`);
      return null;
    }
  }

  /**
   * Close issue when website recovers
   */
  async closeIssue(issueNumber, comment = null) {
    try {
      const data = { state: 'closed' };
      if (comment) {
        data.body = comment;
      }

      const issue = await this.request('PATCH', `/repos/${this.owner}/${this.repo}/issues/${issueNumber}`, data);
      
      console.log(`✅ Closed GitHub issue #${issueNumber}`);
      return issue;
    } catch (error) {
      console.error(`❌ Failed to close GitHub issue: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add comment to issue
   */
  async addComment(issueNumber, comment) {
    try {
      const response = await this.request('POST', `/repos/${this.owner}/${this.repo}/issues/${issueNumber}/comments`, {
        body: comment
      });
      
      console.log(`✅ Added comment to GitHub issue #${issueNumber}`);
      return response;
    } catch (error) {
      console.error(`❌ Failed to add comment to GitHub issue: ${error.message}`);
      throw error;
    }
  }
}

module.exports = GitHubIssues;

