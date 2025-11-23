# Admin Role Management

This document explains how to manage admin roles in the Nagar Nigam Dashboard application.

## Overview

The application now supports role-based access control with two roles:
1. **Admin** - Full access to all modules
2. **Basic User** - No access to any modules

## Available Modules for Admin Role

Admin users have access to the following modules:
- Dashboard
- Customers
- User Charge
- Fuel
- Weighment
- Bulk Collection
- Coverage Monitoring
- Attendance
- Complaint
- Admin
- KPI Dashboard
- Roles

## How to Assign Admin Role

### Method 1: Command Line Interface

To assign the admin role to a user via command line:

```bash
npm run assign-admin <user-id>
```

Replace `<user-id>` with the actual Firebase user ID.

Example:
```bash
npm run assign-admin abc123def456
```

### Method 2: Programmatic Assignment

You can also assign the admin role programmatically by importing the `assignAdminRole` function:

```typescript
import { assignAdminRole } from './services/userRoleService';

// Assign admin role to a user
const result = await assignAdminRole('USER_ID_HERE');

if (result.success) {
  console.log('Admin role assigned successfully!');
} else {
  console.error('Failed to assign admin role:', result.error);
}
```

## Role-Based Sidebar Display

The sidebar now dynamically displays modules based on the user's assigned role:
- Admin users see all modules in the sidebar
- Basic users see only the Dashboard module (which they cannot access)

## Testing Role Functionality

To verify that the role system is working correctly, run:

```bash
npm run test-roles
```

This will output information about the roles and their module access permissions.

## Default Role Assignment

New users registered through the application (either email/password or Google) are automatically assigned the admin role by default.