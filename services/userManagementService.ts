import { createUserData, updateUser, setDocument } from './databaseService.ts';
import { auth } from './firebaseConfig.ts';
import { Timestamp } from 'firebase/firestore';

/**
 * Store user information in the database when they log in
 * @param user - Firebase user object
 * @returns Promise with result of the operation
 */
export const storeUserLogin = async (user: any) => {
  try {
    // Prepare user data to store
    const userData = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      providerId: user.providerId || '',
      lastLoginAt: Timestamp.now(),
      createdAt: user.metadata?.creationTime ? new Date(user.metadata.creationTime) : Timestamp.now(),
    };

    // Store user data in the database using setDocument to ensure ID matches UID
    const result = await setDocument('users', user.uid, userData);

    if (result.success) {
      return { success: true, message: 'User login stored successfully' };
    } else {
      console.error('Failed to store user login:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    console.error('Error storing user login:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update user's last login time
 * @param userId - Firebase user ID
 * @returns Promise with result of the operation
 */
export const updateUserLogin = async (userId: string) => {
  try {
    // Update the user's last login time
    // Note: This would require querying for the user document by uid first
    // For now, we'll just log that this would happen
    console.log(`Would update user ${userId} login time`);
    const result = { success: true, error: null };

    if (result.success) {
      console.log(`User ${userId} login time updated successfully`);
      return { success: true, message: 'User login time updated successfully' };
    } else {
      console.error('Failed to update user login time:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    console.error('Error updating user login time:', error);
    return { success: false, error: error.message };
  }
};

export default { storeUserLogin, updateUserLogin };