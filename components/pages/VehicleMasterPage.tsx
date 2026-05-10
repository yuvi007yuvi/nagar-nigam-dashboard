import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Plus, Search, Edit2, Trash2, X, Check, Filter, Info, Smartphone, User, MapPin, LayoutGrid, List, Download, Upload, CopyCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../shared/PageHeader';
import { createAdminData, getAllAdminData, updateAdminData, deleteAdminData } from '../../services/databaseService';
import { useLiveTracking } from '../../services/vehicleService';
import { useData } from '../../services/DataContext';

interface Vehicle {
    id: string;
    imei: string;
    name: string;
    plateNumber: string;
    type: string;
    driverName: string;
    driverPhone: string;
    zone: string;
    ward: string;
    status: 'Active' | 'Maintenance' | 'Inactive';
    assignedRouteId?: string;
    isTrackingEnabled: boolean;
    isHistoryLoggingEnabled: boolean;
}

const VehicleMasterPage = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showUnknownModal, setShowUnknownModal] = useState(false);
    const [isAddingAll, setIsAddingAll] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);
    const [duplicateGroups, setDuplicateGroups] = useState<{ type: string, value: string, items: Vehicle[] }[]>([]);
    const [isCleaningUp, setIsCleaningUp] = useState(false);
    const navigate = useNavigate();
    const { zones: dynamicZones, wards: dynamicWards } = useData();

    const [formData, setFormData] = useState({
        imei: '',
        name: '',
        plateNumber: '',
        type: 'Compactor',
        driverName: '',
        driverPhone: '',
        zone: 'Zone 1',
        ward: 'Ward 01',
        status: 'Active' as const,
        assignedRouteId: '',
        isTrackingEnabled: true,
        isHistoryLoggingEnabled: true
    });

    const vehicleTypes = ['Compactor', 'Tipper', 'JCB', 'Magic', 'Tractor', 'E-Rickshaw'];
    const zones = dynamicZones.map(z => z.name);
    const wards = dynamicWards.map(w => w.name);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        setLoading(true);
        const result = await getAllAdminData('vehicles');
        if (result.success) {
            setVehicles(result.data as Vehicle[]);
        }
        setLoading(false);
    };

    const handleOpenModal = (vehicle?: Vehicle) => {
        if (vehicle) {
            setEditingVehicle(vehicle);
            setFormData({
                imei: vehicle.imei,
                name: vehicle.name,
                plateNumber: vehicle.plateNumber,
                type: vehicle.type,
                driverName: vehicle.driverName,
                driverPhone: vehicle.driverPhone,
                zone: vehicle.zone,
                ward: vehicle.ward,
                status: vehicle.status,
                assignedRouteId: vehicle.assignedRouteId || '',
                isTrackingEnabled: vehicle.isTrackingEnabled ?? true,
                isHistoryLoggingEnabled: vehicle.isHistoryLoggingEnabled ?? true
            });
        } else {
            setEditingVehicle(null);
            setFormData({
                imei: '',
                name: '',
                plateNumber: '',
                type: 'Compactor',
                driverName: '',
                driverPhone: '',
                zone: 'Zone 1',
                ward: 'Ward 01',
                status: 'Active',
                assignedRouteId: '',
                isTrackingEnabled: true,
                isHistoryLoggingEnabled: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        if (editingVehicle) {
            const result = await updateAdminData('vehicles', editingVehicle.id, formData);
            if (result.success) {
                await fetchVehicles();
                setShowModal(false);
            }
        } else {
            const result = await createAdminData('vehicles', formData);
            if (result.success) {
                await fetchVehicles();
                setShowModal(false);
            }
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            const result = await deleteAdminData('vehicles', id);
            if (result.success) {
                fetchVehicles();
            }
        }
    };

    const { vehicles: liveVehicles } = useLiveTracking();

    const filteredVehicles = vehicles.filter(v => 
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.imei.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.driverName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Find vehicles in live tracking that are NOT in the master list
    const masterImeis = new Set(vehicles.map(v => v.imei));
    const unknownVehicles = liveVehicles.filter(v => !masterImeis.has(v.imei));

    const handleQuickAdd = (imei: string, name: string) => {
        setEditingVehicle(null);
        setFormData({
            imei: imei,
            name: name,
            plateNumber: '',
            type: 'Compactor',
            driverName: '',
            driverPhone: '',
            zone: 'Zone 1',
            ward: 'Ward 01',
            status: 'Active',
            assignedRouteId: '',
            isTrackingEnabled: true,
            isHistoryLoggingEnabled: true
        });
        setShowUnknownModal(false);
        setShowModal(true);
    };

    const handleAddAll = async () => {
        if (!window.confirm(`Are you sure you want to register all ${unknownVehicles.length} vehicles?`)) return;
        
        setIsAddingAll(true);
        try {
            for (const v of unknownVehicles) {
                await createAdminData('vehicles', {
                    imei: v.imei,
                    name: v.name || `Vehicle ${v.imei.slice(-4)}`,
                    plateNumber: '',
                    type: 'Compactor',
                    driverName: '',
                    driverPhone: '',
                    zone: 'Zone 1',
                    ward: 'Ward 01',
                    status: 'Active',
                    assignedRouteId: '',
                    isTrackingEnabled: true,
                    isHistoryLoggingEnabled: true
                });
            }
            await fetchVehicles();
            setShowUnknownModal(false);
        } catch (error) {
            console.error('Error adding all vehicles:', error);
        }
        setIsAddingAll(false);
    };
    const handleFindDuplicates = () => {
        const imeiGroups: { [key: string]: Vehicle[] } = {};
        const plateGroups: { [key: string]: Vehicle[] } = {};
        const nameGroups: { [key: string]: Vehicle[] } = {};

        vehicles.forEach(v => {
            if (v.imei) {
                const key = v.imei.trim();
                if (!imeiGroups[key]) imeiGroups[key] = [];
                imeiGroups[key].push(v);
            }
            if (v.plateNumber && v.plateNumber.trim() && v.plateNumber !== 'N/A') {
                const key = v.plateNumber.trim().toUpperCase();
                if (!plateGroups[key]) plateGroups[key] = [];
                plateGroups[key].push(v);
            }
            if (v.name && v.name.trim()) {
                const key = v.name.trim().toUpperCase();
                if (!nameGroups[key]) nameGroups[key] = [];
                nameGroups[key].push(v);
            }
        });

        const groups: { type: string, value: string, items: Vehicle[] }[] = [];
        
        // Helper to avoid redundant groups if they contain the same set of IDs
        const seenDocIdSets = new Set<string>();

        const addGroup = (type: string, value: string, items: Vehicle[]) => {
            if (items.length > 1) {
                // Sort items to keep the "best" one at index 0
                // Criteria: has IMEI, then has more fields filled
                const sortedItems = [...items].sort((a, b) => {
                    if (a.imei && !b.imei) return -1;
                    if (!a.imei && b.imei) return 1;
                    
                    // Count non-empty fields for secondary sorting
                    const aCount = Object.values(a).filter(v => v !== null && v !== undefined && v !== '').length;
                    const bCount = Object.values(b).filter(v => v !== null && v !== undefined && v !== '').length;
                    
                    return bCount - aCount;
                });

                const idSet = sortedItems.map(i => i.id).sort().join(',');
                if (!seenDocIdSets.has(idSet)) {
                    groups.push({ type, value, items: sortedItems });
                    seenDocIdSets.add(idSet);
                }
            }
        };

        Object.entries(imeiGroups).forEach(([val, items]) => addGroup('IMEI', val, items));
        Object.entries(plateGroups).forEach(([val, items]) => addGroup('Plate', val, items));
        Object.entries(nameGroups).forEach(([val, items]) => addGroup('Name', val, items));

        setDuplicateGroups(groups);
        setShowDuplicatesModal(true);
    };

    const handleRemoveDuplicates = async (groupIdxs: number[]) => {
        if (!window.confirm(`Are you sure you want to remove duplicates from ${groupIdxs.length} groups? This will keep one vehicle per group and delete the rest.`)) return;
        
        setIsCleaningUp(true);
        try {
            const toDelete = new Set<string>();
            groupIdxs.forEach(idx => {
                const group = duplicateGroups[idx];
                // Keep the first one, delete others
                group.items.slice(1).forEach(item => toDelete.add(item.id));
            });

            for (const id of Array.from(toDelete)) {
                await deleteAdminData('vehicles', id);
            }
            
            await fetchVehicles();
            setShowDuplicatesModal(false);
            alert(`Successfully removed ${toDelete.size} duplicate documents.`);
        } catch (error) {
            console.error('Error cleaning duplicates:', error);
            alert('Failed to remove some duplicates.');
        }
        setIsCleaningUp(false);
    };

    const handleExportCSV = () => {
        const headers = ['S.No', 'Vehicle Name', 'Type', 'IMEI', 'Plate Number', 'Driver', 'Phone', 'Zone', 'Ward', 'Status'];
        const rows = filteredVehicles.map((v, index) => [
            index + 1,
            v.name,
            v.type,
            v.imei,
            v.plateNumber || 'N/A',
            v.driverName || 'N/A',
            v.driverPhone || 'N/A',
            v.zone,
            v.ward,
            v.status
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `vehicle_master_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Vehicle Master" 
                description="Manage your fleet, driver assignments and tracking devices"
            />

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, IMEI or plate..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none text-sm"
                    />
                </div>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl mr-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 text-orange-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Grid View"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-gray-800 text-orange-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            title="Table View"
                        >
                            <List size={18} />
                        </button>
                    </div>

                    {unknownVehicles.length > 0 && (
                        <button
                            onClick={() => setShowUnknownModal(true)}
                            className="flex-1 md:flex-none px-4 py-2 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-orange-200 dark:border-orange-500/30 animate-pulse"
                        >
                            <Info size={18} />
                            Unknown Devices ({unknownVehicles.length})
                        </button>
                    )}
                    <button
                        onClick={handleExportCSV}
                        className="flex-1 md:flex-none px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100"
                        title="Export to CSV"
                    >
                        <Download size={18} />
                        Export
                    </button>
                    <button
                        onClick={() => navigate('/bulk-vehicle-upload')}
                        className="flex-1 md:flex-none px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-blue-100 dark:border-blue-500/20 hover:bg-blue-100"
                    >
                        <Upload size={18} />
                        Bulk Assign
                    </button>
                    <button
                        onClick={handleFindDuplicates}
                        className="flex-1 md:flex-none px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-red-100 dark:border-red-500/20 hover:bg-red-100"
                        title="Check for duplicate entries"
                    >
                        <CopyCheck size={18} />
                        Duplicates
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex-1 md:flex-none px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                    >
                        <Plus size={18} />
                        Add Vehicle
                    </button>
                </div>
            </div>

            {/* Vehicle Grid/Table */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 animate-pulse">
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : filteredVehicles.length > 0 ? (
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredVehicles.map((vehicle) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        key={vehicle.id}
                                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all group relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                vehicle.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 
                                                vehicle.status === 'Maintenance' ? 'bg-orange-100 text-orange-600' : 
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                                <Truck size={24} />
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleOpenModal(vehicle)}
                                                    className="p-2 hover:bg-blue-50 hover:text-blue-600 text-gray-400 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(vehicle.id)}
                                                    className="p-2 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 text-lg">
                                                    {vehicle.name}
                                                    <span className="text-xs font-normal px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-full">
                                                        {vehicle.type}
                                                    </span>
                                                </h3>
                                                <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                                                    <Smartphone size={12} />
                                                    IMEI: {vehicle.imei}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Driver</p>
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                                        <User size={12} className="text-orange-500" />
                                                        {vehicle.driverName || 'Not Assigned'}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Plate No.</p>
                                                    <p className="text-sm font-black text-gray-700 dark:text-gray-300">
                                                        {vehicle.plateNumber || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="pt-2 flex items-center justify-between border-t border-gray-50 dark:border-gray-700">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                                                        <MapPin size={12} className="text-blue-500" />
                                                        {vehicle.zone} • {vehicle.ward}
                                                    </div>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${vehicle.isTrackingEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                                            GPS {vehicle.isTrackingEnabled ? 'ON' : 'OFF'}
                                                        </span>
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${vehicle.isHistoryLoggingEnabled ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                                                            History {vehicle.isHistoryLoggingEnabled ? 'ON' : 'OFF'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest ${
                                                    vehicle.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 
                                                    vehicle.status === 'Maintenance' ? 'bg-orange-50 text-orange-600' : 
                                                    'bg-gray-50 text-gray-500'
                                                }`}>
                                                    {vehicle.status}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                            >
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900/50 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                <th className="px-6 py-4 w-16">#</th>
                                                <th className="px-6 py-4">Vehicle Details</th>
                                                <th className="px-6 py-4">IMEI / Plate</th>
                                                <th className="px-6 py-4">Driver info</th>
                                                <th className="px-6 py-4">Location</th>
                                                <th className="px-6 py-4">Features</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                            {filteredVehicles.map((vehicle, index) => (
                                                <tr key={vehicle.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-bold text-gray-400">{(index + 1).toString().padStart(2, '0')}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                                vehicle.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 
                                                                vehicle.status === 'Maintenance' ? 'bg-orange-100 text-orange-600' : 
                                                                'bg-gray-100 text-gray-600'
                                                            }`}>
                                                                <Truck size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-800 dark:text-white text-sm">{vehicle.name}</p>
                                                                <p className="text-[10px] text-gray-400 font-medium">{vehicle.type}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">IMEI: {vehicle.imei}</p>
                                                            <p className="text-[10px] font-black text-gray-400">{vehicle.plateNumber || 'NO PLATE'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{vehicle.driverName || 'Not Assigned'}</p>
                                                            <p className="text-[10px] text-gray-400">{vehicle.driverPhone || 'No contact'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1">
                                                            <p className="text-xs text-gray-700 dark:text-gray-300">{vehicle.zone}</p>
                                                            <p className="text-[10px] text-blue-500 font-bold">{vehicle.ward}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2">
                                                            <span className={`w-2 h-2 rounded-full ${vehicle.isTrackingEnabled ? 'bg-blue-500' : 'bg-gray-300'}`} title="Live Tracking"></span>
                                                            <span className={`w-2 h-2 rounded-full ${vehicle.isHistoryLoggingEnabled ? 'bg-purple-500' : 'bg-gray-300'}`} title="History Logging"></span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest ${
                                                            vehicle.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 
                                                            vehicle.status === 'Maintenance' ? 'bg-orange-50 text-orange-600' : 
                                                            'bg-gray-50 text-gray-500'
                                                        }`}>
                                                            {vehicle.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => handleOpenModal(vehicle)}
                                                                className="p-2 hover:bg-blue-50 hover:text-blue-600 text-gray-400 rounded-lg transition-colors"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(vehicle.id)}
                                                                className="p-2 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )
                    ) : (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                <Truck size={40} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">No vehicles found</h3>
                                <p className="text-gray-400">Add your first vehicle to start tracking</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Unknown Devices Modal */}
            <AnimatePresence>
                {showUnknownModal && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-orange-500 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                        <Info size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Unknown Devices Detected</h3>
                                        <p className="text-xs text-white/80">{unknownVehicles.length} devices found in live stream</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowUnknownModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50 dark:bg-gray-900/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {unknownVehicles.map((v) => (
                                        <div key={v.imei} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex justify-between items-center group">
                                            <div>
                                                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">IMEI: {v.imei}</p>
                                                <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mt-1">{v.name || 'Unnamed Device'}</p>
                                            </div>
                                            <button
                                                onClick={() => handleQuickAdd(v.imei, v.name)}
                                                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-orange-500 hover:text-white transition-all flex items-center gap-2"
                                            >
                                                <Plus size={14} />
                                                Register
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
                                <p className="text-sm text-gray-400">
                                    Registering will add these to your master list with default settings.
                                </p>
                                <button
                                    onClick={handleAddAll}
                                    disabled={isAddingAll}
                                    className="px-8 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50"
                                >
                                    {isAddingAll ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Check size={20} />
                                    )}
                                    Add All ({unknownVehicles.length})
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Duplicates Modal */}
            <AnimatePresence>
                {showDuplicatesModal && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-red-600 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                        <CopyCheck size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Duplicate Analysis</h3>
                                        <p className="text-xs text-white/80">Found {duplicateGroups.length} groups of potential duplicates</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowDuplicatesModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50 dark:bg-gray-900/50">
                                {duplicateGroups.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Check size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">No Duplicates Found</h3>
                                        <p className="text-gray-400">Your vehicle master list is clean!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-4 rounded-2xl flex gap-3 items-start">
                                            <Info className="text-amber-600 shrink-0 mt-0.5" size={18} />
                                            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                                                The following vehicles share the same IMEI, Plate Number, or Name. 
                                                Cleaning up will <strong>keep the first record</strong> in each group and permanently delete the others.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {duplicateGroups.map((group, gIdx) => (
                                                <div key={gIdx} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                            Matching {group.type}: <span className="text-red-500">{group.value}</span>
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                                            {group.items.length} Entries
                                                        </span>
                                                    </div>
                                                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                                                        {group.items.map((item, iIdx) => (
                                                            <div key={item.id} className={`p-4 flex items-center justify-between ${iIdx === 0 ? 'bg-emerald-50/30 dark:bg-emerald-500/5' : ''}`}>
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iIdx === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                                                        {iIdx === 0 ? <Check size={16} /> : <Trash2 size={16} />}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{item.name}</p>
                                                                        <p className="text-[10px] text-gray-400">{item.type} • {item.zone} • {item.ward}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    {iIdx === 0 ? (
                                                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Keeping</span>
                                                                    ) : (
                                                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Redundant</span>
                                                                    )}
                                                                    <p className="text-[9px] text-gray-300 font-mono mt-1">{item.id}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
                                <button
                                    onClick={() => setShowDuplicatesModal(false)}
                                    className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                                {duplicateGroups.length > 0 && (
                                    <button
                                        onClick={() => handleRemoveDuplicates(duplicateGroups.map((_, i) => i))}
                                        disabled={isCleaningUp}
                                        className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50"
                                    >
                                        {isCleaningUp ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <Trash2 size={20} />
                                        )}
                                        Remove All Duplicates
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal */}

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-orange-500 text-white">
                                <h3 className="text-xl font-bold">{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">IMEI Number (Device ID)</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.imei}
                                            onChange={(e) => setFormData({...formData, imei: e.target.value})}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all border-none"
                                            placeholder="Enter 15-digit IMEI"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vehicle Name / Number</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all border-none"
                                            placeholder="e.g. Compactor 01"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Plate Number</label>
                                        <input
                                            type="text"
                                            value={formData.plateNumber}
                                            onChange={(e) => setFormData({...formData, plateNumber: e.target.value})}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all border-none"
                                            placeholder="UP 85 XX 0000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vehicle Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all border-none cursor-pointer"
                                        >
                                            {vehicleTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Driver Name</label>
                                        <input
                                            type="text"
                                            value={formData.driverName}
                                            onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all border-none"
                                            placeholder="Enter driver name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Driver Phone</label>
                                        <input
                                            type="text"
                                            value={formData.driverPhone}
                                            onChange={(e) => setFormData({...formData, driverPhone: e.target.value})}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all border-none"
                                            placeholder="10-digit mobile number"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned Zone</label>
                                        <select
                                            value={formData.zone}
                                            onChange={(e) => setFormData({...formData, zone: e.target.value, ward: ''})}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all border-none cursor-pointer"
                                        >
                                            <option value="">Select Zone</option>
                                            {zones.map(z => <option key={z} value={z}>{z}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned Ward</label>
                                        <select
                                            value={formData.ward}
                                            onChange={(e) => setFormData({...formData, ward: e.target.value})}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all border-none cursor-pointer"
                                            disabled={!formData.zone}
                                        >
                                            <option value="">Select Ward</option>
                                            {dynamicWards
                                                .filter(w => w.zoneName === formData.zone)
                                                .map(w => <option key={w.id} value={w.name}>{w.name}</option>)
                                            }
                                        </select>
                                    </div>
                                    <div className="col-span-full space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned Route ID(s)</label>
                                        <input
                                            type="text"
                                            value={formData.assignedRouteId}
                                            onChange={(e) => setFormData({...formData, assignedRouteId: e.target.value})}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all border-none font-bold"
                                            placeholder="e.g. W24R1; W24R2 (Use semicolon for multiple)"
                                        />
                                        <p className="text-[10px] text-gray-400 italic">For multiple routes, separate them with a semicolon (e.g., R1; R2)</p>
                                    </div>
                                    <div className="col-span-full grid grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Enable Live Tracking</p>
                                                <p className="text-xs text-gray-400">Show vehicle on live map</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.isTrackingEnabled}
                                                    onChange={(e) => setFormData({...formData, isTrackingEnabled: e.target.checked})}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Store History Data</p>
                                                <p className="text-xs text-gray-400">Log movements for reports</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.isHistoryLoggingEnabled}
                                                    onChange={(e) => setFormData({...formData, isHistoryLoggingEnabled: e.target.checked})}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-4 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSaving ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <Check size={20} />
                                        )}
                                        {editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VehicleMasterPage;
