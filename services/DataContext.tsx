import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAllCustomers, 
  getAllUserCharges, 
  getAllFuelEntries, 
  getAllWeighments, 
  getAllBulkCollections, 
  getAllCoverageRecords, 
  getAllAttendanceRecords, 
  getAllComplaints,
  getAllAdminData,
  getCustomersByUser,
  getUserChargesByUser
} from './databaseService';

// Define types for our data
interface DataContextType {
  customers: any[];
  userCharges: any[];
  fuelEntries: any[];
  weighments: any[];
  bulkCollections: any[];
  coverageRecords: any[];
  attendanceRecords: any[];
  complaints: any[];
  zones: any[];
  wards: any[];
  loading: boolean;
  error: string | null;
  refreshData: () => void;
}

// Create context with default values
const DataContext = createContext<DataContextType>({
  customers: [],
  userCharges: [],
  fuelEntries: [],
  weighments: [],
  bulkCollections: [],
  coverageRecords: [],
  attendanceRecords: [],
  complaints: [],
  zones: [],
  wards: [],
  loading: false,
  error: null,
  refreshData: () => {}
});

// Create a provider component
export const DataProvider: React.FC<{ children: React.ReactNode; userId?: string }> = ({ children, userId }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [userCharges, setUserCharges] = useState<any[]>([]);
  const [fuelEntries, setFuelEntries] = useState<any[]>([]);
  const [weighments, setWeighments] = useState<any[]>([]);
  const [bulkCollections, setBulkCollections] = useState<any[]>([]);
  const [coverageRecords, setCoverageRecords] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let results;
      
      if (userId) {
        // Fetch user-specific data
        results = await Promise.all([
          getCustomersByUser(userId),
          getUserChargesByUser(userId),
          getAllFuelEntries(),
          getAllWeighments(),
          getAllBulkCollections(),
          getAllCoverageRecords(),
          getAllAttendanceRecords(),
          getAllComplaints(),
          getAllAdminData('zones'),
          getAllAdminData('wards')
        ]);
      } else {
        // Fetch all data (admin view)
        results = await Promise.all([
          getAllCustomers(),
          getAllUserCharges(),
          getAllFuelEntries(),
          getAllWeighments(),
          getAllBulkCollections(),
          getAllCoverageRecords(),
          getAllAttendanceRecords(),
          getAllComplaints(),
          getAllAdminData('zones'),
          getAllAdminData('wards')
        ]);
      }
      
      const [
        customersResult,
        userChargesResult,
        fuelEntriesResult,
        weighmentsResult,
        bulkCollectionsResult,
        coverageRecordsResult,
        attendanceRecordsResult,
        complaintsResult,
        zonesResult,
        wardsResult
      ] = results;

      // Update state with fetched data
      if (customersResult.success) setCustomers(customersResult.data);
      if (userChargesResult.success) setUserCharges(userChargesResult.data);
      if (fuelEntriesResult.success) setFuelEntries(fuelEntriesResult.data);
      if (weighmentsResult.success) setWeighments(weighmentsResult.data);
      if (bulkCollectionsResult.success) setBulkCollections(bulkCollectionsResult.data);
      if (coverageRecordsResult.success) setCoverageRecords(coverageRecordsResult.data);
      if (attendanceRecordsResult.success) setAttendanceRecords(attendanceRecordsResult.data);
      if (complaintsResult.success) setComplaints(complaintsResult.data);
      if (zonesResult.success) setZones(zonesResult.data);
      if (wardsResult.success) setWards(wardsResult.data);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Provide a way to refresh data
  const refreshData = () => {
    fetchData();
  };

  return (
    <DataContext.Provider
      value={{
        customers,
        userCharges,
        fuelEntries,
        weighments,
        bulkCollections,
        coverageRecords,
        attendanceRecords,
        complaints,
        zones,
        wards,
        loading,
        error,
        refreshData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Create a custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;