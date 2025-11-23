# Firebase Integration Guide

This document explains how Firebase has been integrated into the Nagar Nigam Dashboard application.

## Overview

The application now uses Firebase for:
1. User Authentication (Email/Password)
2. Cloud Firestore for data storage
3. Real-time data synchronization

## Firebase Setup

### 1. Environment Configuration

Create a `.env` file in the root directory with your Firebase configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 2. Firebase Services

The following services have been implemented:

#### Authentication Service (`services/authService.ts`)
- User registration
- User login
- User logout
- Auth state monitoring

#### Database Service (`services/databaseService.ts`)
- CRUD operations for all modules:
  - Customers
  - User Charges
  - Fuel Entries
  - Weighments
  - Bulk Collections
  - Coverage Records
  - Attendance Records
  - Complaints
  - Admin Data (Zones, Wards, etc.)

#### Data Context (`services/DataContext.tsx`)
- Centralized data management
- Real-time data updates
- Loading and error states

## Module Integration

### Authentication Flow
1. Users access `/login` route
2. Upon successful authentication, users are redirected to the dashboard
3. Auth state is persisted across sessions

### Data Flow
1. Data is fetched from Firestore on app initialization
2. Components consume data through the `useData()` hook
3. Changes in Firestore automatically update the UI

## Collections Structure

The following Firestore collections are used:

- `customers` - Customer information
- `userCharges` - User charge records
- `fuelEntries` - Fuel management data
- `weighments` - Weighment monitoring data
- `bulkCollections` - Bulk collection records
- `coverageRecords` - Coverage monitoring data
- `attendanceRecords` - Staff attendance records
- `complaints` - Complaint management
- `zones` - Administrative zones
- `wards` - Administrative wards

## Seeding Initial Data

To populate the database with sample data:

1. Import the seed function:
```javascript
import { seedDatabase } from './services/seedData';
```

2. Call the function:
```javascript
seedDatabase();
```

## Security Rules

For production, implement the following Firestore security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Testing

To test the Firebase integration:

1. Ensure environment variables are set correctly
2. Run the application: `npm run dev`
3. Navigate to `/login`
4. Register a new user or login with existing credentials
5. Verify data loads in dashboard components

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure variables are prefixed with `VITE_`
   - Restart the development server after changes

2. **Firebase Authentication Errors**
   - Verify Firebase project settings
   - Check API key permissions

3. **Firestore Data Not Loading**
   - Verify security rules
   - Check network connectivity
   - Ensure collections exist in Firestore

### Error Handling

The application includes comprehensive error handling:
- Authentication errors are displayed in the login form
- Data loading errors are shown in each module
- Network errors are gracefully handled

## Future Enhancements

1. **Role-based Access Control**
   - Implement different user roles (admin, supervisor, staff)
   - Restrict data access based on user permissions

2. **Real-time Updates**
   - Implement real-time listeners for critical data
   - Add presence indicators for online users

3. **Offline Support**
   - Enable offline data persistence
   - Implement conflict resolution strategies

4. **Advanced Analytics**
   - Integrate Firebase Analytics
   - Track user interactions and feature usage

## Support

For issues with Firebase integration, contact the development team or refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)