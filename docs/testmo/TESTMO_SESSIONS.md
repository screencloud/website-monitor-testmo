# Testmo Sessions Guide

**Guide to using Testmo Sessions for manual testing and verification**

---

## 📋 What are Sessions?

Sessions in Testmo are used for **manual testing** and **exploratory testing**. They allow you to:

- Create structured manual testing sessions
- Assign sessions to team members
- Track manual verification of automated test results
- Document exploratory testing findings
- Link sessions to automation runs
- Track session progress and completion

---

## 🎯 Use Cases

### 1. **Manual Verification of Automated Tests**
After automated tests run, create a session to manually verify:
- Screenshots captured during failures
- Edge cases that need human validation
- Visual regression issues
- Performance anomalies

### 2. **Exploratory Testing**
Create sessions for:
- Ad-hoc testing of new features
- User acceptance testing (UAT)
- Regression testing
- Cross-browser testing

### 3. **Test Case Execution**
Use sessions to:
- Execute manual test cases
- Document test results
- Track test coverage
- Report defects

---

## 🚀 Quick Start

### Prerequisites

1. **Testmo Project**: You need a Testmo project ID
2. **API Key**: Testmo API key with session management permissions
3. **Environment Variables**: Set in `.env` file:

```bash
TESTMO_INSTANCE=your-instance.testmo.net
TESTMO_PROJECT_ID=your-project-id
TESTMO_API_KEY=your-api-key
```

---

## 📝 Creating Sessions

### Method 1: Using the Script (Recommended)

#### Create Exploratory Session

```bash
node scripts/manage-sessions.js create-exploratory \
  --name "Manual Verification - Production" \
  --mission "Verify all critical user flows after deployment" \
  --config "Production" \
  --tags "verification,production,critical" \
  --assigned-to 123
```

#### Create Verification Session for Automated Run

```bash
# After running automated tests
npm run testmo:submit

# Create verification session for the run
node scripts/manage-sessions.js create-verification \
  --run-id 456 \
  --name "Verify Run #456 Results" \
  --assigned-to 123
```

### Method 2: Using the API Directly

```javascript
const SessionManager = require('./src/utils/session-manager');

const sessionManager = new SessionManager(
  'your-instance.testmo.net',
  'your-project-id',
  'your-api-key'
);

// Create exploratory session
const session = await sessionManager.createExploratorySession({
  name: 'My Test Session',
  mission: 'Test the new feature',
  tags: ['testing', 'new-feature'],
  assignedTo: 123
});

// Create verification session
const verificationSession = await sessionManager.createVerificationSession({
  runId: 456,
  assignedTo: 123
});
```

---

## 🔍 Managing Sessions

### List Active Sessions

```bash
node scripts/manage-sessions.js list-active
```

### List Closed Sessions

```bash
node scripts/manage-sessions.js list-closed
```

### Get Session Details

```bash
node scripts/manage-sessions.js get --id 789
```

### Close a Session

```bash
node scripts/manage-sessions.js close --id 789
```

---

## 🔗 Linking Sessions to Automation Runs

Sessions can be linked to automation runs for traceability:

```javascript
const TestmoAPI = require('./src/utils/testmo-api');

const api = new TestmoAPI('instance.testmo.net', 'project-id', 'api-key');

// Link session to run
await api.linkSessionToRun(projectId, sessionId, runId);
```

When you create a verification session using `createVerificationSession()`, it automatically links to the run.

---

## 📊 Session Fields

### Required Fields
- **Name**: Session name
- **Template**: Session template (e.g., "Exploratory session")
- **State**: Session state (e.g., "New", "In Progress", "Closed")

### Optional Fields
- **Configuration**: Environment/configuration name
- **Milestone**: Milestone ID
- **Mission**: Rich text description of the session's purpose
- **Assigned To**: User ID of the assignee
- **Estimate**: Estimated hours for the session
- **Issues**: Linked issue IDs
- **Tags**: Array of tags for filtering
- **Attachments**: Files or screenshots

---

## 🎨 Session Templates

Testmo provides different session templates:

1. **Exploratory Session**: For ad-hoc testing and exploration
2. **Test Case Execution**: For executing predefined test cases
3. **Bug Verification**: For verifying reported bugs
4. **Custom Templates**: Create your own templates in Testmo

---

## 🔄 Integration with Automated Tests

### Auto-Create Verification Sessions on Test Failures

You can extend the test runner to automatically create verification sessions when tests fail:

