# 📤 Uploading Documentation to Testmo

**Guide for linking GitHub documentation or uploading to Testmo**

---

## 🎯 Overview

Testmo provides two areas for documentation:

1. **Project Documentation** (`/projects/docs/12`): Project-level documentation
2. **Automation Sources** (`/automation/sources/12`): Automation-specific documentation

---

## 📋 Option 1: Link GitHub Documentation (Recommended)

### Benefits

- ✅ Always up-to-date (linked from GitHub)
- ✅ Single source of truth
- ✅ Easy to maintain
- ✅ Version controlled

### Steps

1. **Go to Testmo Project Documentation**
   - Navigate to: https://screencloud.testmo.net/projects/docs/12
   - Or: Project > Documentation

2. **Add GitHub Link**
   - Click "Add Documentation" or "Edit"
   - Add a link to GitHub repository:
     ```
     Main Documentation: https://github.com/screencloud/website-monitor-testmo
     Documentation Index: https://github.com/screencloud/website-monitor-testmo/blob/main/docs/DOCUMENTATION.md
     ```

3. **Add Key Links**
   - README: https://github.com/screencloud/website-monitor-testmo/blob/main/README.md
   - Setup Guide: https://github.com/screencloud/website-monitor-testmo/blob/main/docs/setup/SETUP_AND_USAGE.md
   - Testmo Setup: https://github.com/screencloud/website-monitor-testmo/blob/main/docs/TESTMO_SETUP.md

---

## 📤 Option 2: Upload Documentation Directly

### Steps

1. **Prepare Documentation**
   - Use `docs/TESTMO_PROJECT_DOCUMENTATION.md` (already created)
   - Or copy content from GitHub

2. **Go to Testmo Project Documentation**
   - Navigate to: https://screencloud.testmo.net/projects/docs/12
   - Or: Project > Documentation

3. **Upload or Paste Content**
   - Click "Add Documentation" or "Edit"
   - Paste markdown content or upload file
   - Testmo supports markdown formatting

4. **Format Content**
   - Use markdown syntax
   - Add headings, lists, code blocks
   - Include links to GitHub repository

---

## 🔗 Option 3: Hybrid Approach (Best)

### Combine Both Methods

1. **Upload Summary to Testmo**
   - Upload `TESTMO_PROJECT_DOCUMENTATION.md` to Testmo
   - Provides quick reference in Testmo

2. **Link to GitHub for Details**
   - Add links in Testmo documentation pointing to GitHub
   - Full documentation stays in GitHub
   - Testmo provides quick access

### Example Structure in Testmo

```markdown
# Website Monitor - Quick Reference

## Overview
Automated website monitoring with Testmo integration.

## Quick Links
- 📖 [Full Documentation on GitHub](https://github.com/screencloud/website-monitor-testmo)
- 📚 [Documentation Index](https://github.com/screencloud/website-monitor-testmo/blob/main/docs/DOCUMENTATION.md)
- 🚀 [Setup Guide](https://github.com/screencloud/website-monitor-testmo/blob/main/docs/setup/SETUP_AND_USAGE.md)

## Quick Start
1. Install: `npm install`
2. Configure: Edit `.env` file
3. Run: `npm test && npm run testmo:submit`

## Key Features
- Automated monitoring
- Testmo integration
- Slack notifications
- Performance tracking
```

---

## 📊 Automation Sources Documentation

### Location

- URL: https://screencloud.testmo.net/automation/sources/12
- Path: Automation > Sources

### What to Add

Documentation specific to automation:

- **Test Execution Details**: How tests run
- **Submission Process**: How results are submitted
- **Configuration**: Environment variables, settings
- **Troubleshooting**: Common automation issues

### Example Content

```markdown
# Automation Source Documentation

## Test Execution
Tests run via Playwright and submit results to Testmo.

## Submission Process
1. Tests execute: `npm test`
2. Results generated: JUnit XML
3. Results submitted: `npm run testmo:submit`
4. Results appear in Testmo runs

## Configuration
- TESTMO_INSTANCE: screencloud.testmo.net
- TESTMO_PROJECT_ID: 12
- TESTMO_API_KEY: (set in environment)

## Troubleshooting
See GitHub documentation for detailed troubleshooting.
```

---

## ✅ Recommended Setup

### Step 1: Upload Summary to Project Docs

1. Go to: https://screencloud.testmo.net/projects/docs/12
2. Upload or paste `docs/TESTMO_PROJECT_DOCUMENTATION.md`
3. Add links to GitHub repository

### Step 2: Add Links to GitHub

In the Testmo documentation, include:

```markdown
## 📚 Full Documentation

All detailed documentation is available in the GitHub repository:

- **Main README**: [View on GitHub](https://github.com/screencloud/website-monitor-testmo)
- **Documentation Index**: [View on GitHub](https://github.com/screencloud/website-monitor-testmo/blob/main/docs/DOCUMENTATION.md)
- **Setup Guide**: [View on GitHub](https://github.com/screencloud/website-monitor-testmo/blob/main/docs/setup/SETUP_AND_USAGE.md)
- **Testmo Setup**: [View on GitHub](https://github.com/screencloud/website-monitor-testmo/blob/main/docs/TESTMO_SETUP.md)
```

### Step 3: Add Automation Source Docs

1. Go to: https://screencloud.testmo.net/automation/sources/12
2. Add automation-specific documentation
3. Link to GitHub for details

---

## 🎯 Quick Actions

### Upload Now

1. **Copy Content**: Open `docs/TESTMO_PROJECT_DOCUMENTATION.md`
2. **Go to Testmo**: https://screencloud.testmo.net/projects/docs/12
3. **Paste Content**: Add documentation section
4. **Add GitHub Links**: Include links to repository

### Link GitHub

1. **Go to Testmo**: https://screencloud.testmo.net/projects/docs/12
2. **Add Section**: "Documentation Links"
3. **Add Links**: 
   - Main repo
   - Documentation index
   - Key guides

---

## 📝 Notes

- Testmo supports markdown formatting
- Links to GitHub will always show latest version
- Uploaded content needs manual updates
- Hybrid approach provides best of both worlds

---

**Last Updated**: November 28, 2024

