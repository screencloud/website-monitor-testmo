/**
 * Performance Metrics Tracking
 * Stores and analyzes performance metrics over time
 */

const fs = require('fs');
const path = require('path');

const METRICS_DIR = path.join(__dirname, '../../test-results/metrics');

// Ensure metrics directory exists
if (!fs.existsSync(METRICS_DIR)) {
  fs.mkdirSync(METRICS_DIR, { recursive: true });
}

/**
 * Store performance metrics for a website
 */
function storeMetrics(websiteName, metrics) {
  try {
    const safeName = websiteName.replace(/[^a-zA-Z0-9]/g, '-');
    const metricsFile = path.join(METRICS_DIR, `${safeName}.json`);
    
    let allMetrics = [];
    if (fs.existsSync(metricsFile)) {
      try {
        allMetrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
      } catch (e) {
        console.warn(`⚠️  Failed to load existing metrics for ${websiteName}: ${e.message}`);
      }
    }
    
    // Add new metrics entry
    allMetrics.push({
      ...metrics,
      timestamp: metrics.timestamp || new Date().toISOString()
    });
    
    // Keep only last 1000 entries per website
    if (allMetrics.length > 1000) {
      allMetrics = allMetrics.slice(-1000);
    }
    
    fs.writeFileSync(metricsFile, JSON.stringify(allMetrics, null, 2));
    return true;
  } catch (error) {
    console.error(`❌ Failed to store metrics for ${websiteName}: ${error.message}`);
    return false;
  }
}

/**
 * Load metrics for a website
 */
function loadMetrics(websiteName, limit = 100) {
  try {
    const safeName = websiteName.replace(/[^a-zA-Z0-9]/g, '-');
    const metricsFile = path.join(METRICS_DIR, `${safeName}.json`);
    
    if (!fs.existsSync(metricsFile)) {
      return [];
    }
    
    const allMetrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
    return allMetrics.slice(-limit);
  } catch (error) {
    console.error(`❌ Failed to load metrics for ${websiteName}: ${error.message}`);
    return [];
  }
}

/**
 * Calculate performance trends
 */
function calculateTrends(websiteName, days = 7) {
  try {
    const metrics = loadMetrics(websiteName, days * 24); // Assume hourly checks
    
    if (metrics.length < 2) {
      return {
        loadTimeTrend: 'insufficient_data',
        avgLoadTime: null,
        minLoadTime: null,
        maxLoadTime: null,
        uptimePercentage: null,
        trendDirection: 'stable'
      };
    }
    
    // Calculate averages
    const recentMetrics = metrics.slice(-days * 24);
    const olderMetrics = metrics.slice(0, -days * 24);
    
    const recentAvg = recentMetrics.reduce((sum, m) => sum + (m.loadTime || 0), 0) / recentMetrics.length;
    const olderAvg = olderMetrics.length > 0 
      ? olderMetrics.reduce((sum, m) => sum + (m.loadTime || 0), 0) / olderMetrics.length
      : recentAvg;
    
    const loadTimes = metrics.map(m => m.loadTime || 0).filter(t => t > 0);
    const uptimeCount = metrics.filter(m => m.isUp).length;
    
    let trendDirection = 'stable';
    if (recentAvg > olderAvg * 1.1) {
      trendDirection = 'degrading';
    } else if (recentAvg < olderAvg * 0.9) {
      trendDirection = 'improving';
    }
    
    return {
      loadTimeTrend: trendDirection,
      avgLoadTime: Math.round(recentAvg),
      minLoadTime: Math.min(...loadTimes),
      maxLoadTime: Math.max(...loadTimes),
      uptimePercentage: (uptimeCount / metrics.length * 100).toFixed(2),
      trendDirection,
      dataPoints: metrics.length
    };
  } catch (error) {
    console.error(`❌ Failed to calculate trends for ${websiteName}: ${error.message}`);
    return {
      loadTimeTrend: 'error',
      avgLoadTime: null,
      minLoadTime: null,
      maxLoadTime: null,
      uptimePercentage: null,
      trendDirection: 'error'
    };
  }
}

/**
 * Get performance summary for all websites
 */
function getPerformanceSummary() {
  try {
    const files = fs.readdirSync(METRICS_DIR).filter(f => f.endsWith('.json'));
    const summary = {};
    
    files.forEach(file => {
      const websiteName = file.replace('.json', '').replace(/-/g, ' ');
      const trends = calculateTrends(websiteName);
      summary[websiteName] = trends;
    });
    
    return summary;
  } catch (error) {
    console.error(`❌ Failed to get performance summary: ${error.message}`);
    return {};
  }
}

module.exports = {
  storeMetrics,
  loadMetrics,
  calculateTrends,
  getPerformanceSummary
};

