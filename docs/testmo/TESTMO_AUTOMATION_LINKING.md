# Testmo Automation Linking

**Study notes from Testmo documentation: Automation Linking**

---

## 📋 Overview

**Automation Linking** allows you to connect manual test cases in your repository to automated tests. This creates a bridge between manual and automated testing workflows.

---

## 🎯 Key Concepts

### Purpose
- Link manual test cases to automated tests
- Track coverage when transitioning from manual to automation
- Reference related automated tests from manual cases
- Unified view of test results across manual and automated runs

### When to Use
- **Recommended**: Smaller projects (up to 250 tests)
- **Best for**: Frontend/UI tests managed by QA teams
- **Optional**: For many projects, standard automation workflow is sufficient

---

## 🔧 How It Works

### 1. Enable Automation Linking

**Steps**:
1. Navigate to `Admin > Automation` in Testmo
2. Enable automation linking for:
   - All projects, OR
   - Specific projects

### 2. Link Manual Test Cases to Automated Tests

**Process**:
1. Edit a test case in your repository
2. Select one or multiple automated tests to link
3. Search for automated tests by:
   - Name
   - ID
   - Key

### 3. View Linked Tests

**In Repository**:
- View all referenced automated tests
- Optionally display "Automation" column
- Identify cases with automation links

---

## 📊 Managing Test Runs

### Automated Test Results
- Stored in automated test runs
- Located under **Automation** section of projects
- Separate from manual test runs

### Manual Test Results
- Added as part of manual test runs
- Can exclude automated tests automatically

### Excluding Automated Tests from Manual Runs
- Testmo can automatically exclude test cases with automation links
- Ensures only manual test cases are included in manual runs
- Prevents duplication

---

## 📈 Tracking Coverage and Statuses

### Status Column
- Add optional **"Status (latest)"** column in repository
- View latest status of all test cases
- Works across multiple runs and milestones

### Unified View
Combine:
- Coverage tracking
- Status tracking
- Automation linking

**Result**: Comprehensive view of test results

---

## 💡 Benefits

1. **Traceability**: Link between manual and automated tests
2. **Coverage Tracking**: See which tests are automated
3. **Unified Reporting**: Combined view of manual and automated results
4. **Transition Support**: Helpful when moving from manual to automation
5. **QA Workflow**: Better for QA teams managing UI tests

---

## 🔄 Workflow Example

### Scenario: Transitioning Manual Tests to Automation

1. **Create Manual Test Cases**
   - Define test cases in Testmo repository
   - Document test steps and expected results

2. **Develop Automated Tests**
   - Write Playwright/automated tests
   - Submit results to Testmo automation runs

3. **Link Tests**
   - Edit manual test case
   - Link to corresponding automated test
   - Testmo tracks the relationship

4. **Track Coverage**
   - View which manual tests have automation
   - See latest status from automated runs
   - Monitor transition progress

5. **Run Tests**
   - Automated tests run via CI/CD
   - Results appear in automation runs
   - Manual tests can be excluded from manual runs

---

## 🎯 Implementation for Our Project

### Current State
- We have automated website monitoring tests
- Tests are submitted to Testmo automation runs
- No manual test cases yet

### Potential Use Cases

1. **Create Manual Test Cases**
   - Create manual test cases for each monitored website
   - Document expected behavior and monitoring criteria

2. **Link Automated Tests**
   - Link automated monitoring tests to manual test cases
   - Track which websites have automated monitoring

3. **Coverage Tracking**
   - See which websites are fully automated
   - Identify websites that need manual testing
   - Track automation coverage

4. **Unified Reporting**
   - Combined view of manual and automated results
   - Better visibility for stakeholders

---

## 📝 Implementation Steps

### Step 1: Enable Automation Linking
1. Go to Testmo Admin > Automation
2. Enable automation linking for project

### Step 2: Create Manual Test Cases
1. Create test cases in repository for each website
2. Document monitoring requirements
3. Add test steps and expected results

### Step 3: Link Tests
1. Edit each manual test case
2. Link to corresponding automated test
3. Use test name or ID to find automated test

### Step 4: Configure Test Runs
1. Set up automatic exclusion of automated tests from manual runs
2. Configure status columns
3. Set up reporting views

---

## 🔗 API Integration

### Testmo API for Automation Linking

**Potential API Endpoints**:
- Link test case to automated test
- Get linked tests for a test case
- Update automation links
- Remove automation links

**Note**: Check Testmo API documentation for specific endpoints

---

## 📚 References

- **Testmo Documentation**: https://support.testmo.com/hc/en-us/articles/37904613921549-Automation-Linking
- **Testmo API**: Check Testmo API docs for automation linking endpoints

---

## 🎯 Recommendations

### For Our Project

1. **Consider Automation Linking If**:
   - You want to track which websites have automated monitoring
   - You need to show coverage to stakeholders
   - You plan to have manual test cases alongside automation

2. **May Not Be Necessary If**:
   - All monitoring is fully automated
   - You don't need manual test cases
   - Standard automation workflow is sufficient

3. **Best Practice**:
   - Start with standard automation workflow
   - Add automation linking if you need manual test cases
   - Use it for coverage tracking and reporting

---

**Last Updated**: November 28, 2024
**Source**: Testmo Support Documentation

