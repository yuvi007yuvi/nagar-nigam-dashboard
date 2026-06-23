import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  getUserChargesByUser,
  getRecentDocuments,
  getCoverageByDate
} from './databaseService';

// Define types for our data
interface DataContextType {
  customers: any[];
  userCharges: any[];
  fuelEntries: any[];
  weighments: any[];
  bulkCollections: any[];
  bulkCollectionSites: any[];
  coverageRecords: any[];
  attendanceRecords: any[];
  complaints: any[];
  zones: any[];
  wards: any[];
  vehicles: any[];
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
  bulkCollectionSites: [],
  coverageRecords: [],
  attendanceRecords: [],
  complaints: [],
  zones: [],
  wards: [],
  vehicles: [],
  loading: false,
  error: null,
  refreshData: () => {}
});

// Create a provider component
export const DataProvider: React.FC<{ children: React.ReactNode; userId?: string; isAdmin?: boolean }> = ({ children, userId, isAdmin }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [userCharges, setUserCharges] = useState<any[]>([]);
  const [fuelEntries, setFuelEntries] = useState<any[]>([]);
  const [weighments, setWeighments] = useState<any[]>([]);
  const [bulkCollections, setBulkCollections] = useState<any[]>([]);
  const [bulkCollectionSites, setBulkCollectionSites] = useState<any[]>([]);
  const [coverageRecords, setCoverageRecords] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Define all fetchers — each resolves independently for progressive rendering
      const fetchers: { fn: () => Promise<any>; setter: (data: any[]) => void }[] = [
        { fn: (userId && !isAdmin) ? () => getCustomersByUser(userId) : getAllCustomers, setter: setCustomers },
        { fn: (userId && !isAdmin) ? () => getUserChargesByUser(userId) : getAllUserCharges, setter: setUserCharges },
        { fn: getAllFuelEntries, setter: setFuelEntries },
        { fn: getAllWeighments, setter: setWeighments },
        { fn: () => getRecentDocuments('bulkCollections', 2000), setter: setBulkCollections },
        { fn: () => getAllAdminData('bulk_collection_sites'), setter: setBulkCollectionSites },
        { fn: () => getCoverageByDate(new Date().toISOString().split('T')[0]), setter: setCoverageRecords },
        { fn: getAllAttendanceRecords, setter: setAttendanceRecords },
        { fn: getAllComplaints, setter: setComplaints },
        { fn: () => getAllAdminData('zones'), setter: setZones },
        { fn: () => getAllAdminData('wards'), setter: setWards },
        { fn: () => getAllAdminData('vehicles'), setter: setVehicles },
      ];

      // Fire all in parallel — each one updates state as soon as it resolves
      await Promise.allSettled(
        fetchers.map(async ({ fn, setter }) => {
          const result = await fn();
          if (result.success) setter(result.data);
        })
      );
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, isAdmin]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Provide a way to refresh data
  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DataContext.Provider
      value={{
        customers,
        userCharges,
        fuelEntries,
        weighments,
        bulkCollections,
        bulkCollectionSites,
        coverageRecords,
        attendanceRecords,
        complaints,
        zones,
        wards,
        vehicles,
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