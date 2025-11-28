# 🔗 Testmo URLs Guide

**Correct URLs for accessing Testmo features**

---

## ❌ URL You Asked About

### `https://screencloud.testmo.net/runs/12`

**Status**: ❌ **Incorrect Format** or **Requires Login**

**What it is**:
- This appears to be trying to access a specific test run
- The format `/runs/12` is not the standard Testmo URL pattern
- Shows login page, which means either:
  - URL format is incorrect
  - Requires authentication
  - Run ID 12 doesn't exist or isn't accessible

**Can we use it?**: ❌ **No** - Use the correct URLs below instead

---

## ✅ Correct URLs to Use

### 1. Automation Runs List (All Runs)

**URL**: 
```
https://screencloud.testmo.net/projects/12/automation/runs
```
OR
```
https://screencloud.testmo.net/automation/runs
```

**Navigation**:
- Projects > Monitor Services > Automation > Runs & results
- OR: Automation > Runs & results

**What you see**:
- List of all test runs
- Run history
- Run status (passed/failed)
- Run dates and times

---

### 2. Specific Run Details

**URL Format**:
```
https://screencloud.testmo.net/automation/runs/view/RUN_ID
```

**Example** (if run ID is 31140):
```
https://screencloud.testmo.net/automation/runs/view/31140
```

**How to get run ID**:
- After running `npm run testmo:submit`, the output shows the run URL
- Or go to the runs list and click on a run
- The run ID is in the URL after `/view/`

**What you see**:
- Detailed test results
- Individual test status
- Screenshots (if any)
- Error messages
- Performance metrics
- Custom fields and metadata

---

### 3. Project Overview

**URL**:
```
https://screencloud.testmo.net/projects/12
```

**Navigation**:
- Projects > Monitor Services and Website

**What you see**:
- Project overview
- Current milestones
- Testing activity
- Recent runs summary

---

### 4. Project Documentation

**URL**:
```
https://screencloud.testmo.net/projects/docs/12
```

**Navigation**:
- Projects > Monitor Services > Documentation

**What you see**:
- Project documentation
- Setup guides
- Configuration info

---

### 5. Automation Sources

**URL**:
```
https://screencloud.testmo.net/automation/sources/12
```

**Navigation**:
- Automation > Sources

**What you see**:
- Automation source documentation
- Test execution details
- Configuration info

---

### 6. Repository (Test Cases)

**URL**:
```
https://screencloud.testmo.net/repositories/12
```

**Navigation**:
- Repository > Test Cases

**What you see**:
- Manual test cases
- Test case details
- Automation linking

---

## 🎯 How to Access Runs

### Method 1: Via Project (Recommended)

1. Go to: **Projects > Monitor Services and Website**
2. Click: **Automation** in sidebar
3. Click: **Runs & results**
4. URL: `https://screencloud.testmo.net/projects/12/automation/runs`

### Method 2: Via Automation Menu

1. Go to: **Automation** in top navigation
2. Click: **Runs & results**
3. URL: `https://screencloud.testmo.net/automation/runs`

### Method 3: Direct Link (After Submission)

After running `npm run testmo:submit`, you'll see output like:
```
✅ Test results submitted to Testmo successfully!
   View results at: https://screencloud.testmo.net/projects/12/automation/runs
```

Click on any run in the list to see details.

---

## 📊 URL Structure Reference

| Purpose | URL Pattern | Example |
|---------|-------------|---------|
| **Runs List** | `/projects/{id}/automation/runs` | `/projects/12/automation/runs` |
| **Specific Run** | `/automation/runs/view/{runId}` | `/automation/runs/view/31140` |
| **Project** | `/projects/{id}` | `/projects/12` |
| **Project Docs** | `/projects/docs/{id}` | `/projects/docs/12` |
| **Automation Sources** | `/automation/sources/{id}` | `/automation/sources/12` |
| **Repository** | `/repositories/{id}` | `/repositories/12` |

---

## ❓ Why `/runs/12` Doesn't Work

The URL `/runs/12` is not a valid Testmo URL pattern because:

1. **Missing Context**: Testmo needs to know if it's:
   - Automation runs (`/automation/runs/...`)
   - Manual runs (`/runs/...` - different context)
   - Project-specific runs (`/projects/{id}/automation/runs`)

2. **Incorrect Format**: For a specific run, the format is:
   - ✅ `/automation/runs/view/12` (correct)
   - ❌ `/runs/12` (incorrect)

3. **Authentication**: Even if the format was correct, you'd need to be logged in

---

## ✅ Summary

**Don't use**: `https://screencloud.testmo.net/runs/12`

**Use instead**:
- **Runs List**: `https://screencloud.testmo.net/projects/12/automation/runs`
- **Specific Run**: `https://screencloud.testmo.net/automation/runs/view/RUN_ID`
- **Project**: `https://screencloud.testmo.net/projects/12`

---

**Last Updated**: November 28, 2024

