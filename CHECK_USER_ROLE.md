# How to Check a User's Role

This document explains how to check a logged-in user's role in the Nagar Nigam Dashboard application.

## Overview

User roles are stored in Firestore in the `userRoles` collection, with each document ID matching the user's Firebase UID. The application provides several ways to check a user's role.

## Methods to Check User Role

### 1. Using the Command Line Interface

You can check any user's role from the command line:

```bash
npm run check-role <user-id>
```

Replace `<user-id>` with the actual Firebase user ID.

Example:
```bash
npm run check-role abc123def456
```

### 2. Programmatically in Code

To check a user's role programmatically, import and use the `checkUserRole` function:

```typescript
import { checkUserRole } from './services/checkUserRole';

const userId = 'USER_FIREBASE_ID';
const result = await checkUserRole(userId);

if (result.success) {
  console.log(result.message); // e.g., "User has role: admin"
} else {
  console.error(result.message);
}
```

### 3. Check if User is Admin

To specifically check if a user has admin privileges:

```typescript
import { isUserAdmin } from './services/checkUserRole';

const userId = 'USER_FIREBASE_ID';
const result = await isUserAdmin(userId);

if (result.success) {
  if (result.isAdmin) {
    console.log('User is an administrator');
  } else {
    console.log(`User has ${result.role} role (not admin)`);
  }
}
```

### 4. In the User Interface

The user's role is automatically displayed in the header of the application next to their name. The role is fetched when the component loads using the `getUserRole` function from [userRoleService.ts](file:///d:/MY%20FREELANCING/nagar-nigam-dashboard/services/userRoleService.ts).

## Role Values

The system currently supports these roles:
- `admin` - Full access to all modules
- `basic_user` - Limited access (default for new users)

## Role Storage

User roles are stored in Firestore in the `userRoles` collection with the following structure:

```javascript
{
  userId: "firebase-user-uid",
  role: "admin", // or "basic_user"
  assignedAt: Timestamp
}
```

## Error Handling

All role checking functions include proper error handling:
- Network errors
- Missing user records
- Firestore access issues

If an error occurs, the functions will return a failure result with an error message.