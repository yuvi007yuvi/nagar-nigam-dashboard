import { jsx as _jsx } from "react/jsx-runtime";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAllCustomers, getAllUserCharges, getAllFuelEntries, getAllWeighments, getAllBulkCollections, getAllCoverageRecords, getAllAttendanceRecords, getAllComplaints, getAllAdminData } from './databaseService';
// Create context with default values
const DataContext = createContext({
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
    refreshData: () => { }
});
// Create a provider component
export const DataProvider = ({ children }) => {
    const [customers, setCustomers] = useState([]);
    const [userCharges, setUserCharges] = useState([]);
    const [fuelEntries, setFuelEntries] = useState([]);
    const [weighments, setWeighments] = useState([]);
    const [bulkCollections, setBulkCollections] = useState([]);
    const [coverageRecords, setCoverageRecords] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [zones, setZones] = useState([]);
    const [wards, setWards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch all data in parallel
            const [customersResult, userChargesResult, fuelEntriesResult, weighmentsResult, bulkCollectionsResult, coverageRecordsResult, attendanceRecordsResult, complaintsResult, zonesResult, wardsResult] = await Promise.all([
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
            // Update state with fetched data
            if (customersResult.success)
                setCustomers(customersResult.data);
            if (userChargesResult.success)
                setUserCharges(userChargesResult.data);
            if (fuelEntriesResult.success)
                setFuelEntries(fuelEntriesResult.data);
            if (weighmentsResult.success)
                setWeighments(weighmentsResult.data);
            if (bulkCollectionsResult.success)
                setBulkCollections(bulkCollectionsResult.data);
            if (coverageRecordsResult.success)
                setCoverageRecords(coverageRecordsResult.data);
            if (attendanceRecordsResult.success)
                setAttendanceRecords(attendanceRecordsResult.data);
            if (complaintsResult.success)
                setComplaints(complaintsResult.data);
            if (zonesResult.success)
                setZones(zonesResult.data);
            if (wardsResult.success)
                setWards(wardsResult.data);
        }
        catch (err) {
            setError('Failed to load data');
            console.error('Error fetching data:', err);
        }
        finally {
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
    return (_jsx(DataContext.Provider, { value: {
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
        }, children: children }));
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
