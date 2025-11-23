import React from "react";
import { motion } from "framer-motion";
import {
    Search, Filter, Download, ChevronDown, Plus,
    Calendar, MessageSquare, Edit, Inbox
} from "lucide-react";

import PageHeader from "../shared/PageHeader";

// --------------------------------------
// No Data View
// --------------------------------------
const NoDataView = ({
    message = "No records found",
    illustration: Illustration = Inbox,
}) => (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white border-t border-gray-100">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Illustration size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">{message}</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
            There is currently no data to display in this section. New records will appear here automatically.
        </p>
    </div>
);

// --------------------------------------
// Temporary Stats Placeholder
// --------------------------------------
const complaintStats = [];

// --------------------------------------
// Main Component
// --------------------------------------
const ComplaintPage = () => {
    const complaintsData: any[] = [];

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
                {complaintStats.length === 0 && (
                    <NoDataView message="No complaint stats available" />
                )}
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
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-end gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full">
                        {["Zone", "All Wards", "Complaint Type", "Status"].map(
                            (label) => (
                                <div key={label} className="relative">
                                    <select className="w-full bg-white border border-gray-200 text-gray-600 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 shadow-sm">
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
                        <button className="flex items-center gap-1.5 px-3 py-2 bg-green-50 border border-green-100 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100 whitespace-nowrap">
                            <Calendar size={14} /> Date Filter
                        </button>
                        <button className="flex items-center gap-1.5 px-6 py-2 bg-[#22c55e] text-white text-xs font-bold rounded-lg hover:bg-[#16a34a] shadow-sm whitespace-nowrap">
                            <Search size={14} /> Search All
                        </button>
                    </div>
                </div>
            </div>

            <p className="text-xs text-gray-500">Total Rows: 0</p>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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

                        <tbody className="divide-y divide-gray-100">
                            {complaintsData.length === 0 && (
                                <tr>
                                    <td colSpan={13}>
                                        <NoDataView />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-white">
                    <div className="relative">
                        <select className="appearance-none bg-white border border-gray-300 text-gray-700 text-xs rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-green-500">
                            <option>10</option>
                        </select>
                        <ChevronDown
                            size={12}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                        />
                    </div>

                    <div className="flex gap-1">
                        <button className="px-2 py-1 bg-gray-200 rounded text-gray-500 text-xs disabled:opacity-50">
                            «
                        </button>
                        <button className="px-2.5 py-1 bg-[#10b981] text-white rounded text-xs font-medium shadow-sm">
                            1
                        </button>
                        {[2, 3, 4, 5, 6].map((n) => (
                            <button
                                key={n}
                                className="px-2.5 py-1 bg-white border border-gray-300 text-gray-600 rounded text-xs hover:bg-gray-50"
                            >
                                {n}
                            </button>
                        ))}
                        <button className="px-2 py-1 bg-gray-200 rounded text-gray-600 text-xs hover:bg-gray-300">
                            »
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ComplaintPage;
