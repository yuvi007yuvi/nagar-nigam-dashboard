import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Filter, Download, FileText, Upload, Eye, 
    CheckCircle, AlertCircle, Home, Briefcase, Building2, 
    Factory, Users, ArrowRight, ChevronRight,
    ExternalLink, Trash2, Calendar
} from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { useData } from '../../services/DataContext';
import { getAllAdminData } from '../../services/databaseService';

interface PropertyType {
    id: string;
    name: string;
    description?: string;
}

const PropertyWiseCheckingPage = () => {
    const { customers, loading: customersLoading } = useData();
    const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [gazetteUrl, setGazetteUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchTypes = async () => {
            const res = await getAllAdminData('property_types');
            if (res.success) {
                setPropertyTypes(res.data as PropertyType[]);
            }
            setLoading(false);
        };
        fetchTypes();
    }, []);

    // Mock Gazette Upload (since we don't have a file storage tool yet, we'll simulate the state)
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // In a real app, we'd upload to Firebase Storage
            setGazetteUrl(URL.createObjectURL(file));
        }
    };

    const filteredCustomers = customers.filter(c => {
        const matchesType = selectedType === 'All' || c.propertyType === selectedType;
        const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.customerId?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    const summary = propertyTypes.map(type => ({
        ...type,
        count: customers.filter(c => c.propertyType === type.name).length
    }));

    return (
        <div className="space-y-8 p-4">
            <PageHeader 
                title="Property-Wise Customer Audit" 
                description="Monitor customer distribution by property category and verify against official rate gazettes"
            />

            {/* Gazette Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-[32px] p-8 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <FileText size={120} />
                    </div>
                    
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        Official Gazette
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-black rounded-md uppercase">Rates Table</span>
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6">
                        Upload the latest government notification defining user charges for each property type.
                    </p>

                    {gazetteUrl ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-red-600">
                                    <FileText size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Official_Rates_Gazette.pdf</p>
                                    <p className="text-[10px] text-gray-400 font-black uppercase">Updated Oct 2023</p>
                                </div>
                                <button onClick={() => setGazetteUrl(null)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                                    <Eye size={14} /> View Gazette
                                </button>
                                <button className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                                    <Download size={18} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[32px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-all group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                                    <Upload size={24} />
                                </div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Upload Gazette PDF</p>
                            </div>
                            <input type="file" className="hidden" onChange={handleFileUpload} accept="application/pdf,image/*" />
                        </label>
                    )}
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4"
                >
                    {summary.map((type, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 rounded-[32px] p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between group hover:border-emerald-500 transition-colors cursor-pointer" onClick={() => setSelectedType(type.name)}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600">
                                    {type.name === 'Residential' ? <Home size={18} /> : 
                                     type.name === 'Commercial' ? <Briefcase size={18} /> : 
                                     type.name === 'Industrial' ? <Factory size={18} /> : <Building2 size={18} />}
                                </div>
                                <span className="text-2xl font-black text-gray-900 dark:text-white">{type.count.toLocaleString()}</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-gray-900 dark:text-white mb-1">{type.name}</h4>
                            </div>
                        </div>
                    ))}
                    
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-[32px] p-6 border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center opacity-50">
                        <Users size={24} className="text-gray-400 mb-2" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">More Types defined in Master</p>
                    </div>
                </motion.div>
            </div>

            {/* Audit List */}
            <div className="bg-white dark:bg-gray-800 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">Customer Audit List</h3>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Cross-reference property types with rates</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                        </div>
                        <div className="flex gap-1 p-1 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                            {['All', ...propertyTypes.map(t => t.name)].map(type => (
                                <button 
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        selectedType === type 
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Name</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Property Type</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ward</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Audit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {customersLoading || loading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12 text-center">
                                        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Analyzing Records...</p>
                                    </td>
                                </tr>
                            ) : filteredCustomers.slice(0, 50).map((customer, idx) => (
                                <tr key={idx} className="hover:bg-emerald-50/20 dark:hover:bg-emerald-900/10 transition-colors group">
                                    <td className="px-8 py-5 text-sm font-black text-gray-900 dark:text-white">{customer.customerId}</td>
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-gray-900 dark:text-white">{customer.name}</div>
                                        <div className="text-[10px] text-gray-400 font-medium">{customer.phone}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            customer.propertyType === 'Residential' ? 'bg-orange-50 text-orange-600' :
                                            customer.propertyType === 'Commercial' ? 'bg-red-50 text-red-600' :
                                            'bg-blue-50 text-blue-600'
                                        }`}>
                                            {customer.propertyType || 'Unassigned'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-gray-500 dark:text-gray-400">{customer.ward}</td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                            <ExternalLink size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredCustomers.length > 50 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-6 text-center">
                                        <button className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] hover:underline">
                                            Load All {filteredCustomers.length} Records
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PropertyWiseCheckingPage;
