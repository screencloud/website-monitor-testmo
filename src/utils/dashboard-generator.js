/**
 * Dashboard Generator
 * Generates HTML dashboard for monitoring results
 */

const fs = require('fs');
const path = require('path');
const { getBangkokTimestamp } = require('./monitoring-helpers');

/**
 * Generate HTML dashboard from monitoring results
 */
function generateDashboard(results, outputPath = 'dashboard.html') {
  const { timestamp, timestampISO } = getBangkokTimestamp();
  const totalSites = results.length;
  const upSites = results.filter(r => r.isUp).length;
  const downSites = totalSites - upSites;
  const uptimePercentage = totalSites > 0 ? ((upSites / totalSites) * 100).toFixed(2) : 0;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Website Monitoring Dashboard</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    .header {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    .header h1 {
      color: #333;
      margin-bottom: 10px;
      font-size: 2.5em;
    }
    .header .timestamp {
      color: #666;
      font-size: 0.9em;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }
    .stat-card:hover {
      transform: translateY(-5px);
    }
    .stat-card.up {
      border-left: 5px solid #10b981;
    }
    .stat-card.down {
      border-left: 5px solid #ef4444;
    }
    .stat-card.total {
      border-left: 5px solid #3b82f6;
    }
    .stat-card.uptime {
      border-left: 5px solid #8b5cf6;
    }
    .stat-value {
      font-size: 2.5em;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
    }
    .stat-label {
      color: #666;
      font-size: 0.9em;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .sites {
      display: grid;
      gap: 20px;
    }
    .site-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }
    .site-card:hover {
      transform: translateY(-3px);
    }
    .site-card.down {
      border-left: 5px solid #ef4444;
    }
    .site-card.up {
      border-left: 5px solid #10b981;
    }
    .site-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .site-name {
      font-size: 1.5em;
      font-weight: bold;
      color: #333;
    }
    .status-badge {
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 0.9em;
      text-transform: uppercase;
    }
    .status-badge.up {
      background: #d1fae5;
      color: #065f46;
    }
    .status-badge.down {
      background: #fee2e2;
      color: #991b1b;
    }
    .site-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
    }
    .detail-label {
      color: #666;
      font-size: 0.85em;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .detail-value {
      color: #333;
      font-size: 1.1em;
      font-weight: 600;
    }
    .detail-value.error {
      color: #ef4444;
    }
    .detail-value.success {
      color: #10b981;
    }
    .performance-bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 5px;
    }
    .performance-fill {
      height: 100%;
      transition: width 0.3s ease;
    }
    .performance-fill.excellent {
      background: #10b981;
    }
    .performance-fill.good {
      background: #3b82f6;
    }
    .performance-fill.acceptable {
      background: #f59e0b;
    }
    .performance-fill.poor {
      background: #ef4444;
    }
    .footer {
      text-align: center;
      color: white;
      margin-top: 30px;
      padding: 20px;
    }
    @media (max-width: 768px) {
      .stats {
        grid-template-columns: 1fr;
      }
      .site-details {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌐 Website Monitoring Dashboard</h1>
      <div class="timestamp">Last updated: ${timestamp}</div>
    </div>

    <div class="stats">
      <div class="stat-card total">
        <div class="stat-value">${totalSites}</div>
        <div class="stat-label">Total Sites</div>
      </div>
      <div class="stat-card up">
        <div class="stat-value">${upSites}</div>
        <div class="stat-label">Sites Up</div>
      </div>
      <div class="stat-card down">
        <div class="stat-value">${downSites}</div>
        <div class="stat-label">Sites Down</div>
      </div>
      <div class="stat-card uptime">
        <div class="stat-value">${uptimePercentage}%</div>
        <div class="stat-label">Uptime</div>
      </div>
    </div>

    <div class="sites">
      ${results.map(result => generateSiteCard(result)).join('')}
    </div>

    <div class="footer">
      <p>Generated by Website Monitor Testmo | ${timestampISO}</p>
    </div>
  </div>
</body>
</html>`;

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, html, 'utf8');
  return outputPath;
}

/**
 * Generate site card HTML
 */
function generateSiteCard(result) {
  const statusClass = result.isUp ? 'up' : 'down';
  const statusText = result.isUp ? 'UP' : 'DOWN';
  const loadTime = result.loadTime || 0;
  const threshold = result.performanceThreshold || 5000;
  const performancePercentage = Math.min((loadTime / threshold) * 100, 100);
  const performanceClass = result.performanceScore || 'poor';

  return `
    <div class="site-card ${statusClass}">
      <div class="site-header">
        <div class="site-name">${escapeHtml(result.name)}</div>
        <div class="status-badge ${statusClass}">${statusText}</div>
      </div>
      <div class="site-details">
        <div class="detail-item">
          <div class="detail-label">URL</div>
          <div class="detail-value"><a href="${escapeHtml(result.url)}" target="_blank">${escapeHtml(result.url)}</a></div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Status Code</div>
          <div class="detail-value ${result.statusCode >= 400 ? 'error' : 'success'}">${result.statusCode || 'N/A'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Load Time</div>
          <div class="detail-value">${loadTime}ms</div>
          <div class="performance-bar">
            <div class="performance-fill ${performanceClass}" style="width: ${performancePercentage}%"></div>
          </div>
        </div>
        ${result.errorMessage ? `
        <div class="detail-item">
          <div class="detail-label">Error</div>
          <div class="detail-value error">${escapeHtml(result.errorMessage)}</div>
        </div>
        ` : ''}
        ${result.errorCategory ? `
        <div class="detail-item">
          <div class="detail-label">Error Category</div>
          <div class="detail-value">${escapeHtml(result.errorCategory)}</div>
        </div>
        ` : ''}
        ${result.sslInfo ? `
        <div class="detail-item">
          <div class="detail-label">SSL Status</div>
          <div class="detail-value ${result.sslInfo.valid ? 'success' : 'error'}">
            ${result.sslInfo.valid ? `Valid (${result.sslInfo.daysUntilExpiry} days)` : 'Invalid'}
          </div>
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.toString().replace(/[&<>"']/g, m => map[m]);
}

module.exports = {
  generateDashboard
};

