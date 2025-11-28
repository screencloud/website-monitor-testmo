# Linking Project to Testmo Repository

This guide explains how to link your website monitoring project to a Testmo repository.

**Repository URL**: https://screencloud.testmo.net/repositories/12

---

## 📋 Understanding Testmo Structure

### Projects vs Repositories

- **Project (ID 12)**: Where automation runs are stored
  - Your automated test results go here
  - Located at: `https://screencloud.testmo.net/projects/12/runs`
  
- **Repository (ID 12)**: Where test cases are stored
  - Manual test cases live here
  - Located at: `https://screencloud.testmo.net/repositories/12`
  - Can be linked to automated tests

---

## 🎯 What We Can Do

### Option 1: Create Test Cases in Repository (Recommended)

Create manual test cases for each monitored website, then link them to automated tests.

**Benefits:**
- Track which websites have automated monitoring
- Show coverage to stakeholders
- Unified view of manual and automated results
- Better traceability

### Option 2: Link Existing Automated Tests

If you already have test cases in the repository, link them to your automated tests.

---

## 🚀 Quick Start

### Step 1: Configure Repository ID

Add to your `.env` file:

```bash
TESTMO_REPOSITORY_ID=12
```

Or use the project ID (if same):

```bash
TESTMO_REPOSITORY_ID=$TESTMO_PROJECT_ID
```

### Step 2: Create Test Cases

Run the script to create test cases for all monitored websites:

```bash
npm run testmo:create-cases
```

This will:
- ✅ Create one test case per website in the repository
- ✅ Include monitoring details and test steps
- ✅ Save mapping file for automation linking
- ✅ Show summary of created test cases

### Step 3: Enable Automation Linking

1. Go to Testmo: **Admin > Automation**
2. Enable automation linking for your project
3. Select "All projects" or specific project

### Step 4: Link Automated Tests

**Option A: Manual Linking (Recommended)**
1. Go to repository: https://screencloud.testmo.net/repositories/12
2. Edit each test case
3. Click "Link to automated test"
4. Search for your automated test by name or ID
5. Save

**Option B: API Linking (If supported)**
- Check Testmo API documentation for automation linking endpoints
- Use the mapping file: `config/testmo-test-cases.json`

---

## 📊 What Gets Created

For each monitored website, a test case is created with:

- **Name**: `Monitor: [Website Name]`
- **Description**: Full monitoring details
- **Test Steps**: Step-by-step monitoring checks
- **Expected Results**: What should happen
- **Tags**: `monitoring`, `website`, `uptime`, `automated`
- **Priority**: Based on website configuration

---

## 📁 Files Created

### `config/testmo-test-cases.json`

Mapping file that links websites to test cases:

```json
[
  {
    "website": "ScreenCloud Start",
    "websiteUrl": "https://start.screencloud.com/",
    "testCaseId": 12345,
    "testCaseKey": "TC-123",
    "testCaseName": "Monitor: ScreenCloud Start"
  }
]
```

---

## 🔗 Viewing Test Cases

After creation, view them at:

**Repository**: https://screencloud.testmo.net/repositories/12

You'll see:
- All test cases for monitored websites
- Test case details and steps
- Automation links (after linking)
- Latest test status from automated runs

---

## 🎯 Automation Linking Workflow

### Current Flow

1. **Automated Tests Run** (via Playwright)
   - Tests execute every 15 minutes
   - Results submitted to Testmo automation runs

2. **Test Cases in Repository**
   - Manual test cases exist
   - Can be linked to automated tests

3. **Linking** (Manual or API)
   - Connect automated tests to test cases
   - Testmo tracks the relationship

4. **Unified View**
   - See both manual and automated results
   - Track coverage and status

---

## 📝 Manual Test Case Creation

If you prefer to create test cases manually:

1. Go to: https://screencloud.testmo.net/repositories/12
2. Click "New Test Case"
3. Fill in:
   - **Name**: `Monitor: [Website Name]`
   - **Description**: Monitoring details
   - **Steps**: Monitoring checks
   - **Tags**: `monitoring`, `website`, `uptime`
4. Save
5. Link to automated test

---

## 🔧 Troubleshooting

### "Repository not found" Error

- Check `TESTMO_REPOSITORY_ID` is correct
- Verify repository exists at the URL
- Check API key has repository access

### "Authentication failed" Error

- Verify `TESTMO_API_KEY` is valid
- Check API key hasn't expired
- Ensure API key has write permissions

### "API endpoint not found" Error

- Testmo API endpoints may vary by version
- Check Testmo API documentation
- Some endpoints may require different paths

### Test Cases Not Appearing

- Check repository ID is correct
- Verify you have view permissions
- Refresh the repository page

---

## 📚 References

- **Testmo Automation Linking**: https://support.testmo.com/hc/en-us/articles/37904613921549-Automation-Linking
- **Testmo API Documentation**: Check Testmo support for API endpoints
- **Repository URL**: https://screencloud.testmo.net/repositories/12

---

## ✅ Success Checklist

- [ ] `TESTMO_REPOSITORY_ID` added to `.env`
- [ ] Test cases created via script
- [ ] Automation linking enabled in Testmo
- [ ] Test cases linked to automated tests
- [ ] Test cases visible in repository
- [ ] Latest status showing from automated runs

---

**Last Updated**: November 28, 2024

