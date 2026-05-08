import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    Download, 
    Search, 
    QrCode, 
    Edit, 
    X, 
    Filter, 
    Calendar,
    Save,
    RotateCcw,
    MapPin
} from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { useData } from '../../services/DataContext';
import { createBulkCollectionSite, getAllBulkCollectionSites } from '../../services/databaseService';

interface Site {
    id: string;
    qrId: string;
    siteName: string;
    zone: string;
    ward: string;
    type: string;
    latitude: string;
    longitude: string;
    createdAt: any;
    buildingStreet?: string;
    status?: 'Active' | 'Disabled';
}

const QRDataPage = () => {
    const { zones, wards } = useData();
    const [sites, setSites] = useState<Site[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [qrModalSite, setQrModalSite] = useState<Site | null>(null);
    const [editingSite, setEditingSite] = useState<Site | null>(null);
    
    // Form State
    const [formData, setFormData] = useState({
        zone: '',
        ward: '',
        siteName: '',
        buildingStreet: '',
        latitude: '',
        longitude: '',
        type: 'Dustbin'
    });

    // Filter State
    const [filters, setFilters] = useState({
        zone: '',
        ward: '',
        type: '',
        date: ''
    });

    useEffect(() => {
        fetchSites();
    }, []);

    const fetchSites = async () => {
        setLoading(true);
        try {
            const result = await getAllBulkCollectionSites();
            if (result.success) {
                setSites(result.data);
            }
        } catch (error) {
            console.error("Error fetching sites:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSites = sites.filter(site => {
        const matchesSearch = 
            site.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            site.qrId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesZone = !filters.zone || site.zone === filters.zone;
        const matchesWard = !filters.ward || site.ward === filters.ward;
        const matchesType = !filters.type || site.type === filters.type;
        
        return matchesSearch && matchesZone && matchesWard && matchesType;
    });

    const handleSave = async () => {
        try {
            const { updateAdminData } = await import('../../services/databaseService');
            
            if (editingSite) {
                const result = await updateAdminData('bulk_collection_sites', editingSite.id, formData);
                if (result.success) {
                    setEditingSite(null);
                    setShowAddModal(false);
                    fetchSites();
                }
            } else {
                // Generate a QR ID like MVNNDG91 (mock logic)
                const prefix = formData.type === 'Dustbin' ? 'MVNNDB' : 'MVNNDG';
                const qrId = `${prefix}${Math.floor(Math.random() * 1000)}`;
                
                const result = await createBulkCollectionSite({
                    ...formData,
                    qrId,
                    createdAt: new Date().toISOString(),
                    status: 'Active'
                });

                if (result.success) {
                    setShowAddModal(false);
                    setFormData({
                        zone: '',
                        ward: '',
                        siteName: '',
                        buildingStreet: '',
                        latitude: '',
                        longitude: '',
                        type: 'Dustbin'
                    });
                    fetchSites();
                }
            }
        } catch (error) {
            console.error("Error saving site:", error);
        }
    };

    const handleEdit = (site: Site) => {
        setEditingSite(site);
        setFormData({
            zone: site.zone,
            ward: site.ward,
            siteName: site.siteName,
            buildingStreet: site.buildingStreet || '',
            latitude: site.latitude,
            longitude: site.longitude,
            type: site.type
        });
        setShowAddModal(true);
    };

    const handleExport = () => {
        const headers = ['QR Code ID', 'Site Name', 'Zone', 'Ward', 'Type', 'Latitude', 'Longitude', 'Date'];
        const csvContent = [
            headers.join(','),
            ...sites.map(site => {
                const date = site.createdAt?.toDate ? site.createdAt.toDate() : new Date(site.createdAt);
                const dateStr = !isNaN(date.getTime()) ? date.toLocaleDateString() : 'N/A';
                return [
                    site.qrId,
                    site.siteName,
                    site.zone,
                    site.ward,
                    site.type,
                    site.latitude,
                    site.longitude,
                    dateStr,
                    site.status || 'Active'
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `QR_Data_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <PageHeader 
                title="QR Data" 
                description="Manage bulk collection sites and QR code registration"
            />
            {/* Top Stats & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Rows : <span className="font-bold text-gray-900 dark:text-white">{filteredSites.length}</span>
                </h2>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Search by Site or QR ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm w-64 outline-none focus:ring-2 focus:ring-[#27ae60]/20"
                        />
                    </div>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#27ae60] hover:bg-[#219150] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        Add Entry
                    </button>
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-[#27ae60] hover:bg-[#219150] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-[#f8fff9] dark:bg-gray-800/50 p-4 rounded-xl border border-[#e0f2e1] dark:border-gray-700 flex flex-wrap gap-4 items-center">
                <select 
                    value={filters.zone}
                    onChange={(e) => setFilters({...filters, zone: e.target.value, ward: ''})}
                    className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm min-w-[150px] outline-none focus:ring-2 focus:ring-[#27ae60]/20"
                >
                    <option value="">All Zones</option>
                    {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                </select>
                <select 
                    value={filters.ward}
                    onChange={(e) => setFilters({...filters, ward: e.target.value})}
                    className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm min-w-[150px] outline-none focus:ring-2 focus:ring-[#27ae60]/20"
                    disabled={!filters.zone}
                >
                    <option value="">All Wards</option>
                    {wards
                        .filter(w => w.zoneName === filters.zone)
                        .map(w => <option key={w.id} value={w.name}>{w.name}</option>)
                    }
                </select>
                <select 
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                    className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm min-w-[150px] outline-none focus:ring-2 focus:ring-[#27ae60]/20"
                >
                    <option value="">All Types</option>
                    <option value="Dustbin">Dustbin</option>
                    <option value="Dhalao Ghar">Dhalao Ghar</option>
                    <option value="Open Point">Open Point</option>
                </select>
                <button 
                    onClick={() => setFilters({ zone: '', ward: '', type: '', date: '' })}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors"
                >
                    <RotateCcw size={16} />
                    Reset Filters
                </button>
            </div>

            {/* Sites Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#27ae60] text-white">
                            <tr>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">QR Code ID</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">Site Name</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">Zone</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">Ward</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">Type</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">Coordinates</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider">Created At</th>
                                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider">Status</th>
                                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {Array(11).fill(0).map((_, j) => (
                                            <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-700 rounded"></div></td>
                                        ))}
                                    </tr>
                                ))
                            ) : filteredSites.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="px-4 py-12 text-center text-gray-500">No sites matching your filters</td>
                                </tr>
                            ) : (
                                filteredSites.map((site) => {
                                    const date = site.createdAt?.toDate ? site.createdAt.toDate() : new Date(site.createdAt);
                                    const isValidDate = !isNaN(date.getTime());
                                    
                                    return (
                                        <tr key={site.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-4 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">{site.qrId}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white font-medium">{site.siteName}</td>
                                            <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{site.zone}</td>
                                            <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{site.ward}</td>
                                            <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{site.type}</td>
                                            <td className="px-4 py-4 text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                <div>{site.latitude}</div>
                                                <div className="mt-1">{site.longitude}</div>
                                            </td>
                                            <td className="px-4 py-4 text-xs text-gray-500 dark:text-gray-400">
                                                {isValidDate ? (
                                                    <>
                                                        <div className="font-bold">{date.toLocaleDateString()}</div>
                                                        <div className="mt-0.5 opacity-70">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </>
                                                ) : '-'}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <button 
                                                    onClick={async () => {
                                                        const newStatus = site.status === 'Disabled' ? 'Active' : 'Disabled';
                                                        const { updateAdminData } = await import('../../services/databaseService');
                                                        await updateAdminData('bulk_collection_sites', site.id, { status: newStatus });
                                                        fetchSites();
                                                    }}
                                                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                        site.status === 'Disabled' 
                                                        ? 'bg-red-50 text-red-600 border-red-200' 
                                                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                    }`}
                                                >
                                                    {site.status || 'Active'}
                                                </button>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => setQrModalSite(site)}
                                                        className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                        title="View QR"
                                                    >
                                                        <QrCode size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEdit(site)}
                                                        className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={async () => {
                                                            if (window.confirm('Are you sure you want to delete this site?')) {
                                                                const { deleteAdminData } = await import('../../services/databaseService');
                                                                await deleteAdminData('bulk_collection_sites', site.id);
                                                                fetchSites();
                                                            }
                                                        }}
                                                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Delete Site"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Site Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                                    {editingSite ? 'Edit Site Detail' : 'Add Site Detail'}
                                </h3>
                                <button 
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingSite(null);
                                    }} 
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Zone & Circle</label>
                                    <select 
                                        value={formData.zone}
                                        onChange={(e) => setFormData({...formData, zone: e.target.value, ward: ''})}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option value="">Select Zone</option>
                                        {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Ward</label>
                                    <select 
                                        value={formData.ward}
                                        onChange={(e) => setFormData({...formData, ward: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                                        disabled={!formData.zone}
                                    >
                                        <option value="">Select Ward</option>
                                        {wards
                                            .filter(w => w.zoneName === formData.zone)
                                            .map(w => <option key={w.id} value={w.name}>{w.name}</option>)
                                        }
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Site Name</label>
                                    <input 
                                        type="text"
                                        placeholder="Enter Site Name"
                                        value={formData.siteName}
                                        onChange={(e) => setFormData({...formData, siteName: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Building / Street</label>
                                    <input 
                                        type="text"
                                        placeholder="Enter Building / Street"
                                        value={formData.buildingStreet}
                                        onChange={(e) => setFormData({...formData, buildingStreet: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Latitude</label>
                                    <input 
                                        type="text"
                                        placeholder="Enter Latitude"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Longitude</label>
                                    <input 
                                        type="text"
                                        placeholder="Enter Longitude"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Type</label>
                                    <select 
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option value="Dustbin">Dustbin</option>
                                        <option value="Dhalao Ghar">Dhalao Ghar</option>
                                        <option value="Open Point">Open Point</option>
                                    </select>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end items-center gap-3">
                                <button 
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingSite(null);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    x Close
                                </button>
                                {!editingSite && (
                                    <button 
                                        onClick={() => setFormData({
                                            zone: '',
                                            ward: '',
                                            siteName: '',
                                            buildingStreet: '',
                                            latitude: '',
                                            longitude: '',
                                            type: 'Dustbin'
                                        })}
                                        className="px-4 py-2 text-sm font-medium bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                    >
                                        Reset
                                    </button>
                                )}
                                <button 
                                    onClick={handleSave}
                                    className="px-6 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm"
                                >
                                    {editingSite ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* QR Code Modal */}
            <AnimatePresence>
                {qrModalSite && (
                    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold">Site QR Code</h3>
                                <button onClick={() => setQrModalSite(null)} className="p-1 hover:bg-gray-100 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 inline-block mb-6">
                                <QrCode size={200} className="text-gray-900" />
                            </div>

                            <div className="space-y-1 mb-8">
                                <p className="font-bold text-lg">{qrModalSite.siteName}</p>
                                <p className="text-sm text-gray-500 font-mono">{qrModalSite.qrId}</p>
                                <p className="text-xs text-gray-400">{qrModalSite.zone} - {qrModalSite.ward}</p>
                            </div>

                            <button 
                                onClick={() => window.print()}
                                className="w-full py-3 bg-[#27ae60] text-white rounded-xl font-bold hover:bg-[#219150] transition-all flex items-center justify-center gap-2"
                            >
                                <Download size={18} />
                                Print QR Code
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QRDataPage;
