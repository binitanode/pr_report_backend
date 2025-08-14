# PR Distribution API - Postman Collection Setup Guide

## Overview
This repository contains a complete Postman collection for the PR Distribution project APIs. The collection includes all endpoints for Authentication, User Management, Role Management, and PR Distribution operations.

## Files Included
1. **`PR_Distribution_API_Collection.postman_collection.json`** - Main Postman collection
2. **`PR_Distribution_Environment.postman_environment.json`** - Environment variables
3. **`POSTMAN_SETUP_README.md`** - This setup guide

## Quick Setup

### 1. Import Collection
1. Open Postman
2. Click "Import" button
3. Select the `PR_Distribution_API_Collection.postman_collection.json` file
4. The collection will be imported with all API endpoints organized in folders

### 2. Import Environment
1. In Postman, click "Import" again
2. Select the `PR_Distribution_Environment.postman_environment.json` file
3. Select the imported environment from the environment dropdown (top-right corner)

### 3. Configure Base URL
The environment is pre-configured with `http://localhost:7777` as the base URL. If your server runs on a different port, update the `base_url` variable in the environment.

## Environment Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `base_url` | Server base URL | `http://localhost:7777` |
| `auth_token` | JWT authentication token | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `user_id` | MongoDB user ID | `507f1f77bcf86cd799439011` |
| `role_id` | MongoDB role ID | `507f1f77bcf86cd799439012` |
| `grid_id` | PR report grid ID | `GRID_001` |
| `batch_id` | PR report batch ID | `BATCH_001` |
| `firebase_id` | Firebase user ID | `firebase_user_123` |
| `access_token` | PR report access token | `access_token_123` |
| `email` | Email for report access | `test@example.com` |

## API Endpoints Overview

### 🔐 Authentication
- **POST** `/api/auth/register` - User registration
- **POST** `/api/auth/login` - User login (requires auth)
- **POST** `/api/auth/forgotpassword` - Request password reset
- **POST** `/api/auth/resetpassword` - Reset password

### 👥 User Management
- **POST** `/api/auth/createuser` - Create new user (requires auth)
- **GET** `/api/auth/getuser/:id` - Get user by ID (requires auth)
- **GET** `/api/auth/getallusers` - Get all users with pagination (requires auth)
- **PUT** `/api/auth/updateuser/:id` - Update user (requires auth)
- **DELETE** `/api/auth/deleteuser/:id` - Delete user (requires auth)
- **GET** `/api/auth/users/me` - Get current user (requires auth)
- **GET** `/api/auth/getuserdatabyfirebaseid/:firebase_id` - Get user by Firebase ID (requires auth)

### 🎭 Role Management
- **GET** `/api/roles/getRoles` - Get all roles with pagination (requires auth)
- **POST** `/api/roles/createRole` - Create new role (requires auth)
- **GET** `/api/roles/getRole/:id` - Get role by ID (requires auth)
- **PUT** `/api/roles/updateRole/:id` - Update role (requires auth)
- **DELETE** `/api/roles/deleteRole/:id` - Delete role (requires auth)
- **GET** `/api/roles/permission/count` - Get permission count (requires auth)

### 📊 PR Distribution
- **POST** `/api/pr-distributions/uploadPR` - Upload PR report CSV (requires auth)
- **GET** `/api/pr-distributions/getPRReportByBatchId/:batch_id` - Get report by batch ID (requires auth)
- **GET** `/api/pr-distributions/getPRReportGroupByGridId/:grid_id` - Get report group by grid ID (requires auth)
- **DELETE** `/api/pr-distributions/deletePRReport/:grid_id` - Delete PR report (requires auth)
- **PUT** `/api/pr-distributions/sharePRReport/:grid_id` - Share PR report (requires auth)
- **GET** `/api/pr-distributions/verifyPRReportUrl` - Verify report access (no auth required, email required for private reports)
- **POST** `/api/pr-distributions/getPRReportData` - Get report data with filters (no auth required)
- **GET** `/api/pr-distributions/exportPRReportCsv/:grid_id` - Export report as CSV (no auth required)

## Getting Started

### 1. Start Your Server
Make sure your PR Distribution server is running on `localhost:7777`

### 2. Get Authentication Token
1. Use the **User Registration** endpoint to create an account
2. Use the **User Login** endpoint to authenticate
3. Copy the JWT token from the response
4. Set the `auth_token` environment variable with the token

### 3. Test Protected Endpoints
Once you have the auth token, you can test all protected endpoints. The token will be automatically included in the Authorization header.

## Sample Request Bodies

### User Registration
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "role": "user",
  "user_type": "regular",
  "user_name": "johndoe",
  "user_id": "USR001",
  "profile_image": "https://example.com/profile.jpg",
  "avatar": "https://example.com/avatar.jpg"
}
```

### Role Creation
```json
{
  "_id": "ROLE001",
  "name": "Content Manager",
  "permission": {
    "read": true,
    "write": true,
    "delete": false,
    "admin": false
  },
  "user_id": "USR001",
  "user_name": "johndoe"
}
```

### PR Report Data Query
```json
{
  "page": 1,
  "limit": 10,
  "search": "",
  "batch_id": "BATCH001",
  "recipient": "john@example.com",
  "exchange_symbol": "AAPL",
  "uploaded_by": "{{user_id}}"
}
```

## File Upload

For the **Upload PR Report** endpoint:
1. Use form-data body type
2. Key: `csv_file`
3. Type: File
4. Select a CSV file from your system
5. File size limit: 50MB

## Error Handling

The API returns consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 401,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Example Error Responses:**

**401 Unauthorized (Email Required):**
```json
{
  "success": false,
  "message": "Email required for private report",
  "statusCode": 401,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Link expired",
  "statusCode": 404,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Success Responses

Successful operations return:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

## Testing Workflow

1. **Setup**: Import collection and environment
2. **Authentication**: Register and login to get JWT token
3. **User Management**: Test user CRUD operations
4. **Role Management**: Test role and permission operations
5. **PR Distribution**: Test file upload and report management
6. **Cleanup**: Test delete operations

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check if `auth_token` is set correctly
2. **404 Not Found**: Verify the `base_url` is correct
3. **400 Bad Request**: Check request body format and validation rules
4. **500 Internal Server Error**: Check server logs for detailed error information

### Validation Rules

- **Passwords**: Minimum 8 characters, must contain uppercase, lowercase, number, and special character
- **Emails**: Must be valid email format
- **Names**: 2-100 characters, letters and spaces only
- **File Uploads**: CSV format only, max 50MB

## Support

If you encounter issues:
1. Check the server logs
2. Verify all environment variables are set
3. Ensure the server is running on the correct port
4. Check request/response formats match the examples

## API Version

This collection is designed for the current version of the PR Distribution API. Check with your development team for any updates or changes to the API structure.
