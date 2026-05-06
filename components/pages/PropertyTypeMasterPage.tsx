import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Search, Edit2, Trash2, X, Check, Filter, 
    Building2, IndianRupee, Layers, AlertCircle, Save, RefreshCw
} from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { 
    createAdminData, 
    getAllAdminData, 
    updateAdminData, 
    deleteAdminData 
} from '../../services/databaseService';
import { useData } from '../../services/DataContext';

interface PropertyType {
    id: string;
    name: string;
    description?: string;
    createdAt?: any;
}

const PropertyTypeMasterPage = () => {
    const { refreshData } = useData();
    const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<PropertyType | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const res = await getAllAdminData('property_types');
        if (res.success) {
            setPropertyTypes(res.data as PropertyType[]);
        }
        setLoading(false);
    };

    const handleOpenModal = (item?: PropertyType) => {
        if (item) {
            setEditingItem(item);
            setForm({
                name: item.name,
                description: item.description || ''
            });
        } else {
            setEditingItem(null);
            setForm({ name: '', description: '' });
        }
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingItem) {
                await updateAdminData('property_types', editingItem.id, form);
            } else {
                await createAdminData('property_types', form);
            }
            setShowModal(false);
            fetchData();
            refreshData();
        } catch (error) {
            console.error("Error saving property type:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSeedDefaults = async () => {
        setIsSaving(true);
        const defaults = ['Commercial', 'Industrial', 'Institutional', 'Residential'];
        for (const name of defaults) {
            if (!propertyTypes.find(p => p.name === name)) {
                await createAdminData('property_types', { name });
            }
        }
        fetchData();
        refreshData();
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this property type?')) {
            await deleteAdminData('property_types', id);
            fetchData();
            refreshData();
        }
    };

    const filtered = propertyTypes.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 p-4">
            <PageHeader 
                title="Property Type Master" 
                description="Define and manage different property categories for customer classification"
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative flex-1 md:w-64 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search property types..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {propertyTypes.length === 0 && !loading && (
                        <button 
                            onClick={handleSeedDefaults}
                            disabled={isSaving}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 border border-amber-100 dark:border-amber-800 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-amber-100 transition-all"
                        >
                            <RefreshCw size={18} className={isSaving ? 'animate-spin' : ''} />
                            Seed Defaults
                        </button>
                    )}
                    <button 
                        onClick={() => handleOpenModal()}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 dark:shadow-none"
                    >
                        <Plus size={18} />
                        Add Property Type
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading types...</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Property Category</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Description</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {filtered.length > 0 ? (
                                filtered.map((item) => (
                                    <tr key={item.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors group">
                                        <td className="px-8 py-5 font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600">
                                                <Building2 size={20} />
                                            </div>
                                            {item.name}
                                        </td>
                                        <td className="px-8 py-5 text-sm text-gray-500 dark:text-gray-400 font-medium max-w-xs truncate">
                                            {item.description || 'N/A'}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleOpenModal(item)}
                                                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 rounded-lg transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <Layers size={48} strokeWidth={1} className="opacity-20" />
                                            <p className="text-sm font-medium">No property types defined</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
                        >
                            <div className="p-8 border-b border-gray-50 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white">{editingItem ? 'Edit Category' : 'New Category'}</h3>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Property Type Definition</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Type Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={form.name}
                                        onChange={e => setForm({...form, name: e.target.value})}
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-bold transition-all"
                                        placeholder="e.g. Commercial"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Description</label>
                                    <textarea 
                                        value={form.description}
                                        onChange={e => setForm({...form, description: e.target.value})}
                                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-medium transition-all min-h-[100px]"
                                        placeholder="Brief details about this property type..."
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        disabled={isSaving}
                                        className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                                        {editingItem ? 'Update Type' : 'Create Type'}
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

const Loader = ({ className, size }: { className?: string, size?: number }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export default PropertyTypeMasterPage;
