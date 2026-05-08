import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Search, Edit2, Trash2, X, Check, Filter, 
    MapPin, LayoutGrid, List, ChevronRight, Map,
    Layers, AlertCircle
} from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { 
    createAdminData, 
    getAllAdminData, 
    updateAdminData, 
    deleteAdminData 
} from '../../services/databaseService';
import { useData } from '../../services/DataContext';

interface Zone {
    id: string;
    name: string;
    description?: string;
    createdAt?: any;
}

interface Ward {
    id: string;
    name: string;
    zoneName: string;
    description?: string;
    createdAt?: any;
}

const ZoneWardMasterPage = () => {
    const { refreshData } = useData();
    const [activeTab, setActiveTab] = useState<'zones' | 'wards'>('zones');
    const [zones, setZones] = useState<Zone[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modals
    const [showZoneModal, setShowZoneModal] = useState(false);
    const [showWardModal, setShowWardModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form States
    const [zoneForm, setZoneForm] = useState({ name: '', description: '' });
    const [wardForm, setWardForm] = useState({ name: '', zoneName: '', description: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [zonesRes, wardsRes] = await Promise.all([
            getAllAdminData('zones'),
            getAllAdminData('wards')
        ]);
        
        if (zonesRes.success) setZones(zonesRes.data as Zone[]);
        if (wardsRes.success) setWards(wardsRes.data as Ward[]);
        setLoading(false);
    };

    const handleInitializeData = async () => {
        if (!window.confirm("This will initialize the 70 default Wards and 4 Zones. Existing data will not be deleted. Continue?")) return;
        
        setIsSaving(true);
        try {
            const ZONES = ["1-CITY", "2-BHUTESHWAR", "3-AURANGABAD", "4-VRINDAVAN"];
            const WARDS = [
                "01-Birjapur", "02-Ambedkar Nagar", "03-Girdharpur", "04-Ishapur Yamunapar", "05-Bharatpur Gate",
                "06-Aduki", "07-Lohvan", "08-Atas", "09-Gandhi Nagar", "10-Aurangabad First",
                "11-Tarsi", "12-Radhe Shyam Colony", "13-Sunrakh", "14-Lakshmi Nagar Yamunapar", "15-Maholi First",
                "16-Bakalpur", "17-Bairaagpura", "18-General ganj", "19-Ramnagar Yamunapar", "20-Krishna Nagar First",
                "21-Chaitanya Bihar", "22-Badhri Nagar", "23-Aheer Pada", "24-Sarai Azamabad", "25-Chharaura",
                "26-Naya Nagla", "27-Baad", "28-Aurangabad Second", "29-Koyla Alipur", "30-Krishna Nagar Second",
                "31-Navneet Nagar", "32-Ranchibagar", "33-Palikhera", "34-Radhaniwas", "35-Bankhandi",
                "36-Jaisingh Pura", "37-Baldevpuri", "38-Civil Lines", "39-Mahavidhya Colony", "40-Rajkumar",
                "41-Dhaulipiau", "42-Manoharpur", "43-Ganeshra", "44-Radhika Bihar", "45-Birla Mandir",
                "46-Radha Nagar", "47-Dwarkapuri", "48-Satoha Asangpur", "49-Daimpiriyal Nagar", "50-Patharpura",
                "51-Gaushala Nagar", "52-Chandrapuri", "53-Krishna Puri", "54-Pratap Nagar", "55-Govind Nagar",
                "56-Mandi Randas", "57-Balajipuram", "58-Gau Ghat", "59-Maholi Second", "60-Jagannath Puri",
                "61-Chaubia Para", "62-Mathura Darwaza", "63-Maliyaan Sadar", "64-Ghati Bahalray", "65-Holi Gali",
                "66-Keshighat", "67-Kemar Van", "68-Shanti Nagar", "69-Ratan Chhatri", "70-Biharipur"
            ];

            // 1. Create Zones if they don't exist
            for (const zName of ZONES) {
                if (!zones.some(z => z.name === zName)) {
                    await createAdminData('zones', { name: zName, description: 'Default System Zone' });
                }
            }

            // 2. Create Wards if they don't exist
            for (let i = 0; i < WARDS.length; i++) {
                const wName = WARDS[i];
                if (!wards.some(w => w.name === wName)) {
                    let zName = ZONES[0]; // Default 1-CITY
                    if (i >= 20 && i < 40) zName = ZONES[1]; // 2-BHUTESHWAR
                    if (i >= 40 && i < 60) zName = ZONES[2]; // 3-AURANGABAD
                    if (i >= 60) zName = ZONES[3]; // 4-VRINDAVAN
                    
                    await createAdminData('wards', { 
                        name: wName, 
                        zoneName: zName, 
                        description: `Default Ward for ${zName}` 
                    });
                }
            }

            alert("Master Data Initialized Successfully!");
            fetchData();
            refreshData();
        } catch (error) {
            console.error("Initialization Error:", error);
            alert("Failed to initialize data.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenZoneModal = (zone?: Zone) => {
        if (zone) {
            setEditingItem(zone);
            setZoneForm({ name: zone.name, description: zone.description || '' });
        } else {
            setEditingItem(null);
            setZoneForm({ name: '', description: '' });
        }
        setShowZoneModal(true);
    };

    const handleOpenWardModal = (ward?: Ward) => {
        if (ward) {
            setEditingItem(ward);
            setWardForm({ name: ward.name, zoneName: ward.zoneName, description: ward.description || '' });
        } else {
            setEditingItem(null);
            setWardForm({ name: '', zoneName: zones[0]?.name || '', description: '' });
        }
        setShowWardModal(true);
    };

    const handleSaveZone = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingItem) {
                await updateAdminData('zones', editingItem.id, zoneForm);
            } else {
                await createAdminData('zones', zoneForm);
            }
            setShowZoneModal(false);
            fetchData();
            refreshData(); // Refresh global context
        } catch (error) {
            console.error("Error saving zone:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveWard = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingItem) {
                await updateAdminData('wards', editingItem.id, wardForm);
            } else {
                await createAdminData('wards', wardForm);
            }
            setShowWardModal(false);
            fetchData();
            refreshData(); // Refresh global context
        } catch (error) {
            console.error("Error saving ward:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (type: 'zones' | 'wards', id: string) => {
        if (window.confirm(`Are you sure you want to delete this ${type === 'zones' ? 'zone' : 'ward'}?`)) {
            await deleteAdminData(type, id);
            fetchData();
            refreshData();
        }
    };

    const filteredZones = zones.filter(z => z.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredWards = wards.filter(w => 
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        w.zoneName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 p-4">
            <PageHeader 
                title="Zone & Ward Master" 
                description="Manage municipal administrative boundaries"
            />

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                    <button 
                        onClick={() => { setActiveTab('zones'); setSearchTerm(''); }}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'zones' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Zones
                    </button>
                    <button 
                        onClick={() => { setActiveTab('wards'); setSearchTerm(''); }}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'wards' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Wards
                    </button>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500 text-sm font-medium">Loading data...</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Name</th>
                                {activeTab === 'wards' && <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Assigned Zone</th>}
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Description</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(activeTab === 'zones' ? filteredZones : filteredWards).length > 0 ? (
                                (activeTab === 'zones' ? filteredZones : filteredWards).map((item) => (
                                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-gray-700">{item.name}</td>
                                        {activeTab === 'wards' && (
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase">
                                                    {item.zoneName}
                                                </span>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-sm text-gray-500 italic">
                                            {item.description || 'No description provided'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => activeTab === 'zones' ? handleOpenZoneModal(item) : handleOpenWardModal(item)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(activeTab, item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={activeTab === 'wards' ? 4 : 3} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <AlertCircle size={40} strokeWidth={1} />
                                            <p className="text-sm font-medium">No {activeTab} found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Zone Modal */}
            <AnimatePresence>
                {showZoneModal && (
                    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">{editingItem ? 'Edit Zone' : 'Add New Zone'}</h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Municipal Administrative Unit</p>
                                </div>
                                <button onClick={() => setShowZoneModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveZone} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Zone Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={zoneForm.name}
                                        onChange={e => setZoneForm({...zoneForm, name: e.target.value})}
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-500 font-bold placeholder:text-gray-300 transition-all"
                                        placeholder="e.g. Zone A"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Description (Optional)</label>
                                    <textarea 
                                        value={zoneForm.description}
                                        onChange={e => setZoneForm({...zoneForm, description: e.target.value})}
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-500 font-medium placeholder:text-gray-300 transition-all min-h-[100px]"
                                        placeholder="Brief details about this zone..."
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setShowZoneModal(false)}
                                        className="flex-1 py-4 text-sm font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 rounded-2xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        disabled={isSaving}
                                        className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : (editingItem ? 'Update Zone' : 'Create Zone')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Ward Modal */}
            <AnimatePresence>
                {showWardModal && (
                    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">{editingItem ? 'Edit Ward' : 'Add New Ward'}</h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Specific Area Unit</p>
                                </div>
                                <button onClick={() => setShowWardModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveWard} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Ward Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={wardForm.name}
                                        onChange={e => setWardForm({...wardForm, name: e.target.value})}
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-500 font-bold placeholder:text-gray-300 transition-all"
                                        placeholder="e.g. Ward 01"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Assigned Zone</label>
                                    <select 
                                        required
                                        value={wardForm.zoneName}
                                        onChange={e => setWardForm({...wardForm, zoneName: e.target.value})}
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-500 font-bold transition-all appearance-none"
                                    >
                                        <option value="">Select Zone</option>
                                        {zones.map(z => (
                                            <option key={z.id} value={z.name}>{z.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Description (Optional)</label>
                                    <textarea 
                                        value={wardForm.description}
                                        onChange={e => setWardForm({...wardForm, description: e.target.value})}
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-blue-500 font-medium placeholder:text-gray-300 transition-all min-h-[100px]"
                                        placeholder="Brief details about this ward..."
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setShowWardModal(false)}
                                        className="flex-1 py-4 text-sm font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 rounded-2xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        disabled={isSaving || !wardForm.zoneName}
                                        className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : (editingItem ? 'Update Ward' : 'Create Ward')}
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

export default ZoneWardMasterPage;
