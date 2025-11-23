#!/usr/bin/env node

import { checkUserRole, isUserAdmin } from './checkUserRole.ts';

// Get user ID from command line arguments
const userId = process.argv[2];

if (!userId) {
  console.error('Usage: node checkUserRoleCLI.ts <user-id>');
  console.error('Please provide a Firebase user ID as an argument');
  process.exit(1);
}

// Check the user's role
async function checkRole() {
  console.log(`Checking role for user ID: ${userId}`);
  
  try {
    // Check user role
    const roleResult = await checkUserRole(userId);
    
    if (roleResult.success) {
      console.log(`✓ ${roleResult.message}`);
      
      // Also check if user is admin
      const adminResult = await isUserAdmin(userId);
      if (adminResult.success) {
        if (adminResult.isAdmin) {
          console.log('✓ User has ADMIN role');
        } else {
          console.log(`ℹ User has ${adminResult.role} role (not admin)`);
        }
      }
    } else {
      console.error(`✗ ${roleResult.message}`);
      process.exit(1);
    }
  } catch (error: any) {
    console.error(`✗ Error checking user role: ${error.message}`);
    process.exit(1);
  }
}

// Run the check
checkRole();