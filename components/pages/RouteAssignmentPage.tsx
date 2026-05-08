import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Truck, Navigation, Search, Filter, Save, CheckCircle2, 
    AlertCircle, RefreshCw, Map as MapIcon, ChevronRight,
    LayoutGrid, List, Info, X
} from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { getAllAdminData, updateAdminData } from '../../services/databaseService';
import { useData } from '../../services/DataContext';

interface Vehicle {
    id: string;
    imei: string;
    name: string;
    plateNumber: string;
    type: string;
    zone: string;
    ward: string;
    assignedRouteId?: string;
    assignedRouteName?: string;
}

interface Route {
    id: string;
    name: string;
    zone: string;
    ward: string;
}

const RouteAssignmentPage = () => {
    const { zones, wards } = useData();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedZone, setSelectedZone] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [vehiclesRes, routesRes] = await Promise.all([
                getAllAdminData('vehicles'),
                getAllAdminData('ward_routes')
            ]);

            if (vehiclesRes.success) setVehicles(vehiclesRes.data as Vehicle[]);
            if (routesRes.success) setRoutes(routesRes.data as Route[]);
        } catch (error) {
            console.error('Error fetching assignment data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (vehicleId: string, routeId: string) => {
        setSavingId(vehicleId);
        setStatus(null);

        const route = routes.find(r => r.id === routeId);
        const assignmentData = {
            assignedRouteId: routeId || null,
            assignedRouteName: route ? route.name : null
        };

        try {
            const result = await updateAdminData('vehicles', vehicleId, assignmentData);
            if (result.success) {
                setVehicles(prev => prev.map(v => 
                    v.id === vehicleId ? { ...v, ...assignmentData } : v
                ));
                setStatus({ type: 'success', message: 'Assignment updated successfully' });
            } else {
                setStatus({ type: 'error', message: 'Failed to update assignment' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Error saving assignment' });
        } finally {
            setSavingId(null);
        }
    };

    const filteredVehicles = vehicles.filter(v => {
        const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             v.imei.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (v.plateNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesZone = !selectedZone || v.zone === selectedZone;
        const matchesWard = !selectedWard || v.ward === selectedWard;
        return matchesSearch && matchesZone && matchesWard;
    });

    const getAvailableRoutes = (zone: string, ward: string) => {
        return routes.filter(r => r.zone === zone && r.ward === ward);
    };

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <PageHeader 
                title="Route Assignment" 
                description="Map vehicles to their designated municipal collection routes"
            />

            {/* Filters Bar */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 space-y-2 w-full">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Search Fleet</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Search by Name, IMEI, or Plate..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="w-full md:w-56 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Filter Zone</label>
                    <select 
                        value={selectedZone}
                        onChange={(e) => {
                            setSelectedZone(e.target.value);
                            setSelectedWard('');
                        }}
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none appearance-none"
                    >
                        <option value="">All Zones</option>
                        {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                    </select>
                </div>

                <div className="w-full md:w-56 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Filter Ward</label>
                    <select 
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        disabled={!selectedZone}
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none appearance-none disabled:opacity-50"
                    >
                        <option value="">All Wards</option>
                        {wards.filter(w => w.zoneName === selectedZone).map(w => (
                            <option key={w.id} value={w.name}>{w.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex bg-gray-50 dark:bg-gray-900 p-1 rounded-2xl">
                    <button 
                        onClick={() => setViewMode('table')}
                        className={`p-3 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-gray-800 text-emerald-500 shadow-sm' : 'text-gray-400'}`}
                    >
                        <List size={20} />
                    </button>
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 text-emerald-500 shadow-sm' : 'text-gray-400'}`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-4">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                        Showing {filteredVehicles.length} Vehicles
                    </p>
                    <AnimatePresence>
                        {status && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}
                            >
                                {status.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                {status.message}
                                <button onClick={() => setStatus(null)} className="ml-2 hover:opacity-70"><X size={12} /></button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-48 bg-white dark:bg-gray-800 rounded-3xl animate-pulse border border-gray-100 dark:border-gray-700"></div>
                        ))}
                    </div>
                ) : filteredVehicles.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-20 text-center border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto text-gray-300 mb-6">
                            <Truck size={40} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">No Vehicles Found</h3>
                        <p className="text-gray-400 mt-2 font-medium">Try adjusting your filters or search terms</p>
                    </div>
                ) : viewMode === 'table' ? (
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vehicle Details</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Route Assignment</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                    {filteredVehicles.map((vehicle) => {
                                        const availableRoutes = getAvailableRoutes(vehicle.zone, vehicle.ward);
                                        return (
                                            <tr key={vehicle.id} className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-all">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-50 dark:border-emerald-900/20">
                                                            <Truck size={24} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{vehicle.name}</h4>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">IMEI: {vehicle.imei}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="space-y-1">
                                                        <span className="text-xs font-black text-gray-700 dark:text-gray-300 block">{vehicle.zone}</span>
                                                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block">{vehicle.ward}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 min-w-[300px]">
                                                    <div className="flex items-center gap-3">
                                                        <select 
                                                            value={vehicle.assignedRouteId || ''}
                                                            onChange={(e) => handleAssign(vehicle.id, e.target.value)}
                                                            disabled={savingId === vehicle.id}
                                                            className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all disabled:opacity-50 appearance-none cursor-pointer"
                                                        >
                                                            <option value="">Unassigned</option>
                                                            {availableRoutes.map(r => (
                                                                <option key={r.id} value={r.id}>{r.name}</option>
                                                            ))}
                                                        </select>
                                                        {savingId === vehicle.id && <RefreshCw className="animate-spin text-emerald-500" size={16} />}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    {vehicle.assignedRouteId ? (
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/20">
                                                                Assigned
                                                            </span>
                                                            <span className="text-[9px] font-bold text-gray-400 uppercase max-w-[120px] truncate">
                                                                {vehicle.assignedRouteName}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[9px] font-black text-gray-400 bg-gray-50 dark:bg-gray-900 px-2.5 py-1 rounded-full uppercase tracking-widest border border-gray-100 dark:border-gray-700">
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVehicles.map((vehicle) => {
                            const availableRoutes = getAvailableRoutes(vehicle.zone, vehicle.ward);
                            const isAssigned = !!vehicle.assignedRouteId;

                            return (
                                <motion.div 
                                    layout
                                    key={vehicle.id}
                                    className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all relative group"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isAssigned ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-100 dark:bg-gray-900 text-gray-400'}`}>
                                            <Truck size={28} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">IMEI</p>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">{vehicle.imei}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">{vehicle.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">{vehicle.zone}</span>
                                                <ChevronRight size={10} className="text-gray-300" />
                                                <span className="text-[10px] font-black text-blue-500 uppercase">{vehicle.ward}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-50 dark:border-gray-700 space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Assign Route</label>
                                            <div className="relative">
                                                <select 
                                                    value={vehicle.assignedRouteId || ''}
                                                    onChange={(e) => handleAssign(vehicle.id, e.target.value)}
                                                    disabled={savingId === vehicle.id}
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all disabled:opacity-50 appearance-none cursor-pointer"
                                                >
                                                    <option value="">Unassigned</option>
                                                    {availableRoutes.map(r => (
                                                        <option key={r.id} value={r.id}>{r.name}</option>
                                                    ))}
                                                </select>
                                                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                {savingId === vehicle.id && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        <RefreshCw className="animate-spin text-emerald-500" size={14} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {isAssigned && (
                                        <div className="mt-6 p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20">
                                            <div className="flex items-center gap-2 mb-1">
                                                <MapIcon size={12} className="text-emerald-500" />
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Route</span>
                                            </div>
                                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
                                                {vehicle.assignedRouteName}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RouteAssignmentPage;