```javascript
// In your test file or test runner
const SessionManager = require('./src/utils/session-manager');

// After test run
if (testResults.failed > 0) {
  const sessionManager = new SessionManager(
    process.env.TESTMO_INSTANCE,
    process.env.TESTMO_PROJECT_ID,
    process.env.TESTMO_API_KEY
  );
  
  await sessionManager.createVerificationSession({
    runId: testResults.runId,
    name: `Manual Verification - ${testResults.failed} failures`
  });
}
```

---

## 📱 Using Sessions in Testmo UI

### Accessing Sessions

1. Navigate to your Testmo project
2. Go to **Management** → **Sessions**
3. View active and closed sessions
4. Click on a session to view details

### Creating Sessions in UI

1. Click **"Add session"** button
2. Fill in the required fields:
   - **Name***: Session name
   - **Template***: Choose a template
   - **State***: Initial state
3. Optionally fill in:
   - Configuration
   - Milestone
   - Mission (rich text)
   - Assigned to
   - Estimate
   - Tags
   - Attachments
4. Click **"Add session"**

### Working with Sessions

- **Start Session**: Change state to "In Progress"
- **Add Notes**: Use the mission field or add comments
- **Attach Files**: Upload screenshots or documents
- **Link Issues**: Connect to bug reports
- **Close Session**: Mark as completed

---

## 🎯 Best Practices

### 1. **Naming Conventions**
Use descriptive names:
- `Manual Verification - Run #123 - 2024-01-15`
- `Exploratory Testing - Feature X - Production`
- `UAT Session - Release 2.0`

### 2. **Tags for Organization**
Use consistent tags:
- `verification` - For manual verification sessions
- `exploratory` - For exploratory testing
- `uat` - For user acceptance testing
- `regression` - For regression testing
- Environment tags: `production`, `staging`, `dev`

### 3. **Mission/Description**
Always include a clear mission:
- What needs to be tested?
- Why is this session needed?
- What are the acceptance criteria?

### 4. **Linking to Runs**
Link verification sessions to automation runs for:
- Traceability
- Context
- Historical tracking

### 5. **Regular Cleanup**
Close completed sessions regularly to keep the active list manageable.

---

## 🔧 API Reference

### SessionManager Class

```javascript
const SessionManager = require('./src/utils/session-manager');

const manager = new SessionManager(instance, projectId, apiKey);
```

#### Methods

- `createExploratorySession(options)` - Create exploratory session
- `createVerificationSession(options)` - Create verification session for run
- `listActiveSessions(filters)` - List active sessions
- `listClosedSessions(filters)` - List closed sessions
- `getSession(sessionId)` - Get session details
- `closeSession(sessionId)` - Close a session
- `updateSession(sessionId, updates)` - Update session

### TestmoAPI Class

```javascript
const TestmoAPI = require('./src/utils/testmo-api');

const api = new TestmoAPI(instance, projectId, apiKey);
```

#### Session Methods

- `createSession(projectId, sessionData)` - Create session
- `getSession(projectId, sessionId)` - Get session
- `updateSession(projectId, sessionId, sessionData)` - Update session
- `listSessions(projectId, filters)` - List sessions
- `closeSession(projectId, sessionId)` - Close session
- `linkSessionToRun(projectId, sessionId, runId)` - Link to run

---

## 📚 Related Documentation

- [Testmo Setup Guide](./TESTMO_SETUP.md)
- [Testmo Quick Reference](./TESTMO_QUICK_REFERENCE.md)
- [Testmo URLs Guide](./TESTMO_URLS_GUIDE.md)

---

## ❓ FAQ

### Q: Can I create sessions programmatically?
**A:** Yes! Use the `SessionManager` class or the `manage-sessions.js` script.

### Q: How do I link a session to an automation run?
**A:** Use `linkSessionToRun()` method or create a verification session which auto-links.

### Q: Can I assign sessions to team members?
**A:** Yes, use the `assignedTo` parameter with the user ID.

### Q: What's the difference between Sessions and Runs?
**A:** 
- **Runs**: Automated test execution results
- **Sessions**: Manual testing activities

### Q: Can I use sessions for test case execution?
**A:** Yes, use the "Test Case Execution" template when creating sessions.

---

## 🆘 Support

For issues or questions:
1. Check [Testmo Documentation](https://docs.testmo.com)
2. Review [Testmo API Documentation](https://docs.testmo.com/api)
3. Contact your Testmo administrator

---

**Last Updated**: 2024-01-15

