import React from "react";
import { motion } from "framer-motion";
import {
    Search, Filter, Download, ChevronDown, Plus,
    Calendar, MessageSquare, Edit, Inbox, CheckCircle, XCircle, Clock
} from "lucide-react";

import { useData } from "../../services/DataContext";
import PageHeader from "../shared/PageHeader";

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
// Main Component
// --------------------------------------
const ComplaintPage = () => {
    const { complaints, loading } = useData();

    const stats = React.useMemo(() => {
        const total = complaints.length;
        const resolved = complaints.filter(c => c.status === 'Resolved').length;
        const pending = complaints.filter(c => c.status === 'Pending').length;
        const rejected = complaints.filter(c => c.status === 'Rejected').length;

        return [
            { title: 'Total Complaints', value: total.toLocaleString(), icon: MessageSquare, color: 'text-blue-600 bg-blue-100' },
            { title: 'Resolved', value: resolved.toLocaleString(), icon: CheckCircle, color: 'text-green-600 bg-green-100' },
            { title: 'Pending', value: pending.toLocaleString(), icon: Clock, color: 'text-orange-500 bg-orange-100' },
            { title: 'Rejected', value: rejected.toLocaleString(), icon: XCircle, color: 'text-red-500 bg-red-100' },
        ];
    }, [complaints]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 p-2"
        >
            <PageHeader
                title="Complaint"
                description="Track and manage citizen grievances and resolutions."
            />

            {/* Stats Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`p-3 rounded-xl ${stat.color} bg-opacity-20`}>
                            <stat.icon size={24} className={stat.color.split(' ')[0]} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{stat.title}</p>
                            <h3 className="text-2xl font-black text-gray-800 dark:text-white mt-1">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#22c55e] text-white text-xs font-bold rounded hover:bg-[#16a34a] shadow-sm">
                            <Plus size={16} /> Add Complaint
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#22c55e] text-white text-xs font-bold rounded hover:bg-[#16a34a] shadow-sm">
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-end gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full">
                        {["Zone", "All Wards", "Complaint Type", "Status"].map(
                            (label) => (
                                <div key={label} className="relative">
                                    <select className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 shadow-sm">
                                        <option>{label}</option>
                                    </select>
                                    <ChevronDown
                                        size={14}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                    />
                                </div>
                            )
                        )}
                    </div>

                    <div className="flex gap-2 w-full md:w-auto shrink-0">
                        <button className="flex items-center gap-1.5 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 text-green-700 dark:text-green-400 text-xs font-medium rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 whitespace-nowrap">
                            <Calendar size={14} /> Date Filter
                        </button>
                        <button className="flex items-center gap-1.5 px-6 py-2 bg-[#22c55e] text-white text-xs font-bold rounded-lg hover:bg-[#16a34a] shadow-sm whitespace-nowrap">
                            <Search size={14} /> Search All
                        </button>
                    </div>
                </div>
            </div>

            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Total Rows: {complaints.length}</p>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1500px]">
                        <thead className="bg-[#22c55e] text-white">
                            <tr>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider w-10 border-r border-green-400/30 text-center">
                                    <div className="flex justify-center">▶</div>
                                </th>

                                {[
                                    "S.No",
                                    "Customer Id",
                                    "Customer Name",
                                    "Customer Number",
                                    "Complaint Date",
                                    "Status",
                                    "Ward",
                                    "Complaint Type",
                                    "Complaint ID",
                                    "Resolved Date",
                                    "Feedback",
                                    "Edit",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30 last:border-none whitespace-nowrap"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {complaints.length > 0 ? (
                                complaints.map((staff, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-xs text-gray-600 dark:text-gray-300">
                                        <td className="px-4 py-4 text-center border-r border-gray-100 dark:border-gray-700 text-emerald-500">▶</td>
                                        <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700">{idx + 1}</td>
                                        <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700 font-bold text-gray-800 dark:text-gray-200">{staff.customerId}</td>
                                        <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700">{staff.name}</td>
                                        <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700">{staff.number}</td>
                                        <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700">{staff.date}</td>
                                        <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${staff.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                                    staff.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {staff.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700">{staff.ward}</td>
                                        <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700 font-medium">{staff.type}</td>
                                        <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700 font-black tracking-tighter text-blue-600 underline cursor-pointer">{staff.complaintId}</td>
                                        <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700">{staff.rDate}</td>
                                        <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700 italic">{staff.feedback}</td>
                                        <td className="px-4 py-4">
                                            <button className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded hover:bg-emerald-500 hover:text-white transition-all">
                                                <Edit size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={13} className="px-4 py-4">
                                        <NoDataView message="No complaints found" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
                    <div className="relative">
                        <select className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-green-500">
                            <option>10</option>
                        </select>
                        <ChevronDown
                            size={12}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                        />
                    </div>

                    <div className="flex gap-1">
                        <button className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-400 text-xs disabled:opacity-50">
                            «
                        </button>
                        <button className="px-2.5 py-1 bg-[#10b981] text-white rounded text-xs font-medium shadow-sm">
                            1
                        </button>
                        {[2, 3, 4, 5, 6].map((n) => (
                            <button
                                key={n}
                                className="px-2.5 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-600"
                            >
                                {n}
                            </button>
                        ))}
                        <button className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 text-xs hover:bg-gray-300 dark:hover:bg-gray-600">
                            »
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ComplaintPage;
