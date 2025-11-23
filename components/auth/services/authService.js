import { auth } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';
// Register a new user
export const registerUser = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
};
// Login user
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
};
// Google Login
export const loginWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return { success: true, user: result.user };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
};
// Google Login with Redirect (for mobile browsers)
export const loginWithGoogleRedirect = async () => {
    try {
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
};
// Logout user
export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
};
// Listen for auth state changes
export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};
