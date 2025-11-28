# 📤 Testmo Upload Map

**Exactly which files to upload where in Testmo**

---

## 🎯 Quick Overview

| Location | File to Upload | Purpose |
|----------|---------------|---------|
| **Project Docs** | `TESTMO_PROJECT_DOCUMENTATION.md` | Main project documentation |
| **Automation Sources** | Automation-specific content | How tests run and submit |
| **GitHub Links** | Repository URLs | Link to full documentation |

---

## 📍 Location 1: Project Documentation

### URL
```
https://screencloud.testmo.net/projects/docs/12
```

### Navigation Path
```
Projects > Monitor Services and Website > Documentation
```

### What to Upload

**File**: `docs/TESTMO_PROJECT_DOCUMENTATION.md`

**Content Includes**:
- ✅ Project overview
- ✅ Quick start guide
- ✅ Testmo integration details
- ✅ Configuration guide
- ✅ Monitoring & reporting
- ✅ Troubleshooting
- ✅ Support links

### How to Upload

1. **Go to**: https://screencloud.testmo.net/projects/docs/12
2. **Click**: "Add Documentation" or "Edit" (if exists)
3. **Option A - Upload File**:
   - Click "Upload" or "Attach File"
   - Select: `docs/TESTMO_PROJECT_DOCUMENTATION.md`
   - Or copy/paste the content
4. **Option B - Add GitHub Links**:
   - Add section with links:
     ```markdown
     ## 📚 Full Documentation
     
     - [Main README](https://github.com/screencloud/website-monitor-testmo)
     - [Documentation Index](https://github.com/screencloud/website-monitor-testmo/blob/main/docs/DOCUMENTATION.md)
     - [Setup Guide](https://github.com/screencloud/website-monitor-testmo/blob/main/docs/setup/SETUP_AND_USAGE.md)
     ```

### Recommended Content Structure

```markdown
# Website Monitor - Quick Reference

[Paste content from TESTMO_PROJECT_DOCUMENTATION.md]

## 📚 Full Documentation

All detailed documentation is available in the GitHub repository:

- **Main README**: [View on GitHub](https://github.com/screencloud/website-monitor-testmo)
- **Documentation Index**: [View on GitHub](https://github.com/screencloud/website-monitor-testmo/blob/main/docs/DOCUMENTATION.md)
- **Setup Guide**: [View on GitHub](https://github.com/screencloud/website-monitor-testmo/blob/main/docs/setup/SETUP_AND_USAGE.md)
- **Testmo Setup**: [View on GitHub](https://github.com/screencloud/website-monitor-testmo/blob/main/docs/TESTMO_SETUP.md)
```

---

## 📍 Location 2: Automation Sources Documentation

### URL
```
https://screencloud.testmo.net/automation/sources/12
```

### Navigation Path
```
Automation > Sources
```

### What to Upload

**File**: Create new content (or use template below)

**Content Should Include**:
- ✅ How tests execute
- ✅ Submission process
- ✅ Configuration details
- ✅ Environment variables
- ✅ Troubleshooting automation issues

### Template Content

```markdown
# Automation Source Documentation

## Test Execution

Tests are executed via Playwright and results are submitted to Testmo.

### Execution Flow

1. **Run Tests**: `npm test`
   - Executes Playwright tests
   - Generates JUnit XML report
   - Captures screenshots

2. **Submit Results**: `npm run testmo:submit`
   - Submits JUnit XML to Testmo
   - Includes enhanced metadata
   - Links to Testmo dashboard

### Configuration

**Required Environment Variables**:
- `TESTMO_INSTANCE`: screencloud.testmo.net
- `TESTMO_PROJECT_ID`: 12
- `TESTMO_API_KEY`: (set in environment)

**Optional Environment Variables**:
- `SLACK_BOT_TOKEN`: For Slack notifications
- `GITHUB_TOKEN`: For GitHub Issues creation

### Submission Details

- **Format**: JUnit XML
- **Location**: `test-results/junit.xml`
- **Enhancement**: Automatic enhancement with metadata
- **Custom Fields**: Environment info, Git info, performance metrics

### Troubleshooting

**Common Issues**:

1. **Submission Fails**
   - Check environment variables
   - Verify API key permissions
   - Check Testmo CLI authentication

2. **Results Not Appearing**
   - Verify project ID is correct
   - Check Testmo instance URL
   - Review submission logs

### Related Documentation

- Full documentation: [GitHub Repository](https://github.com/screencloud/website-monitor-testmo)
- Setup guide: [View on GitHub](https://github.com/screencloud/website-monitor-testmo/blob/main/docs/setup/SETUP_AND_USAGE.md)
```

### How to Upload

1. **Go to**: https://screencloud.testmo.net/automation/sources/12
2. **Click**: "Add Documentation" or "Edit"
3. **Paste**: Content from template above
4. **Or**: Create your own automation-specific documentation

---

## 📍 Location 3: GitHub Repository Links

### Where to Add Links

Add GitHub links in **both** locations above:

1. **Project Documentation** (Location 1)
2. **Automation Sources** (Location 2)

### Recommended Links to Include

```markdown
## 📚 Full Documentation

- **Main Repository**: https://github.com/screencloud/website-monitor-testmo
- **Documentation Index**: https://github.com/screencloud/website-monitor-testmo/blob/main/docs/DOCUMENTATION.md
- **Main README**: https://github.com/screencloud/website-monitor-testmo/blob/main/README.md
- **Setup Guide**: https://github.com/screencloud/website-monitor-testmo/blob/main/docs/setup/SETUP_AND_USAGE.md
- **Testmo Setup**: https://github.com/screencloud/website-monitor-testmo/blob/main/docs/TESTMO_SETUP.md
- **Slack Setup**: https://github.com/screencloud/website-monitor-testmo/blob/main/docs/setup/SLACK_SETUP.md
```

---

## 📋 Upload Checklist

### Project Documentation
- [ ] Go to: https://screencloud.testmo.net/projects/docs/12
- [ ] Upload or paste: `docs/TESTMO_PROJECT_DOCUMENTATION.md`
- [ ] Add GitHub repository links
- [ ] Save changes

### Automation Sources
- [ ] Go to: https://screencloud.testmo.net/automation/sources/12
- [ ] Create or edit documentation
- [ ] Paste automation-specific content (see template above)
- [ ] Add GitHub links
- [ ] Save changes

### Verification
- [ ] Check Project Documentation is visible
- [ ] Check Automation Sources documentation is visible
- [ ] Verify GitHub links work
- [ ] Test navigation from Testmo to GitHub

---

## 🎯 Summary

| What | Where | File/Content |
|------|-------|--------------|
| **Main Docs** | Project > Documentation | `TESTMO_PROJECT_DOCUMENTATION.md` + GitHub links |
| **Automation Docs** | Automation > Sources | Automation template + GitHub links |
| **GitHub Links** | Both locations | Repository URLs |

---

## 🚀 Quick Start

1. **Upload Project Docs**:
   ```
   Go to: https://screencloud.testmo.net/projects/docs/12
   Upload: docs/TESTMO_PROJECT_DOCUMENTATION.md
   Add: GitHub repository links
   ```

2. **Add Automation Docs**:
   ```
   Go to: https://screencloud.testmo.net/automation/sources/12
   Paste: Automation template content
   Add: GitHub repository links
   ```

3. **Verify**:
   - Check both locations
   - Test GitHub links
   - Confirm documentation is visible

---

**Last Updated**: November 28, 2024

