import { db } from './firebaseConfig.js';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
// Generic functions for CRUD operations
// Create a new document
export const createDocument = async (collectionName, data) => {
    try {
        const docRef = await addDoc(collection(db, collectionName), {
            ...data,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        return { success: true, id: docRef.id };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
};
// Get all documents from a collection
export const getAllDocuments = async (collectionName) => {
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const documents = [];
        querySnapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: documents };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
};
// Get a single document by ID
export const getDocumentById = async (collectionName, id) => {
    try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
        }
        else {
            return { success: false, error: 'Document not found' };
        }
    }
    catch (error) {
        return { success: false, error: error.message };
    }
};
// Update a document
export const updateDocument = async (collectionName, id, data) => {
    try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: Timestamp.now()
        });
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
};
// Delete a document
export const deleteDocument = async (collectionName, id) => {
    try {
        await deleteDoc(doc(db, collectionName, id));
        return { success: true };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
};
// Get documents with query
export const getDocumentsWithQuery = async (collectionName, field, operator, value) => {
    try {
        const q = query(collection(db, collectionName), where(field, operator, value));
        const querySnapshot = await getDocs(q);
        const documents = [];
        querySnapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: documents };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
};
// Specific functions for different modules
// Customer Management
export const createCustomer = (customerData) => createDocument('customers', customerData);
export const getAllCustomers = () => getAllDocuments('customers');
export const getCustomerById = (id) => getDocumentById('customers', id);
export const updateCustomer = (id, data) => updateDocument('customers', id, data);
export const deleteCustomer = (id) => deleteDocument('customers', id);
// User Charge Collection
export const createUserCharge = (chargeData) => createDocument('userCharges', chargeData);
export const getAllUserCharges = () => getAllDocuments('userCharges');
export const getUserChargeById = (id) => getDocumentById('userCharges', id);
export const updateUserCharge = (id, data) => updateDocument('userCharges', id, data);
export const deleteUserCharge = (id) => deleteDocument('userCharges', id);
// Fuel Management
export const createFuelEntry = (fuelData) => createDocument('fuelEntries', fuelData);
export const getAllFuelEntries = () => getAllDocuments('fuelEntries');
export const getFuelEntryById = (id) => getDocumentById('fuelEntries', id);
export const updateFuelEntry = (id, data) => updateDocument('fuelEntries', id, data);
export const deleteFuelEntry = (id) => deleteDocument('fuelEntries', id);
// Weighment Monitoring
export const createWeighment = (weighmentData) => createDocument('weighments', weighmentData);
export const getAllWeighments = () => getAllDocuments('weighments');
export const getWeighmentById = (id) => getDocumentById('weighments', id);
export const updateWeighment = (id, data) => updateDocument('weighments', id, data);
export const deleteWeighment = (id) => deleteDocument('weighments', id);
// Bulk Collection
export const createBulkCollection = (collectionData) => createDocument('bulkCollections', collectionData);
export const getAllBulkCollections = () => getAllDocuments('bulkCollections');
export const getBulkCollectionById = (id) => getDocumentById('bulkCollections', id);
export const updateBulkCollection = (id, data) => updateDocument('bulkCollections', id, data);
export const deleteBulkCollection = (id) => deleteDocument('bulkCollections', id);
// Coverage Monitoring
export const createCoverageRecord = (coverageData) => createDocument('coverageRecords', coverageData);
export const getAllCoverageRecords = () => getAllDocuments('coverageRecords');
export const getCoverageRecordById = (id) => getDocumentById('coverageRecords', id);
export const updateCoverageRecord = (id, data) => updateDocument('coverageRecords', id, data);
export const deleteCoverageRecord = (id) => deleteDocument('coverageRecords', id);
// Attendance
export const createAttendanceRecord = (attendanceData) => createDocument('attendanceRecords', attendanceData);
export const getAllAttendanceRecords = () => getAllDocuments('attendanceRecords');
export const getAttendanceRecordById = (id) => getDocumentById('attendanceRecords', id);
export const updateAttendanceRecord = (id, data) => updateDocument('attendanceRecords', id, data);
export const deleteAttendanceRecord = (id) => deleteDocument('attendanceRecords', id);
// Complaints
export const createComplaint = (complaintData) => createDocument('complaints', complaintData);
export const getAllComplaints = () => getAllDocuments('complaints');
export const getComplaintById = (id) => getDocumentById('complaints', id);
export const updateComplaint = (id, data) => updateDocument('complaints', id, data);
export const deleteComplaint = (id) => deleteDocument('complaints', id);
// Admin Data (Zones, Wards, Vehicles, etc.)
export const createAdminData = (collectionName, data) => createDocument(collectionName, data);
export const getAllAdminData = (collectionName) => getAllDocuments(collectionName);
export const getAdminDataById = (collectionName, id) => getDocumentById(collectionName, id);
export const updateAdminData = (collectionName, id, data) => updateDocument(collectionName, id, data);
export const deleteAdminData = (collectionName, id) => deleteDocument(collectionName, id);