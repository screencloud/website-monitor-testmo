/**
 * Configuration Validator
 * Validates website configuration files
 */

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

/**
 * Validate website configuration
 */
function validateWebsiteConfig(config, index) {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!config.name || typeof config.name !== 'string' || config.name.trim().length === 0) {
    errors.push(`Website ${index}: 'name' is required and must be a non-empty string`);
  }

  if (!config.url || typeof config.url !== 'string') {
    errors.push(`Website ${index}: 'url' is required and must be a string`);
  } else {
    // Validate URL format
    try {
      const urlObj = new URL(config.url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        errors.push(`Website ${index}: URL must use HTTP or HTTPS protocol`);
      }
    } catch (e) {
      errors.push(`Website ${index}: Invalid URL format: ${config.url}`);
    }
  }

  // Optional fields validation
  if (config.enabled !== undefined && typeof config.enabled !== 'boolean') {
    warnings.push(`Website ${index}: 'enabled' should be a boolean (defaults to true)`);
  }

  if (config.performanceThreshold !== undefined) {
    if (typeof config.performanceThreshold !== 'number' || config.performanceThreshold <= 0) {
      errors.push(`Website ${index}: 'performanceThreshold' must be a positive number`);
    }
  }

  if (config.webhookUrl !== undefined && config.webhookUrl !== null) {
    if (typeof config.webhookUrl !== 'string') {
      errors.push(`Website ${index}: 'webhookUrl' must be a string or null`);
    } else if (config.webhookUrl.trim().length > 0) {
      try {
        new URL(config.webhookUrl);
      } catch (e) {
        errors.push(`Website ${index}: Invalid webhookUrl format: ${config.webhookUrl}`);
      }
    }
  }

  if (config.expectedRedirect !== undefined && typeof config.expectedRedirect !== 'string') {
    warnings.push(`Website ${index}: 'expectedRedirect' should be a string`);
  }

  // Check for duplicate names
  // This will be checked at the array level

  return { errors, warnings };
}

/**
 * Validate websites configuration file
 */
function validateWebsitesConfig(configPath) {
  const errors = [];
  const warnings = [];
  const validatedConfigs = [];

  // Check if file exists
  if (!fs.existsSync(configPath)) {
    errors.push(`Configuration file not found: ${configPath}`);
    return { valid: false, errors, warnings, configs: [] };
  }

  // Read and parse JSON
  let configs;
  try {
    const content = fs.readFileSync(configPath, 'utf8');
    configs = JSON.parse(content);
  } catch (e) {
    errors.push(`Failed to parse configuration file: ${e.message}`);
    return { valid: false, errors, warnings, configs: [] };
  }

  // Validate it's an array
  if (!Array.isArray(configs)) {
    errors.push('Configuration must be an array of website objects');
    return { valid: false, errors, warnings, configs: [] };
  }

  if (configs.length === 0) {
    warnings.push('No websites configured');
  }

  // Check for duplicate names
  const names = new Set();
  configs.forEach((config, index) => {
    if (config.name && names.has(config.name)) {
      errors.push(`Duplicate website name found: "${config.name}"`);
    }
    if (config.name) {
      names.add(config.name);
    }
  });

  // Validate each website configuration
  configs.forEach((config, index) => {
    const result = validateWebsiteConfig(config, index);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    
    if (result.errors.length === 0) {
      validatedConfigs.push(config);
    }
  });

  const valid = errors.length === 0;
  
  return {
    valid,
    errors,
    warnings,
    configs: valid ? validatedConfigs : configs,
    enabledCount: validatedConfigs.filter(c => c.enabled !== false).length
  };
}

/**
 * Load and validate websites configuration
 */
function loadWebsitesConfig(configPath = null) {
  const defaultPath = path.join(__dirname, '../../config/websites.json');
  const configFile = configPath || defaultPath;
  
  const validation = validateWebsitesConfig(configFile);
  
  if (!validation.valid) {
    throw new Error(`Configuration validation failed:\n${validation.errors.join('\n')}`);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('Configuration warnings:');
    validation.warnings.forEach(warning => console.warn(`  ⚠️  ${warning}`));
  }
  
  return validation.configs;
}

module.exports = {
  validateWebsiteConfig,
  validateWebsitesConfig,
  loadWebsitesConfig
};

