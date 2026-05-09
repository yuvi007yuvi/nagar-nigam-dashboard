import { db } from './firebaseConfig';
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';

// Define available roles/modules constants for reference
export const ROLES = {
  ADMIN: 'admin',
  BASIC_USER: 'basic_user'
};

// Define all available modules
export const ALL_MODULES = [
  'Dashboard',
  'Customers',
  'User Charge',
  'Fuel',
  'Weighment',
  'Bulk Collection',
  'Live Vehicle',
  'Attendance',
  'Complaint',
  'Admin',
  'KPI Dashboard',
  'Roles',
  'POI Monitoring',
  'Settings',
  'Vehicle History',
  'Vehicle Master',
  'Parking & Dump',
  'Maintenance ERP'
];

// Default permissions for roles
const DEFAULT_ROLE_PERMISSIONS = {
  'admin': [...ALL_MODULES, 'Profile', 'Maintenance ERP'],
  'basic_user': ['Complaint', 'Profile', 'POI Monitoring']
};

// Interface for Role
export interface Role {
  id: string;
  name: string;
  modules: string[];
  description?: string;
  createdAt?: any;
  updatedAt?: any;
}

// Collection reference
const ROLES_COLLECTION = 'roles';
const USER_ROLES_COLLECTION = 'userRoles';

// Create a new role
export const createRole = async (roleId: string, roleName: string, modules: string[], description: string = '') => {
  try {
    const roleRef = doc(collection(db, ROLES_COLLECTION), roleId);
    const roleData: Role = {
      id: roleId,
      name: roleName,
      modules,
      description,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(roleRef, roleData);
    return { success: true, data: roleData };
  } catch (error: any) {
    console.error('Error creating role:', error);
    return { success: false, error: error.message };
  }
};

// Update an existing role
export const updateRole = async (roleId: string, roleName: string, modules: string[], description?: string) => {
  try {
    const roleRef = doc(db, ROLES_COLLECTION, roleId);
    const updateData: any = {
      name: roleName,
      modules,
      updatedAt: Timestamp.now()
    };

    if (description !== undefined) {
      updateData.description = description;
    }

    await updateDoc(roleRef, updateData);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating role:', error);
    return { success: false, error: error.message };
  }
};

// Delete a role
export const deleteRole = async (roleId: string) => {
  try {
    // Prevent deleting admin role
    if (roleId === ROLES.ADMIN) {
      return { success: false, error: 'Cannot delete admin role' };
    }

    await deleteDoc(doc(db, ROLES_COLLECTION, roleId));
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting role:', error);
    return { success: false, error: error.message };
  }
};

// Get all roles from the database
export const getAllRoles = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, ROLES_COLLECTION));
    const roles: Role[] = [];
    querySnapshot.forEach((doc) => {
      roles.push(doc.data() as Role);
    });

    if (roles.length === 0) {
      // Return default mock roles
      return {
        success: true,
        data: [
          { id: 'admin', name: 'Administrator', modules: ALL_MODULES, description: 'Full access' },
          { id: 'supervisor', name: 'Supervisor', modules: ['Dashboard', 'Live Vehicle', 'Attendance', 'Bulk Collection'], description: 'Field supervisor' },
          { id: 'collector', name: 'Collector', modules: ['Dashboard', 'User Charge'], description: 'Revenue collector' },
          { id: 'citizen', name: 'Citizen', modules: ['Dashboard', 'Complaint', 'POI Monitoring'], description: 'End user' },
        ]
      };
    }

    return { success: true, data: roles };
  } catch (error: any) {
    console.error('Error getting all roles:', error);
    return { success: false, error: error.message };
  }
};

