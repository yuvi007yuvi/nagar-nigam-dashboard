import { getUserRole } from './userRoleService';

/**
 * Function to check the role of a logged-in user
 * @param userId - The Firebase user ID
 * @returns Promise with user role information
 */
export const checkUserRole = async (userId: string) => {
  try {
    // Get the user's role from Firestore
    const roleResult = await getUserRole(userId);
    
    if (roleResult.success) {
      return {
        success: true,
        role: roleResult.data.role,
        message: `User has role: ${roleResult.data.role}`
      };
    } else {
      return {
        success: false,
        role: null,
        message: 'Failed to retrieve user role'
      };
    }
  } catch (error: any) {
    console.error('Error checking user role:', error);
    return {
      success: false,
      role: null,
      message: `Error: ${error.message}`
    };
  }
};

/**
 * Function to check if a user has admin role
 * @param userId - The Firebase user ID
 * @returns Promise with boolean indicating if user is admin
 */
export const isUserAdmin = async (userId: string) => {
  try {
    const roleResult = await getUserRole(userId);
    
    if (roleResult.success) {
      return {
        success: true,
        isAdmin: roleResult.data.role === 'admin',
        role: roleResult.data.role
      };
    } else {
      return {
        success: false,
        isAdmin: false,
        role: null,
        message: 'Failed to retrieve user role'
      };
    }
  } catch (error: any) {
    console.error('Error checking admin role:', error);
    return {
      success: false,
      isAdmin: false,
      role: null,
      message: `Error: ${error.message}`
    };
  }
};

// Example usage:
// const userId = "USER_FIREBASE_ID";
// checkUserRole(userId).then(result => {
//   if (result.success) {
//     console.log(result.message);
//   } else {
//     console.error(result.message);
//   }
// });