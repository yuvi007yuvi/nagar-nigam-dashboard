import React from 'react';
import { motion } from 'framer-motion';
import {
    Search, Filter, Download, MoreHorizontal, MapPin,
    CheckCircle, XCircle, Clock, AlertTriangle, User,
    Fuel, Settings, Save, Bell, Inbox,
    Plus, Minus, FileText, ChevronDown, Calendar, ArrowRight,
    Home, Briefcase, Building2, Factory, Layers,
    IndianRupee, Gauge, Droplets, TrendingUp,
    Scale, Truck, WifiOff, PlayCircle, OctagonAlert, PauseCircle, StopCircle,
    CalendarCheck, Edit, MessageSquare
} from 'lucide-react';
import {
    TruckIllustration,
    WalletIllustration,
    MapIllustration,
    AlertIllustration,
    PeopleIllustration,
    BinIllustration
} from '../Illustrations';
import PageHeader from '../shared/PageHeader';

interface NoDataViewProps {
    message?: string;
    illustration?: React.ElementType;
}

const NoDataView = ({ message = "No records found", illustration: Illustration = Inbox }: NoDataViewProps) => (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white border-t border-gray-100">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
            {/* If it's a component from Illustrations, use it, else use lucide icon */}
            {typeof Illustration === 'function' && (Illustration as any).name?.includes('Illustration') ? (
                <div className="w-20 h-20"><Illustration /></div>
            ) : (
                // @ts-ignore
                <Illustration size={32} className="text-gray-400" />
            )}
        </div>
        <h3 className="text-lg font-medium text-gray-900">{message}</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
            There is currently no data to display in this section. New records will appear here automatically.
        </p>
    </div>
);

// --- Bulk Collection Page ---
const BulkCollectionPage = () => {
    // Stats data structure
    const bulkStats = [
        { title: 'Today', total: 0, unique: 0, tat: '0 m', icon: Calendar, color: 'text-purple-600 bg-purple-100' },
        { title: 'Yesterday', total: 0, unique: 0, tat: '0 m', icon: Clock, color: 'text-pink-500 bg-pink-100' },
        { title: 'Till Month', total: 0, unique: 0, tat: '0 m', icon: Calendar, color: 'text-green-600 bg-green-100' },
        { title: 'Previous Month', total: 0, unique: 0, tat: '0 m', icon: Calendar, color: 'text-blue-600 bg-blue-100' },
    ];

    const BulkStatCard = ({ title, total, unique, tat, icon: Icon, color }: any) => (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon size={18} className={color.split(' ')[0]} />
                </div>
                <h4 className="font-bold text-gray-800 text-sm">{title}</h4>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Total Scans</span>
                    <span className="font-bold text-gray-800">{total}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Unique Scans</span>
                    <span className="font-bold text-gray-800">{unique}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">TAT</span>
                    <span className="font-bold text-gray-800">{tat}</span>
                </div>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-50 text-[10px] text-gray-400 cursor-pointer hover:text-blue-600 flex items-center gap-1">
                View More <div className="w-3 h-3 rounded-full border border-gray-300 flex items-center justify-center text-[8px]">@</div>
            </div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-2">
            <PageHeader title="Bulk Collection" description="Collection status for hotels, hospitals, and large institutions." />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {bulkStats.map((stat, i) => (
                    <BulkStatCard key={i} {...stat} />
                ))}
            </div>

            {/* Actions & Filters */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-end">
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-[#22c55e] text-white text-xs font-bold rounded-lg hover:bg-[#16a34a] shadow-sm">
                        <Download size={14} /> Export
                    </button>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-gray-50/50 p-2 rounded-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full md:w-auto flex-1">
                        <select className="bg-white border border-gray-200 text-gray-600 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 shadow-sm">
                            <option>Select Category</option>
                        </select>
                        <select className="bg-white border border-gray-200 text-gray-600 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 shadow-sm">
                            <option>Zone</option>
                        </select>
                        <select className="bg-white border border-gray-200 text-gray-600 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 shadow-sm">
                            <option>All Wards</option>
                        </select>
                        <button className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 border border-green-100 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100">
                            <Calendar size={14} /> Date Filter
                        </button>
                    </div>
                    <div className="w-full md:w-auto">
                        <button className="w-full md:w-auto flex items-center justify-center gap-1.5 px-6 py-2 bg-[#22c55e] text-white text-xs font-bold rounded-lg hover:bg-[#16a34a] shadow-sm">
                            <Search size={14} /> Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1400px]">
                        <thead className="bg-[#22c55e] text-white">
                            <tr>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider w-12 border-r border-green-400/30">
                                    <div className="flex items-center justify-center">▶</div>
                                </th>
                                {[
                                    'Scan ID', 'QR Code ID', 'Date of Scan', 'Site Name', 'Supervisor Name', 'Supervisor ID',
                                    'Before Clean Time', 'Before Image', 'After Clean Time', 'After Image', 'Ward Name', 'Feedback'
                                ].map((h) => (
                                    <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30 last:border-none">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* Empty rows as per request to keep clean state */}
                        </tbody>
                    </table>
                </div>
                <NoDataView message="No bulk collection records found" illustration={BinIllustration} />

                {/* Pagination */}
                <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-white">
                    <div className="relative">
                        <select className="appearance-none bg-white border border-gray-300 text-gray-700 text-xs rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-green-500">
                            <option>10</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                    <div className="flex gap-1">
                        <button className="px-2 py-1 bg-gray-200 rounded text-gray-500 text-xs disabled:opacity-50">«</button>
                        <button className="px-2.5 py-1 bg-[#22c55e] text-white rounded text-xs font-medium shadow-sm">1</button>
                        <button className="px-2.5 py-1 bg-white border border-gray-300 text-gray-600 rounded text-xs hover:bg-gray-50">2</button>
                        <button className="px-2.5 py-1 bg-white border border-gray-300 text-gray-600 rounded text-xs hover:bg-gray-50">3</button>
                        <button className="px-2.5 py-1 bg-white border border-gray-300 text-gray-600 rounded text-xs hover:bg-gray-50">4</button>
                        <button className="px-2.5 py-1 bg-white border border-gray-300 text-gray-600 rounded text-xs hover:bg-gray-50">5</button>
                        <button className="px-2.5 py-1 bg-white border border-gray-300 text-gray-600 rounded text-xs hover:bg-gray-50">6</button>
                        <button className="px-2.5 py-1 bg-white border border-gray-300 text-gray-600 rounded text-xs hover:bg-gray-50">7</button>
                        <button className="px-2.5 py-1 bg-white border border-gray-300 text-gray-600 rounded text-xs hover:bg-gray-50">8</button>
                        <button className="px-2.5 py-1 bg-white border border-gray-300 text-gray-600 rounded text-xs hover:bg-gray-50">9</button>
                        <button className="px-2.5 py-1 bg-white border border-gray-300 text-gray-600 rounded text-xs hover:bg-gray-50">10</button>
                        <button className="px-2 py-1 bg-gray-200 rounded text-gray-600 text-xs hover:bg-gray-300">»</button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default BulkCollectionPage;