// Initialize default roles in the database
export const initializeDefaultRoles = async () => {
  try {
    // Check if admin role exists
    const adminRef = doc(db, ROLES_COLLECTION, ROLES.ADMIN);
    const adminSnap = await getDoc(adminRef);

    if (!adminSnap.exists()) {
      await createRole(
        ROLES.ADMIN,
        'Administrator',
        DEFAULT_ROLE_PERMISSIONS.admin,
        'Full access to all modules'
      );
      console.log('Initialized Admin role');
    } else {
      // Check if Settings, Vehicle History, Vehicle Master or Maintenance ERP is missing from Admin role and update if needed
      const adminData = adminSnap.data() as Role;
      if (!adminData.modules.includes('Settings') || 
          !adminData.modules.includes('Vehicle History') || 
          !adminData.modules.includes('Vehicle Master') ||
          !adminData.modules.includes('Maintenance ERP')) {
        await updateRole(
          ROLES.ADMIN,
          'Administrator',
          DEFAULT_ROLE_PERMISSIONS.admin,
          'Full access to all modules'
        );
        console.log('Updated Admin role with new modules');
      }
    }

    // Check if basic user role exists
    const basicRef = doc(db, ROLES_COLLECTION, ROLES.BASIC_USER);
    const basicSnap = await getDoc(basicRef);

    if (!basicSnap.exists()) {
      await createRole(
        ROLES.BASIC_USER,
        'Basic User',
        DEFAULT_ROLE_PERMISSIONS.basic_user,
        'Limited access to Dashboard and Complaints'
      );
      console.log('Initialized Basic User role');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error initializing default roles:', error);
    return { success: false, error: error.message };
  }
};

// Assign role to user
export const assignRoleToUser = async (userId: string, role: string) => {
  try {
    // Verify role exists first
    const roleRef = doc(db, ROLES_COLLECTION, role);
    const roleSnap = await getDoc(roleRef);

    if (!roleSnap.exists()) {
      // If role doesn't exist, try to initialize defaults
      if (role === ROLES.ADMIN || role === ROLES.BASIC_USER) {
        await initializeDefaultRoles();
      } else {
        return { success: false, error: `Role ${role} does not exist` };
      }
    }

    // Save user role to Firestore
    const userRoleRef = doc(collection(db, USER_ROLES_COLLECTION), userId);
    await setDoc(userRoleRef, { role, userId, assignedAt: Timestamp.now() });

    // Also update the user document with the role for easier access
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { role }, { merge: true });

    return { success: true };
  } catch (error: any) {
    console.error('Error assigning role to user:', error);
    return { success: false, error: error.message };
  }
};

// Get user role
export const getUserRole = async (userId: string) => {
  try {
    const userRoleRef = doc(collection(db, USER_ROLES_COLLECTION), userId);
    const docSnap = await getDoc(userRoleRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      // Return basic user role for all users by default
      return { success: true, data: { role: ROLES.BASIC_USER } };
    }
  } catch (error: any) {
    console.error('Error getting user role:', error);
    // Return basic user role if there's an error
    return { success: false, error: error.message };
  }
};

// Get allowed modules for a user based on their role
export const getAllowedModules = async (userId: string) => {
  try {
    // 1. Get user's role
    const roleResult = await getUserRole(userId);
    if (!roleResult.success) {
      return { success: false, error: 'Failed to get user role' };
    }

    const roleId = roleResult.data.role;

    // 2. Get role definition from roles collection
    const roleRef = doc(db, ROLES_COLLECTION, roleId);
    const roleSnap = await getDoc(roleRef);

    if (roleSnap.exists()) {
      const roleData = roleSnap.data() as Role;
      return { success: true, data: roleData.modules || [] };
    } else {
      // Fallback for hardcoded defaults if DB record missing
      // @ts-ignore
      const defaultModules = DEFAULT_ROLE_PERMISSIONS[roleId] || [];
      return { success: true, data: defaultModules };
    }
  } catch (error: any) {
    console.error('Error getting allowed modules:', error);
    return { success: false, error: error.message };
  }
};

// Assign admin role to a user (helper)
export const assignAdminRole = async (userId: string) => {
  return assignRoleToUser(userId, ROLES.ADMIN);
};

// Assign default role if user has none
export const assignDefaultRoleIfNeeded = async (userId: string) => {
  try {
    const userRoleRef = doc(db, USER_ROLES_COLLECTION, userId);
    const docSnap = await getDoc(userRoleRef);

    if (!docSnap.exists()) {
      console.log(`Assigning default role to user ${userId}`);
      await assignRoleToUser(userId, ROLES.BASIC_USER);
      return { success: true, assigned: true };
    }
    return { success: true, assigned: false };
  } catch (error: any) {
    console.error('Error assigning default role:', error);
    return { success: false, error: error.message };
  }
};
// Get all users from the database
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users: any[] = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: users };
  } catch (error: any) {
    console.error('Error getting all users:', error);
    return { success: false, error: error.message };
  }
};

// Get all users along with their assigned roles
export const getAllUsersWithRoles = async () => {
  try {
    // 1. Get all base users
    const usersResult = await getAllUsers();
    if (!usersResult.success) {
      return usersResult;
    }

    // 2. Get all role assignments
    const userRolesSnapshot = await getDocs(collection(db, USER_ROLES_COLLECTION));
    const roleMap: Record<string, any> = {};
    userRolesSnapshot.forEach((doc) => {
      roleMap[doc.id] = doc.data();
    });

    // 3. Merge users with their roles
    const usersWithRoles = usersResult.data.map((user: any) => {
      const roleData = roleMap[user.id];
      return {
        ...user,
        role: roleData ? roleData.role : ROLES.BASIC_USER, // Default to basic user
        roleAssignedAt: roleData ? roleData.assignedAt : null
      };
    });

    return { success: true, data: usersWithRoles };
  } catch (error: any) {
    console.error('Error getting users with roles:', error);
    return { success: false, error: error.message };
  }
};
