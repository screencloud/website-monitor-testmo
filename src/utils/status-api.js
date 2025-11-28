#!/usr/bin/env node
/**
 * Status API Server
 * Simple HTTP server to serve monitoring status and dashboard
 * 
 * Usage: node src/utils/status-api.js
 * Or: npm run server
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const RESULTS_DIR = path.join(__dirname, '../../test-results');
const DASHBOARD_PATH = path.join(RESULTS_DIR, 'dashboard.html');
const API_KEY = process.env.API_KEY; // Optional API key for authentication

// Simple rate limiting (in-memory, resets on server restart)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // per IP per window

/**
 * Load all status reports
 */
function loadAllStatuses() {
  const results = [];
  const screenshotsDir = path.join(RESULTS_DIR, 'screenshots');
  
  if (!fs.existsSync(screenshotsDir)) {
    return results;
  }

  fs.readdirSync(screenshotsDir).forEach(siteDir => {
    const statusPath = path.join(screenshotsDir, siteDir, 'status.json');
    if (fs.existsSync(statusPath)) {
      try {
        const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
        results.push(status);
      } catch (e) {
        // Security: Don't expose full error messages
        console.warn(`Could not load status for ${siteDir}: Invalid JSON`);
      }
    }
  });

  return results;
}

/**
 * Check rate limit for IP address
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const key = ip;
  
  if (!rateLimit.has(key)) {
    rateLimit.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  const limit = rateLimit.get(key);
  
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + RATE_LIMIT_WINDOW;
    return true;
  }
  
  if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  limit.count++;
  return true;
}

/**
 * Get client IP address
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.socket.remoteAddress ||
         'unknown';
}

/**
 * Check API authentication
 */
function checkAuth(req) {
  if (!API_KEY) {
    return true; // No auth required if API_KEY not set
  }
  
  const providedKey = req.headers['x-api-key'] || 
                      new URL(req.url, `http://${req.headers.host}`).searchParams.get('api_key');
  
  return providedKey === API_KEY;
}

/**
 * Start status API server
 */
function startServer() {
  const server = http.createServer((req, res) => {
    // Rate limiting
    const clientIP = getClientIP(req);
    if (!checkRateLimit(clientIP)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Too many requests' }));
      return;
    }
    
    let url;
    try {
      url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request');
      return;
    }
    
    // Authentication check for API endpoints (not for dashboard)
    if (url.pathname.startsWith('/api/') && !checkAuth(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    
    // CORS headers - restrict to allowed origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : ['http://localhost:3000', 'http://127.0.0.1:3000'];
    
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (process.env.ALLOWED_ORIGINS === '*') {
      // Only allow wildcard if explicitly set (not recommended for production)
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Serve dashboard
    if (url.pathname === '/' || url.pathname === '/dashboard') {
      if (fs.existsSync(DASHBOARD_PATH)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(DASHBOARD_PATH).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Dashboard not found. Run tests first.');
      }
      return;
    }

    // API: Get all statuses
    if (url.pathname === '/api/status') {
      const statuses = loadAllStatuses();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(statuses, null, 2));
      return;
    }

    // API: Get summary
    if (url.pathname === '/api/summary') {
      const statuses = loadAllStatuses();
      const total = statuses.length;
      const up = statuses.filter(s => s.isUp).length;
      const down = total - up;
      const uptime = total > 0 ? ((up / total) * 100).toFixed(2) : 0;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        total,
        up,
        down,
        uptime: parseFloat(uptime),
        timestamp: new Date().toISOString()
      }, null, 2));
      return;
    }

    // Health check endpoint (no auth required)
    if (url.pathname === '/health' || url.pathname === '/api/health') {
      const statuses = loadAllStatuses();
      const uptime = process.uptime();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        uptime: Math.floor(uptime),
        timestamp: new Date().toISOString(),
        version: require('../../package.json').version,
        monitoredSites: statuses.length
      }, null, 2));
      return;
    }

    // API: Get specific website status
    if (url.pathname.startsWith('/api/status/')) {
      let websiteName = decodeURIComponent(url.pathname.replace('/api/status/', ''));
      
      // Security: Validate and sanitize websiteName to prevent path traversal
      // Remove any path traversal attempts
      websiteName = websiteName.replace(/\.\./g, '').replace(/[\/\\]/g, '');
      // Limit length to prevent DoS
      if (websiteName.length > 200) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Website name too long' }));
        return;
      }
      
      const statuses = loadAllStatuses();
      const status = statuses.find(s => s.name === websiteName);
      
      if (status) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(status, null, 2));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Website not found' }));
      }
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });

  server.listen(PORT, () => {
    console.log(`🚀 Status API server running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`📡 API: http://localhost:${PORT}/api/status`);
    console.log(`📈 Summary: http://localhost:${PORT}/api/summary`);
    console.log(`❤️  Health: http://localhost:${PORT}/health`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('\nSIGINT received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  return server;
}

module.exports = {
  startServer,
  loadAllStatuses
};

// Start server if run directly
if (require.main === module) {
  startServer();
}

