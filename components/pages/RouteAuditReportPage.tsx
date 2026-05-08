import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    FileText, Download, Filter, Search, 
    RefreshCw, MapPin, Navigation, CheckCircle2, 
    AlertCircle, BarChart3, PieChart
} from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { useData } from '../../services/DataContext';
import { getAllAdminData } from '../../services/databaseService';

interface RouteAudit {
    zone: string;
    ward: string;
    routeName: string;
    routeId: string;
    poiCount: number;
    status: 'Operational' | 'No POIs' | 'Pending Mapping';
}

const RouteAuditReportPage = () => {
    const { zones, wards, customers } = useData();
    const [routes, setRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterZone, setFilterZone] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        setLoading(true);
        const res = await getAllAdminData('ward_routes');
        if (res.success) setRoutes(res.data);
        setLoading(false);
    };

    const auditData: RouteAudit[] = routes.map(route => {
        const routePois = customers.filter(c => c.routeId === route.routeId || c.routeId === route.id);
        return {
            zone: route.zone || 'Unknown',
            ward: route.ward || 'Unknown',
            routeName: route.name,
            routeId: route.routeId || route.id.substring(0, 8),
            poiCount: routePois.length,
            status: routePois.length > 0 ? 'Operational' : 'No POIs'
        };
    });

    const filteredAudit = auditData.filter(item => {
        const matchesZone = !filterZone || item.zone === filterZone;
        const matchesSearch = !searchTerm || 
            item.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.routeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.ward.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesZone && matchesSearch;
    });

    const stats = {
        totalRoutes: routes.length,
        mappedRoutes: auditData.filter(a => a.poiCount > 0).length,
        totalPois: customers.length,
        mappedPois: customers.filter(c => c.routeId).length,
    };

    const handleExport = () => {
        const headers = ['Zone', 'Ward', 'Route Name', 'Route ID', 'POI Count', 'Status'];
        const csvContent = [
            headers.join(','),
            ...filteredAudit.map(item => [
                item.zone,
                item.ward,
                `"${item.routeName}"`,
                item.routeId,
                item.poiCount,
                item.status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `Route_Audit_Report_${new Date().toLocaleDateString()}.csv`);
        link.click();
    };

    return (
        <div className="space-y-8 pb-10">
            <PageHeader 
                title="Route Audit Report" 
                description="Comprehensive analysis of route coverage and POI mapping status."
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/20"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600">
                            <Navigation size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Routes</p>
                            <h4 className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalRoutes}</h4>
                        </div>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: '100%' }}></div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/20"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mapped Routes</p>
                            <h4 className="text-2xl font-black text-gray-900 dark:text-white">{stats.mappedRoutes}</h4>
                        </div>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${(stats.mappedRoutes / stats.totalRoutes) * 100}%` }}></div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/20"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-600">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total POIs</p>
                            <h4 className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalPois}</h4>
                        </div>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: '100%' }}></div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/20"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mapped POIs</p>
                            <h4 className="text-2xl font-black text-gray-900 dark:text-white">{stats.mappedPois}</h4>
                        </div>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${(stats.mappedPois / stats.totalPois) * 100}%` }}></div>
                    </div>
                </motion.div>
            </div>

            {/* Filters & Actions */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/20 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Search report..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10"
                        />
                    </div>
                    <select 
                        value={filterZone}
                        onChange={(e) => setFilterZone(e.target.value)}
                        className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/10"
                    >
                        <option value="">All Zones</option>
                        {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                    </select>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={fetchRoutes}
                        className="p-3 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-emerald-500 rounded-2xl transition-all"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button 
                        onClick={handleExport}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <Download size={18} />
                        Export Audit (CSV)
                    </button>
                </div>
            </div>

            {/* Report Table */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-2xl shadow-gray-200/20 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-900/50">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Zone / Ward</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Route Information</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">POI Density</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Coverage Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-8 py-10 bg-gray-50/30 dark:bg-gray-800/30"></td>
                                    </tr>
                                ))
                            ) : filteredAudit.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-black uppercase tracking-widest">No matching records found</td>
                                </tr>
                            ) : (
                                filteredAudit.map((item, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-gray-900 dark:text-white uppercase">{item.zone}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.ward}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-gray-900 dark:text-white uppercase">{item.routeName}</span>
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">ID: {item.routeId}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 font-black text-sm">
                                                    {item.poiCount}
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Points Mapped</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                item.poiCount > 0 
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                                : 'bg-amber-50 text-amber-600 border border-amber-100'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default RouteAuditReportPage;
