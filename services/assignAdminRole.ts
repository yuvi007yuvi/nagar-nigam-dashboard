import { assignAdminRole } from './userRoleService';

/**
 * Script to assign admin role to a user
 * Usage: Call this function with a valid user ID
 */
export const assignAdminToUser = async (userId: string) => {
  try {
    console.log(`Assigning admin role to user: ${userId}`);
    const result = await assignAdminRole(userId);
    
    if (result.success) {
      console.log('Admin role assigned successfully!');
      return { success: true, message: 'Admin role assigned successfully!' };
    } else {
      console.error('Failed to assign admin role:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    console.error('Error assigning admin role:', error);
    return { success: false, error: error.message };
  }
};

// Example usage (uncomment to use):
// assignAdminToUser('USER_ID_HERE').then(result => {
//   console.log(result);
// });

// Default export for CLI usage
export default assignAdminToUser;