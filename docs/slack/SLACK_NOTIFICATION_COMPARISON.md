# Slack Notification Structure Comparison

## GitHub Actions vs Testmo Implementation

### Current GitHub Actions Structure

```
📊 Website Monitoring Results

✅ Website Status: UP - Running Fine!
🕐 Check Time: 2025-11-25 13:23:58 (BKK)
🟢 Status: UP
🌐 URL: https://start.screencloud.com/
🔗 Final URL: https://auth.screencloud.com/login
📄 Page Title: Login to ScreenCloud
📊 Status Code: 200
⏱️ Load Time: 4844ms
📈 Response Time Trend: → Same as previous check
⏳ Check Duration: 5426ms
✅ Redirected to Auth: Yes (Expected)
✅ Website is active and running fine!

📸 Screenshots
📸 Latest Screenshot: View on GitHub
📄 Status Details: View status.json
📦 All Screenshots: Available in workflow artifacts
```

### Current Testmo Implementation

```
🌐 Website Monitor

✅ ScreenCloud Start is UP

Fields:
- URL: https://start.screencloud.com/
- Status Code: 200
- Load Time: 1500ms
- Timestamp: 2025-11-28 10:15:58 (BKK)
- Status Change: 🟢 Recovered (if changed)
- 📸 Screenshot: Saved at: `test-results/...`
```

---

## Feature Comparison

| Feature | GitHub Actions | Current Testmo | Recommendation |
|---------|---------------|---------------|----------------|
| **Header** | 📊 Website Monitoring Results | 🌐 Website Monitor | ✅ Keep simple, add icon |
| **Status Summary** | ✅ Website Status: UP - Running Fine! | ✅ Website Name is UP | ✅ Add descriptive message |
| **Check Time** | 🕐 Check Time: ... | ✅ Timestamp: ... | ✅ Keep (same info) |
| **Status Indicator** | 🟢 Status: UP | (In title) | ✅ Add as separate field |
| **URL** | 🌐 URL: ... | ✅ URL: ... | ✅ Keep |
| **Final URL** | 🔗 Final URL: ... (redirects) | ❌ Missing | ✅ **ADD** - Shows redirects |
| **Page Title** | 📄 Page Title: ... | ❌ Missing | ✅ **ADD** - Useful info |
| **Status Code** | 📊 Status Code: 200 | ✅ Status Code: 200 | ✅ Keep |
| **Load Time** | ⏱️ Load Time: 4844ms | ✅ Load Time: 1500ms | ✅ Keep |
| **Response Time Trend** | 📈 Response Time Trend: → Same/Faster/Slower | ❌ Missing | ✅ **ADD** - Compare with previous |
| **Check Duration** | ⏳ Check Duration: 5426ms | ❌ Missing | ✅ **ADD** - Total check time |
| **Redirect Confirmation** | ✅ Redirected to Auth: Yes (Expected) | ❌ Missing | ✅ **ADD** - If redirect expected |
| **Final Message** | ✅ Website is active and running fine! | ❌ Missing | ✅ **ADD** - User-friendly summary |
| **Screenshots Section** | 📸 Screenshots (with links) | 📸 Screenshot: path | ⚠️ **IMPROVE** - Better formatting |
| **Status Details Link** | 📄 Status Details: View status.json | ❌ Missing | ⚠️ **OPTIONAL** - If status.json available |
| **Error Information** | (Not shown in example) | ✅ Error + Category | ✅ Keep |
| **SSL Info** | (Not shown in example) | ✅ SSL Certificate (if invalid) | ✅ Keep |
| **Status Change** | (Not shown in example) | ✅ Status Change | ✅ Keep |

---

## Proposed Enhanced Structure for Testmo

### Option 1: Rich Format (Similar to GH Actions)

```
📊 Website Monitoring Results

✅ Website Status: UP - Running Fine!

🌐 URL: https://start.screencloud.com/
🔗 Final URL: https://auth.screencloud.com/login
📄 Page Title: Login to ScreenCloud
🟢 Status: UP
📊 Status Code: 200
⏱️ Load Time: 4844ms
📈 Response Time Trend: → Same as previous check
⏳ Check Duration: 5426ms
🕐 Check Time: 2025-11-28 10:15:58 (BKK)
✅ Redirected to Auth: Yes (Expected)

📸 Screenshots
📸 Latest Screenshot: test-results/screenshots/.../latest.png
📄 Status Details: test-results/status/.../status.json

✅ Website is active and running fine!
```

### Option 2: Compact Format (Current + Enhancements)

```
🌐 Website Monitor

✅ ScreenCloud Start is UP - Running Fine!

Fields:
- 🌐 URL: https://start.screencloud.com/
- 🔗 Final URL: https://auth.screencloud.com/login
- 📄 Page Title: Login to ScreenCloud
- 🟢 Status: UP
- 📊 Status Code: 200
- ⏱️ Load Time: 4844ms
- 📈 Response Time Trend: → Same as previous check
- ⏳ Check Duration: 5426ms
- 🕐 Check Time: 2025-11-28 10:15:58 (BKK)
- ✅ Redirected to Auth: Yes (Expected)
- 📸 Screenshot: test-results/screenshots/.../latest.png

✅ Website is active and running fine!
```

