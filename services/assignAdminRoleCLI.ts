#!/usr/bin/env node

import assignAdminToUser from './assignAdminRole';

// Get user ID from command line arguments
const userId = process.argv[2];

if (!userId) {
  console.error('Usage: npm run assign-admin <user-id>');
  console.error('Please provide a user ID as an argument');
  process.exit(1);
}

// Assign admin role to the user
assignAdminToUser(userId).then(result => {
  if (result.success) {
    console.log(result.message);
    process.exit(0);
  } else {
    console.error('Failed to assign admin role:', result.error);
    process.exit(1);
  }
}).catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});