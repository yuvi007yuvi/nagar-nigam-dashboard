import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Save, Trash2, Calendar, Map, CheckCircle, AlertCircle, 
    Plus, Filter, History, PieChart, Megaphone, Shirt,
    ArrowRight, Loader2, ChevronRight
} from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { db } from '../../services/firebaseConfig';
import { 
    collection, addDoc, getDocs, query, orderBy, 
    limit, deleteDoc, doc, where, Timestamp 
} from 'firebase/firestore';
import { useData } from '../../services/DataContext';
import { format } from 'date-fns';

const KPI_TYPES = [
    { id: 'segregation', label: 'Waste Segregation', icon: PieChart, color: 'emerald', description: 'Percentage of households practicing source segregation' },
    { id: 'iec', label: 'IEC Campaign', icon: Megaphone, color: 'blue', description: 'Information, Education & Communication activities' },
    { id: 'uniform', label: 'Uniform Compliance', icon: Shirt, color: 'amber', description: 'Staff wearing complete uniform and safety gear' }
];

const KPIDataEntryPage = () => {
    const { zones, wards } = useData();
    const [activeTab, setActiveTab] = useState('segregation');
    const [loading, setLoading] = useState(false);
    const [entries, setEntries] = useState<any[]>([]);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        zone: 'All',
        ward: 'All',
        value: '',
        details: ''
    });

    useEffect(() => {
        fetchRecentEntries();
    }, [activeTab]);

    const fetchRecentEntries = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'kpiDataEntry'),
                where('type', '==', activeTab),
                orderBy('date', 'desc'),
                limit(10)
            );
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEntries(data);
        } catch (err) {
            console.error("Error fetching entries:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.value) return;

        setLoading(true);
        try {
            const entry = {
                type: activeTab,
                date: formData.date,
                zone: formData.zone,
                ward: formData.ward,
                value: Number(formData.value),
                details: formData.details,
                createdAt: Timestamp.now()
            };

            await addDoc(collection(db, 'kpiDataEntry'), entry);
            setSuccessMsg('Data saved successfully!');
            setFormData(prev => ({ ...prev, value: '', details: '' }));
            fetchRecentEntries();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err: any) {
            setErrorMsg('Failed to save data: ' + err.message);
            setTimeout(() => setErrorMsg(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;
        try {
            await deleteDoc(doc(db, 'kpiDataEntry', id));
            fetchRecentEntries();
        } catch (err) {
            console.error("Error deleting entry:", err);
        }
    };

    return (
        <div className="space-y-6 p-4 max-w-7xl mx-auto">
            <PageHeader 
                title="KPI Data Management" 
                description="Manually record operational performance for qualitative KPIs"
            />

            {/* KPI Category Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {KPI_TYPES.map((type) => (
                    <motion.button
                        key={type.id}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab(type.id)}
                        className={`p-6 rounded-[24px] border-2 text-left transition-all relative overflow-hidden group ${
                            activeTab === type.id 
                            ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/10 shadow-lg shadow-${type.color}-500/10` 
                            : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 hover:border-gray-200'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                            activeTab === type.id ? `bg-${type.color}-500 text-white` : `bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:text-gray-600`
                        }`}>
                            <type.icon size={24} />
                        </div>
                        <h3 className={`font-black text-lg ${activeTab === type.id ? `text-${type.color}-900 dark:text-${type.color}-100` : 'text-gray-900 dark:text-white'}`}>
                            {type.label}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
                            {type.description}
                        </p>
                        
                        {activeTab === type.id && (
                            <div className={`absolute top-4 right-4 w-2 h-2 rounded-full bg-${type.color}-500 animate-pulse`} />
                        )}
                    </motion.button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Entry Form */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
                        <div className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black">New Data Entry</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">
                                    {KPI_TYPES.find(t => t.id === activeTab)?.label}
                                </p>
                            </div>
                            <Plus size={24} className="opacity-40" />
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Record Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type="date" 
                                        required
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Zone</label>
                                    <select 
                                        value={formData.zone}
                                        onChange={e => setFormData({ ...formData, zone: e.target.value, ward: 'All' })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-bold outline-none"
                                    >
                                        <option value="All">All Zones</option>
                                        {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Ward</label>
                                    <select 
                                        value={formData.ward}
                                        onChange={e => setFormData({ ...formData, ward: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-bold outline-none"
                                    >
                                        <option value="All">All Wards</option>
                                        {wards.filter(w => 
                                            formData.zone === 'All' || 
                                            w.zoneId === formData.zone || 
                                            w.zone === formData.zone || 
                                            w.zoneName === formData.zone
                                        ).map(w => (
                                            <option key={w.id} value={w.name}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">
                                    {activeTab === 'iec' ? 'Campaign Count / Activity ID' : 'Performance Percentage (%)'}
                                </label>
                                <input 
                                    type="number" 
                                    required
                                    placeholder={activeTab === 'iec' ? "Enter number of activities" : "Enter percentage (0-100)"}
                                    value={formData.value}
                                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Additional Details</label>
                                <textarea 
                                    placeholder="Enter remarks or campaign details..."
                                    value={formData.details}
                                    onChange={e => setFormData({ ...formData, details: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
                                />
                            </div>

                            <div className="pt-2">
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Save Entry
                                </button>
                            </div>

                            {successMsg && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
                                    <CheckCircle size={14} /> {successMsg}
                                </motion.div>
                            )}

                            {errorMsg && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
                                    <AlertCircle size={14} /> {errorMsg}
                                </motion.div>
                            )}
                        </form>
                    </div>
                </div>

                {/* History Section */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden flex flex-col h-full">
                        <div className="p-8 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Recent Records</h3>
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">Last 10 entries for this category</p>
                            </div>
                            <History size={24} className="text-gray-300" />
                        </div>

                        <div className="flex-1 overflow-auto max-h-[600px]">
                            {loading && entries.length === 0 ? (
                                <div className="p-12 flex flex-col items-center justify-center">
                                    <Loader2 size={48} className="text-gray-200 animate-spin mb-4" />
                                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Loading Records...</p>
                                </div>
                            ) : entries.length === 0 ? (
                                <div className="p-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center mb-4">
                                        <Filter size={32} className="text-gray-200" />
                                    </div>
                                    <h4 className="font-bold text-gray-500">No records found</h4>
                                    <p className="text-sm text-gray-400 mt-1">Start by adding a new performance record on the left.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {entries.map((entry) => (
                                        <div key={entry.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-all group">
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 font-black text-sm">
                                                        {format(new Date(entry.date), 'dd')}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-black text-gray-900 dark:text-white">
                                                                {entry.value}{activeTab === 'iec' ? '' : '%'}
                                                            </span>
                                                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                                                                {entry.ward !== 'All' ? entry.ward : entry.zone}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 font-medium mt-1">
                                                            {format(new Date(entry.date), 'MMMM yyyy')} • {entry.details || 'No additional details'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDelete(entry.id)}
                                                    className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KPIDataEntryPage;
