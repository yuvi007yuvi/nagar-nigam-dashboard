import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Filter, Download, ChevronDown, Plus,
    Calendar, MessageSquare, Edit, Inbox, CheckCircle, XCircle, Clock, X, Save, Trash2, AlertCircle
} from "lucide-react";

import { useData } from "../../services/DataContext";
import PageHeader from "../shared/PageHeader";
import { createComplaint, updateComplaint, deleteComplaint } from "../../services/databaseService";

// --------------------------------------
// No Data View
// --------------------------------------
const NoDataView = ({
    message = "No records found",
    illustration: Illustration = Inbox,
}: any) => (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-full mb-4">
            <Illustration size={32} className="text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{message}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
            There is currently no data to display in this section. New records will appear here automatically.
        </p>
    </div>
);

// --------------------------------------
// Complaint Modal
// --------------------------------------
const ComplaintModal = ({ isOpen, onClose, complaint, zones, wards, onSave }: any) => {
    const [formData, setFormData] = useState(complaint || {
        customerId: '',
        name: '',
        number: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        zone: '',
        ward: '',
        type: 'General',
        feedback: ''
    });

    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Error saving complaint:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-700"
            >
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                    <h3 className="text-lg font-black text-gray-800 dark:text-white flex items-center gap-2">
                        {complaint ? <Edit size={20} className="text-blue-500" /> : <Plus size={20} className="text-emerald-500" />}
                        {complaint ? 'Edit Complaint' : 'Add New Complaint'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer ID</label>
                            <input 
                                required
                                value={formData.customerId}
                                onChange={e => setFormData({...formData, customerId: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 text-sm font-bold text-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Name</label>
                            <input 
                                required
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 text-sm font-bold text-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                            <input 
                                required
                                value={formData.number}
                                onChange={e => setFormData({...formData, number: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 text-sm font-bold text-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</label>
                            <input 
                                type="date"
                                required
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 text-sm font-bold text-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Zone</label>
                            <select 
                                required
                                value={formData.zone}
                                onChange={e => setFormData({...formData, zone: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 text-sm font-bold text-gray-700 dark:text-white"
                            >
                                <option value="">Select Zone</option>
                                {zones.map((z: any) => <option key={z.id} value={z.name}>{z.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ward</label>
                            <select 
                                required
                                value={formData.ward}
                                onChange={e => setFormData({...formData, ward: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 text-sm font-bold text-gray-700 dark:text-white"
                            >
                                <option value="">Select Ward</option>
                                {wards.filter((w: any) => w.zoneName === formData.zone || !formData.zone).map((w: any) => <option key={w.id} value={w.name}>{w.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Complaint Type</label>
                            <select 
                                value={formData.type}
                                onChange={e => setFormData({...formData, type: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 text-sm font-bold text-gray-700 dark:text-white"
                            >
                                <option value="General">General</option>
                                <option value="Garbage Not Picked">Garbage Not Picked</option>
                                <option value="Drainage Issue">Drainage Issue</option>
                                <option value="Street Light">Street Light</option>
                                <option value="Misbehavior">Staff Misbehavior</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</label>
                            <select 
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value})}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 text-sm font-bold text-gray-700 dark:text-white"
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Out of Scope">Out of Scope</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin Feedback</label>
                        <textarea 
                            rows={3}
                            value={formData.feedback}
                            onChange={e => setFormData({...formData, feedback: e.target.value})}
                            placeholder="Enter resolution notes..."
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 text-sm font-bold text-gray-700 dark:text-white resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                            {complaint ? 'Update' : 'Save Complaint'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const RefreshCw = ({ size, className }: any) => (
    <motion.svg 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
    >
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M3 21v-5h5"/>
    </motion.svg>
);

// --------------------------------------
// Main Component
// --------------------------------------
const ComplaintPage = () => {
    const { complaints, zones, wards, loading, refreshData } = useData();
    
    // State for Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedZone, setSelectedZone] = useState("All");
    const [selectedWard, setSelectedWard] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [selectedType, setSelectedType] = useState("All");
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingComplaint, setEditingComplaint] = useState<any>(null);

    const filteredComplaints = useMemo(() => {
        return complaints.filter(c => {
            const matchesSearch = 
                (c.customerId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (c.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (c.complaintId?.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesZone = selectedZone === "All" || c.zone === selectedZone;
            const matchesWard = selectedWard === "All" || c.ward === selectedWard;
            const matchesStatus = selectedStatus === "All" || c.status === selectedStatus;
            const matchesType = selectedType === "All" || c.type === selectedType;

            return matchesSearch && matchesZone && matchesWard && matchesStatus && matchesType;
        });
    }, [complaints, searchTerm, selectedZone, selectedWard, selectedStatus, selectedType]);

    const stats = useMemo(() => {
        const total = filteredComplaints.length;
        const resolved = filteredComplaints.filter(c => c.status === 'Resolved').length;
        const pending = filteredComplaints.filter(c => c.status === 'Pending').length;
        const inProgress = filteredComplaints.filter(c => c.status === 'In Progress').length;

        return [
            { title: 'Total Complaints', value: total.toLocaleString(), icon: MessageSquare, color: 'text-blue-600 bg-blue-100' },
            { title: 'Resolved', value: resolved.toLocaleString(), icon: CheckCircle, color: 'text-green-600 bg-green-100' },
            { title: 'In Progress', value: inProgress.toLocaleString(), icon: Clock, color: 'text-orange-500 bg-orange-100' },
            { title: 'Pending', value: pending.toLocaleString(), icon: AlertCircle, color: 'text-red-500 bg-red-100' },
        ];
    }, [filteredComplaints]);

    const handleSave = async (data: any) => {
        const now = new Date().toISOString();
        if (editingComplaint) {
            await updateComplaint(editingComplaint.id, { 
                ...data, 
                updatedAt: now 
            });
        } else {
            const complaintId = `COMP-${Math.floor(100000 + Math.random() * 900000)}`;
            await createComplaint({ 
                ...data, 
                complaintId,
                createdAt: now,
                updatedAt: now
            });
        }
        refreshData();
    };

    const handleExport = () => {
        if (filteredComplaints.length === 0) return alert("No data to export");
        
        const headers = ["Complaint ID", "Customer ID", "Name", "Number", "Date", "Status", "Zone", "Ward", "Type", "Feedback"];
        const rows = filteredComplaints.map(c => [
            `"${c.complaintId || ''}"`, 
            `"${c.customerId || ''}"`, 
            `"${c.name || ''}"`, 
            `"${c.number || ''}"`, 
            `"${c.date || ''}"`, 
            `"${c.status || ''}"`, 
            `"${c.zone || ''}"`, 
            `"${c.ward || ''}"`, 
            `"${c.type || ''}"`, 
            `"${(c.feedback || '').replace(/"/g, '""')}"`
        ]);
        
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `complaints_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this complaint?")) {
            await deleteComplaint(id);
            refreshData();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 p-2"
        >
            <PageHeader
                title="Complaint Management"
                description="Track and manage citizen grievances and resolutions in real-time."
            />

            {/* Stats Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group">
                        <div className={`p-4 rounded-xl ${stat.color} bg-opacity-20 group-hover:rotate-6 transition-transform`}>
                            <stat.icon size={24} className={stat.color.split(' ')[0]} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{stat.title}</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            placeholder="Search by Customer ID, Name or Complaint ID..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                            onClick={() => { setEditingComplaint(null); setIsModalOpen(true); }}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all"
                        >
                            <Plus size={18} /> Add Complaint
                        </button>
                        <button 
                            onClick={handleExport}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                        >
                            <Download size={18} /> Export
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Zone</label>
                            <select 
                                value={selectedZone}
                                onChange={e => { setSelectedZone(e.target.value); setSelectedWard("All"); }}
                                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg px-3 py-2 outline-none appearance-none"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                            >
                                <option value="All">All Zones</option>
                                {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Ward</label>
                            <select 
                                value={selectedWard}
                                onChange={e => setSelectedWard(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg px-3 py-2 outline-none appearance-none"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                            >
                                <option value="All">All Wards</option>
                                {wards.filter(w => w.zoneName === selectedZone || selectedZone === "All").map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Complaint Type</label>
                            <select 
                                value={selectedType}
                                onChange={e => setSelectedType(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg px-3 py-2 outline-none appearance-none"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                            >
                                <option value="All">All Types</option>
                                <option value="General">General</option>
                                <option value="Garbage Not Picked">Garbage Not Picked</option>
                                <option value="Drainage Issue">Drainage Issue</option>
                                <option value="Street Light">Street Light</option>
                                <option value="Misbehavior">Staff Misbehavior</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Status</label>
                            <select 
                                value={selectedStatus}
                                onChange={e => setSelectedStatus(e.target.value)}
                                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg px-3 py-2 outline-none appearance-none"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Out of Scope">Out of Scope</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center px-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Showing {filteredComplaints.length} Records</p>
            </div>

            {/* Table Area */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse min-w-[1500px]">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center w-16">#</th>
                                {[
                                    "Customer Info",
                                    "Complaint Detail",
                                    "Status & Timing",
                                    "Zone / Ward",
                                    "Resolution Feedback",
                                    "Actions"
                                ].map((h) => (
                                    <th key={h} className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {filteredComplaints.length > 0 ? (
                                filteredComplaints.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all group">
                                        <td className="px-6 py-6 text-center font-black text-gray-300 group-hover:text-emerald-500 transition-colors">
                                            {idx + 1}
                                        </td>
                                        <td className="px-6 py-6 border-r border-gray-50 dark:border-gray-800/50">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.name}</span>
                                                <span className="text-[10px] font-bold text-blue-500 mt-0.5">{item.customerId}</span>
                                                <span className="text-[10px] font-medium text-gray-400 mt-1 flex items-center gap-1">
                                                    <AlertCircle size={10} /> {item.number}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 border-r border-gray-50 dark:border-gray-800/50">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.type}</span>
                                                <span className="text-[10px] font-black text-emerald-500 mt-1 tracking-wider uppercase">{item.complaintId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 border-r border-gray-50 dark:border-gray-800/50">
                                            <div className="flex flex-col gap-2">
                                                <span className={`w-fit px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                    item.status === 'Resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    item.status === 'Pending' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    item.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    item.status === 'Out of Scope' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {item.status}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                    <Calendar size={12} /> {item.date}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 border-r border-gray-50 dark:border-gray-800/50">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{item.zone}</span>
                                                <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200">{item.ward}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 border-r border-gray-50 dark:border-gray-800/50 max-w-xs">
                                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 italic leading-relaxed">
                                                {item.feedback || "No feedback provided yet..."}
                                            </p>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => { setEditingComplaint(item); setIsModalOpen(true); }}
                                                    className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                                                    title="Edit Complaint"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-0">
                                        <NoDataView message={loading ? "Loading data..." : "No complaints match your filters"} />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <ComplaintModal 
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        complaint={editingComplaint}
                        zones={zones}
                        wards={wards}
                        onSave={handleSave}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ComplaintPage;
