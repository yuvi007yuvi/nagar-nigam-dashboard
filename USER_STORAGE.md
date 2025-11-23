# User Storage in Database

This document explains how user login information is stored in the Firestore database.

## Overview

All users who log in to the application (whether through email/password, Google, or other providers) have their information stored in the `users` collection in Firestore. This happens automatically when users log in or register.

## Data Stored

For each user, the following information is stored:

- `uid`: Firebase user ID
- `email`: User's email address
- `displayName`: User's display name (if available)
- `photoURL`: User's profile photo URL (if available)
- `providerId`: Authentication provider used (e.g., 'password', 'google.com')
- `lastLoginAt`: Timestamp of the last login
- `createdAt`: Timestamp when the user account was created
- `userId`: User ID (same as uid, added by the createDocument function)
- `userName`: User name (derived from display name or email, added by the createDocument function)

## How It Works

1. **Registration**: When a new user registers, their information is stored in the database after account creation.

2. **Login**: When an existing user logs in, their information is stored/updated in the database.

3. **Google Login**: When a user logs in with Google, their information is stored in the database.

4. **Auth State Changes**: The application listens for authentication state changes and stores user information whenever a user logs in.

## Implementation Details

The user storage functionality is implemented across several files:

1. **[userManagementService.ts](file:///d:/MY%20FREELANCING/nagar-nigam-dashboard/services/userManagementService.ts)**: Contains functions to store and update user information.

2. **[authService.ts](file:///d:/MY%20FREELANCING/nagar-nigam-dashboard/services/authService.ts)**: Calls the user management service after successful authentication.

3. **[App.tsx](file:///d:/MY%20FREELANCING/nagar-nigam-dashboard/App.tsx)**: Listens for auth state changes and stores user information.

4. **[databaseService.ts](file:///d:/MY%20FREELANCING/nagar-nigam-dashboard/services/databaseService.ts)**: Provides the generic functions to interact with the database.

## Testing

To test the user management functionality:

```bash
npm run test-user-management
```

## Security

User information is stored securely in Firestore with the following considerations:

1. Only authenticated users can access their own data (enforced by Firestore rules)
2. User data is associated with their Firebase UID
3. Sensitive information is not stored in plain text

## Data Structure

Example document in the `users` collection:

```javascript
{
  uid: "user-firebase-uid",
  email: "user@example.com",
  displayName: "User Name",
  photoURL: "https://example.com/photo.jpg",
  providerId: "google.com",
  lastLoginAt: Timestamp,
  createdAt: Timestamp,
  userId: "user-firebase-uid",
  userName: "User Name",
  updatedAt: Timestamp
}```
```