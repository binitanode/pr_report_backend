# VerifyURL Troubleshooting Guide

## Overview
This guide helps you troubleshoot the verifyURL functionality in your PR Distribution API.

## What I Fixed

### 1. **Added Proper Validation**
- Created `validateVerifyUrl` function in `prDistributionValidators.js`
- Added validation for `grid_id` (required) and `email` (optional)
- Applied validation to the route

### 2. **Improved Service Logic**
- Enhanced error handling in `verifyUrl` function
- Added better edge case handling for `sharedEmails` array
- Improved case-insensitive email comparison
- Added more descriptive error messages

### 3. **Enhanced Controller**
- Added comprehensive logging for debugging
- Improved response format consistency
- Better error handling and logging

### 4. **Fixed Edge Cases**
- Handle missing or malformed `sharedEmails` array
- Better handling of private vs public reports
- Improved email normalization and comparison

## How to Test

### 1. **Start Your Server**
```bash
npm start
# or
node server.js
```

### 2. **Use the Test Script**
```bash
# Install axios if not already installed
npm install axios

# Run the test script
node test-verify-url.js
```

### 3. **Test with Postman**
Use the Postman collection endpoint:
```
GET {{base_url}}/api/pr-distributions/verifyPRReportUrl?grid_id={{grid_id}}&email={{email}}
```

## Expected Behavior

### **Public Reports** (is_private: false)
- ✅ **Without email**: Should work
- ✅ **With email**: Should work
- Response: `{ "verify": true, "message": "Public report - Access granted", ... }`

### **Private Reports** (is_private: true)
- ❌ **Without email**: Should fail with "Email required for private report"
- ✅ **With authorized email**: Should work
- ❌ **With unauthorized email**: Should fail with "Access denied - Email not authorized"

## Common Issues & Solutions

### 1. **"Link expired or report not found"**
**Cause**: Invalid `grid_id` or report has been soft-deleted
**Solution**: 
- Verify the `grid_id` exists in your database
- Check if the report was deleted
- Ensure the `grid_id` format matches exactly

### 2. **"Email required for private report"**
**Cause**: Report is private but no email provided
**Solution**: 
- Add `?email=user@example.com` to the URL
- Or make the report public by setting `is_private: false`

### 3. **"Access denied - Email not authorized"**
**Cause**: Email not in the `sharedEmails` array
**Solution**:
- Add the email to the report's shared emails list
- Use the share endpoint: `PUT /api/pr-distributions/sharePRReport/:grid_id`
- Ensure email format matches exactly (case-insensitive)

### 4. **"Report access not configured properly"**
**Cause**: `sharedEmails` array is missing or malformed
**Solution**:
- Check the database structure
- Ensure `sharedEmails` is an array
- Re-share the report with proper email list

## Database Check

### Verify Report Exists
```javascript
// In MongoDB shell or Compass
db.prdistributiongroups.findOne({ grid_id: "YOUR_GRID_ID" })
```

### Check Report Privacy Settings
```javascript
db.prdistributiongroups.findOne(
  { grid_id: "YOUR_GRID_ID" }, 
  { is_private: 1, sharedEmails: 1, report_title: 1 }
)
```

### Check Distribution Data
```javascript
db.prdistributions.find({ grid_id: "YOUR_GRID_ID" }).count()
```

## API Endpoints

### **Verify URL Access**
```
GET /api/pr-distributions/verifyPRReportUrl?grid_id={grid_id}&email={email}
```

### **Share Report** (to set privacy and emails)
```
PUT /api/pr-distributions/sharePRReport/{grid_id}
Body: { "is_private": true, "sharedEmails": ["user1@example.com", "user2@example.com"] }
```

### **Get Report Data** (after verification)
```
POST /api/pr-distributions/getPRReportData
Body: { "grid_id": "your-grid-id", "email": "user@example.com" }
```

## Debugging Steps

### 1. **Check Server Logs**
Look for the detailed logging I added:
```
=== verifyPRReportUrl called ===
Query parameters: { grid_id: '...', email: '...' }
grid_id: ...
email: ...
```

### 2. **Verify Route Configuration**
Ensure the route is properly registered:
```javascript
router.get("/verifyPRReportUrl", validateVerifyUrl, PrDistributionController.verifyPRReportUrl);
```

### 3. **Test with Valid Data**
- Use a known valid `grid_id` from your database
- Test with both public and private reports
- Verify email addresses are in the correct format

### 4. **Check Database State**
- Ensure reports exist and aren't soft-deleted
- Verify `is_private` field is set correctly
- Check `sharedEmails` array structure

## Still Having Issues?

If you're still experiencing problems:

1. **Check the server logs** for detailed error information
2. **Verify your database** has the expected data structure
3. **Test with the provided test script** to isolate the issue
4. **Use Postman** to test the API endpoints directly
5. **Check if the server is running** on the correct port (7777)

## Quick Fix Commands

```bash
# Restart server
npm start

# Check if port 7777 is in use
netstat -an | findstr :7777

# Test the endpoint
curl "http://localhost:7777/api/pr-distributions/verifyPRReportUrl?grid_id=test&email=test@example.com"
```

The verifyURL functionality should now work properly with better error handling, validation, and debugging information!

