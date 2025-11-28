/**
 * Git Information Utility
 * Extracts Git metadata for test runs
 */

const { execSync } = require('child_process');

/**
 * Get Git commit hash
 */
function getGitCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch (e) {
    return process.env.GIT_COMMIT || 'N/A';
  }
}

/**
 * Get Git branch name
 */
function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (e) {
    return process.env.GIT_BRANCH || process.env.CI_COMMIT_REF_NAME || 'N/A';
  }
}

/**
 * Get Git author
 */
function getGitAuthor() {
  try {
    return execSync('git log -1 --pretty=format:"%an"', { encoding: 'utf8' }).trim();
  } catch (e) {
    return process.env.GIT_AUTHOR || 'N/A';
  }
}

/**
 * Get Git commit message
 */
function getGitCommitMessage() {
  try {
    return execSync('git log -1 --pretty=format:"%s"', { encoding: 'utf8' }).trim();
  } catch (e) {
    return process.env.GIT_COMMIT_MESSAGE || 'N/A';
  }
}

/**
 * Get Git repository URL
 */
function getGitRepositoryUrl() {
  try {
    return execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
  } catch (e) {
    return process.env.GIT_REPOSITORY_URL || 'N/A';
  }
}

/**
 * Get all Git information
 */
function getAllGitInfo() {
  return {
    commit: getGitCommit(),
    branch: getGitBranch(),
    author: getGitAuthor(),
    commitMessage: getGitCommitMessage(),
    repositoryUrl: getGitRepositoryUrl(),
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  getGitCommit,
  getGitBranch,
  getGitAuthor,
  getGitCommitMessage,
  getGitRepositoryUrl,
  getAllGitInfo
};

