#!/usr/bin/env node

import { storeUserLogin } from './userManagementService.ts';

// Test storing user login information
async function testUserManagement() {
  console.log('Testing user management service...');
  
  // Create a mock user object
  const mockUser = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    providerId: 'password',
    metadata: {
      creationTime: new Date().toISOString()
    }
  };
  
  try {
    const result = await storeUserLogin(mockUser);
    
    if (result.success) {
      console.log('✓ User login stored successfully');
    } else {
      console.error('✗ Failed to store user login:', result.error);
    }
  } catch (error) {
    console.error('✗ Error storing user login:', error);
  }
  
  console.log('\nUser management test completed.');
}

// Run the test
testUserManagement().catch(console.error);