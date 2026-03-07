import { db, auth } from './firebaseConfig';
import {
  collection,
  addDoc,
  setDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import * as MOCK from './mockData';

// Generic functions for CRUD operations

// Create a new document
export const createDocument = async (collectionName: string, data: any) => {
  try {
    // Get current user info
    const currentUser = auth.currentUser;
    const userId = currentUser ? currentUser.uid : 'unknown';
    const userName = currentUser ? (currentUser.displayName || currentUser.email || 'Anonymous') : 'Unknown User';

    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      userId,
      userName,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Set a document with a specific ID (create or overwrite)
export const setDocument = async (collectionName: string, id: string, data: any) => {
  try {
    // Get current user info
    const currentUser = auth.currentUser;
    const userId = currentUser ? currentUser.uid : 'unknown';
    const userName = currentUser ? (currentUser.displayName || currentUser.email || 'Anonymous') : 'Unknown User';

    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, {
      ...data,
      userId, // Ensure we track who created/updated it if not present
      userName,
      updatedAt: Timestamp.now()
    }, { merge: true });

    return { success: true, id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Get all documents from a collection
export const getAllDocuments = async (collectionName: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const documents: any[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });

    if (documents.length === 0) {
      // Fallback to mock data
      let mockData: any[] = [];
      switch (collectionName) {
        case 'customers': mockData = MOCK.MOCK_CUSTOMERS; break;
        case 'userCharges': mockData = MOCK.MOCK_USER_CHARGES; break;
        case 'fuelEntries': mockData = MOCK.MOCK_FUEL_ENTRIES; break;
        case 'weighments': mockData = MOCK.MOCK_WEIGHMENTS; break;
        case 'bulkCollections': mockData = MOCK.MOCK_BULK_COLLECTIONS; break;
        case 'attendanceRecords': mockData = MOCK.MOCK_ATTENDANCE; break;
        case 'complaints': mockData = MOCK.MOCK_COMPLAINTS; break;
        case 'zones': mockData = MOCK.MOCK_ZONES; break;
        case 'wards': mockData = MOCK.MOCK_WARDS; break;
        default: mockData = [];
      }
      return { success: true, data: mockData };
    }

    return { success: true, data: documents };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Get a single document by ID
export const getDocumentById = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Document not found' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Update a document
export const updateDocument = async (collectionName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Delete a document
export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Get documents with query
export const getDocumentsWithQuery = async (
  collectionName: string,
  field: string,
  operator: any,
  value: any
) => {
  try {
    const q = query(collection(db, collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    const documents: any[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: documents };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Specific functions for different modules

// Customer Management
export const createCustomer = (customerData: any) => createDocument('customers', customerData);
export const getCustomersByUser = (userId: string) => getDocumentsWithQuery('customers', 'userId', '==', userId);
export const getAllCustomers = () => getAllDocuments('customers');
export const getCustomerById = (id: string) => getDocumentById('customers', id);
export const updateCustomer = (id: string, data: any) => updateDocument('customers', id, data);
export const deleteCustomer = (id: string) => deleteDocument('customers', id);

// User Charge Collection
export const createUserCharge = (chargeData: any) => createDocument('userCharges', chargeData);
export const getUserChargesByUser = (userId: string) => getDocumentsWithQuery('userCharges', 'userId', '==', userId);
export const getAllUserCharges = () => getAllDocuments('userCharges');
export const getUserChargeById = (id: string) => getDocumentById('userCharges', id);
export const updateUserCharge = (id: string, data: any) => updateDocument('userCharges', id, data);
export const deleteUserCharge = (id: string) => deleteDocument('userCharges', id);

// Fuel Management
export const createFuelEntry = (fuelData: any) => createDocument('fuelEntries', fuelData);
export const getAllFuelEntries = () => getAllDocuments('fuelEntries');
export const getFuelEntryById = (id: string) => getDocumentById('fuelEntries', id);
export const updateFuelEntry = (id: string, data: any) => updateDocument('fuelEntries', id, data);
export const deleteFuelEntry = (id: string) => deleteDocument('fuelEntries', id);

// Weighment Monitoring
export const createWeighment = (weighmentData: any) => createDocument('weighments', weighmentData);
export const getAllWeighments = () => getAllDocuments('weighments');
export const getWeighmentById = (id: string) => getDocumentById('weighments', id);
export const updateWeighment = (id: string, data: any) => updateDocument('weighments', id, data);
export const deleteWeighment = (id: string) => deleteDocument('weighments', id);

// Bulk Collection
export const createBulkCollection = (collectionData: any) => createDocument('bulkCollections', collectionData);
export const getAllBulkCollections = () => getAllDocuments('bulkCollections');
export const getBulkCollectionById = (id: string) => getDocumentById('bulkCollections', id);
export const updateBulkCollection = (id: string, data: any) => updateDocument('bulkCollections', id, data);
export const deleteBulkCollection = (id: string) => deleteDocument('bulkCollections', id);

// Coverage Monitoring
export const createCoverageRecord = (coverageData: any) => createDocument('coverageRecords', coverageData);
export const getAllCoverageRecords = () => getAllDocuments('coverageRecords');
export const getCoverageRecordById = (id: string) => getDocumentById('coverageRecords', id);
export const updateCoverageRecord = (id: string, data: any) => updateDocument('coverageRecords', id, data);
export const deleteCoverageRecord = (id: string) => deleteDocument('coverageRecords', id);

// Attendance
export const createAttendanceRecord = (attendanceData: any) => createDocument('attendanceRecords', attendanceData);
export const getAllAttendanceRecords = () => getAllDocuments('attendanceRecords');
export const getAttendanceRecordById = (id: string) => getDocumentById('attendanceRecords', id);
export const updateAttendanceRecord = (id: string, data: any) => updateDocument('attendanceRecords', id, data);
export const deleteAttendanceRecord = (id: string) => deleteDocument('attendanceRecords', id);

// Complaints
export const createComplaint = (complaintData: any) => createDocument('complaints', complaintData);
export const getAllComplaints = () => getAllDocuments('complaints');
export const getComplaintById = (id: string) => getDocumentById('complaints', id);
export const updateComplaint = (id: string, data: any) => updateDocument('complaints', id, data);
export const deleteComplaint = (id: string) => deleteDocument('complaints', id);

// User Management
export const createUserData = (userData: any) => createDocument('users', userData);
export const getUserById = (id: string) => getDocumentById('users', id);
export const getAllUsers = () => getAllDocuments('users');
export const updateUser = (id: string, data: any) => updateDocument('users', id, data);

// Admin Data (Zones, Wards, Vehicles, etc.)
export const createAdminData = (collectionName: string, data: any) => createDocument(collectionName, data);
export const getAllAdminData = (collectionName: string) => getAllDocuments(collectionName);
export const getAdminDataById = (collectionName: string, id: string) => getDocumentById(collectionName, id);
export const updateAdminData = (collectionName: string, id: string, data: any) => updateDocument(collectionName, id, data);
export const deleteAdminData = (collectionName: string, id: string) => deleteDocument(collectionName, id);