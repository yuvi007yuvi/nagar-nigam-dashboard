import { auth } from './firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect
} from 'firebase/auth';
import { assignRoleToUser, ROLES } from './userRoleService';
import { storeUserLogin } from './userManagementService';

// Register a new user
export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Assign admin role to the new user
    await assignRoleToUser(userCredential.user.uid, ROLES.ADMIN);
    // Store user information in the database
    await storeUserLogin(userCredential.user);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Login user
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Roles are fetched separately in App.tsx
    // Store user information in the database
    await storeUserLogin(userCredential.user);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Google Login
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    // Assign admin role to Google users
    await assignRoleToUser(result.user.uid, ROLES.ADMIN);
    // Store user information in the database
    await storeUserLogin(result.user);
    return { success: true, user: result.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Google Login with Redirect (for mobile browsers)
export const loginWithGoogleRedirect = async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
    // Note: User information will be stored after redirect completes
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Listen for auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};