# User Data Storage

This document explains how user information is stored with each document in the Firestore database.

## Overview

All documents created in the application now automatically include user identification information:
- `userId`: The Firebase UID of the authenticated user
- `userName`: The display name or email of the authenticated user
- `createdAt`: Timestamp when the document was created
- `updatedAt`: Timestamp when the document was last updated

## Automatic User Data Inclusion

When any document is created through the [databaseService.ts](file:///d:/MY%20FREELANCING/nagar-nigam-dashboard/services/databaseService.ts) functions, the following user information is automatically added:

```javascript
{
  // ... original document data ...
  userId: "firebase-user-uid",
  userName: "User Display Name or Email",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Firestore Security Rules

The Firestore rules have been updated to ensure:
1. Users can only read and write their own data
2. User ID must match the authenticated user's UID
3. Required fields (userId, userName, createdAt) must be present when creating documents
4. Certain collections (zones, wards) are read-only for regular users

## Example Document Structure

A customer document would now look like:

```javascript
{
  id: "document-id",
  name: "John Doe",
  email: "john@example.com",
  phone: "123-456-7890",
  userId: "user-uid-123",
  userName: "John Doe",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Querying User-Specific Data

New helper functions have been added to query data by user:

```typescript
// Get all customers for a specific user
const userCustomers = await getCustomersByUser("user-uid-123");

// Get all user charges for a specific user
const userCharges = await getUserChargesByUser("user-uid-123");
```

## Security Benefits

This approach provides several security benefits:
1. Data isolation - users can only access their own data
2. Audit trail - all documents are traceable to specific users
3. Data integrity - required user fields prevent anonymous data creation
4. Compliance - user data attribution helps with regulatory requirements