---

## What to Add

### High Priority ✅
1. **Final URL** - Show where redirects lead
2. **Page Title** - Useful for verification
3. **Response Time Trend** - Compare with previous check (Faster/Slower/Same)
4. **Check Duration** - Total time for the check
5. **Redirect Confirmation** - If redirect is expected
6. **Status Summary Message** - User-friendly final message

### Medium Priority ⚠️
7. **Status Indicator** - Separate field for visual clarity
8. **Better Screenshot Section** - Grouped with icon
9. **Status Details Link** - Link to status.json if available

### Low Priority 📝
10. **Header Enhancement** - Add icon to header
11. **Section Dividers** - Visual separation of sections

---

## What to Keep from Current Implementation

✅ **Error Information** - Better error handling than GH Actions
✅ **Error Category** - Categorization (NETWORK_ERROR, TIMEOUT, etc.)
✅ **SSL Certificate Info** - Security monitoring
✅ **Status Change Detection** - Recovery/Downtime tracking
✅ **Screenshot Path** - Already included

---

## What to Remove/Simplify

❌ **GitHub-specific links** - Not applicable for Testmo
❌ **Workflow artifacts** - Not relevant for local/Testmo runs
❌ **Redundant fields** - Avoid duplication

---

## Implementation Considerations

### Data Availability

Check what data is available in the test:

- ✅ **Final URL** - Available via `page.url()` after navigation
- ✅ **Page Title** - Available via `page.title()`
- ✅ **Check Duration** - Available from test timing
- ⚠️ **Response Time Trend** - Need to compare with previous status
- ✅ **Redirect Confirmation** - Can check if redirect matches expected

### Response Time Trend Logic

```javascript
// Compare current loadTime with previous
const previousLoadTime = previousStatus?.loadTime;
let trend = 'N/A';
if (previousLoadTime) {
  const diff = loadTime - previousLoadTime;
  const percentChange = (diff / previousLoadTime) * 100;
  
  if (Math.abs(percentChange) < 5) {
    trend = '→ Same as previous check';
  } else if (diff < 0) {
    trend = `↓ ${Math.abs(percentChange).toFixed(1)}% faster than previous`;
  } else {
    trend = `↑ ${percentChange.toFixed(1)}% slower than previous`;
  }
}
```

### Redirect Confirmation Logic

```javascript
// Check if redirect matches expected
const expectedRedirect = websiteConfig.expectedRedirect;
const redirectedToExpected = expectedRedirect 
  ? finalUrl.includes(expectedRedirect) 
  : null;

// Add field if redirect is expected
if (expectedRedirect) {
  fields.push({
    title: 'Redirected to Auth',
    value: redirectedToExpected ? 'Yes (Expected)' : 'No (Unexpected)',
    short: true
  });
}
```

---

## Recommended Structure (Final Proposal)

### For Website UP
```
📊 Website Monitoring Results

✅ Website Status: UP - Running Fine!

🌐 URL: https://start.screencloud.com/
🔗 Final URL: https://auth.screencloud.com/login
📄 Page Title: Login to ScreenCloud
🟢 Status: UP
📊 Status Code: 200
⏱️ Load Time: 4844ms
📈 Response Time Trend: → Same as previous check
⏳ Check Duration: 5426ms
🕐 Check Time: 2025-11-28 10:15:58 (BKK)
✅ Redirected to Auth: Yes (Expected)

📸 Screenshot: test-results/screenshots/ScreenCloud-Start/latest.png

✅ Website is active and running fine!
```

### For Website DOWN
```
📊 Website Monitoring Results

❌ Website Status: DOWN - Issues Detected!

🌐 URL: https://example.com/
🟢 Status: DOWN
📊 Status Code: 0
⏱️ Load Time: N/A
⏳ Check Duration: 30000ms
🕐 Check Time: 2025-11-28 10:20:00 (BKK)

❌ Error: net::ERR_CONNECTION_REFUSED
🔴 Error Category: NETWORK_ERROR
🔴 Status Change: Downtime detected

📸 Screenshot: test-results/screenshots/Example-Site/failure-1732782000000.png

❌ Website is experiencing issues!
```

---

## Next Steps

1. **Review this comparison** - Discuss what features to include
2. **Decide on format** - Option 1 (Rich) or Option 2 (Compact)
3. **Implement enhancements** - Add new fields to notification
4. **Test notifications** - Verify appearance in Slack
5. **Update documentation** - Update structure docs

---

## Questions for Discussion

1. **Format preference?** Rich (like GH Actions) or Compact (current style)?
2. **Response Time Trend?** Is comparing with previous check important?
3. **Redirect Confirmation?** Only show if redirect is expected in config?
4. **Status Details Link?** Do we want to link to status.json files?
5. **Section grouping?** Group related fields (e.g., "Screenshots" section)?

