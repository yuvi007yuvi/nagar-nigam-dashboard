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
    CalendarCheck, Edit, MessageSquare, RefreshCw
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
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-full mb-4">
            {/* If it's a component from Illustrations, use it, else use lucide icon */}
            {typeof Illustration === 'function' && (Illustration as any).name?.includes('Illustration') ? (
                <div className="w-20 h-20"><Illustration /></div>
            ) : (
                // @ts-ignore
                <Illustration size={32} className="text-gray-400 dark:text-gray-500" />
            )}
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{message}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
            There is currently no data to display in this section. New records will appear here automatically.
        </p>
    </div>
);

const BulkCollectionPage = () => {
    const [loading, setLoading] = React.useState(false);
    const [records, setRecords] = React.useState<any[]>([]);

    const handleSearch = () => {
        setLoading(true);
        setTimeout(() => {
            setRecords([
                { id: '1001', qr: 'QR-A1', date: '2026-03-07', site: 'Grand Hotel', supervisor: 'Ramesh Balan', sid: 'S001', btime: '07:30 AM', bimg: 'Img1', atime: '08:15 AM', aimg: 'Img2', ward: '35-Bankhandi', fill: '85%', feedback: 'Good' },
                { id: '1002', qr: 'QR-B2', date: '2026-03-07', site: 'City Hospital', supervisor: 'Suresh Kumar', sid: 'S002', btime: '08:00 AM', bimg: 'Img3', atime: '08:45 AM', aimg: 'Img4', ward: '65-Holi Gali', fill: '40%', feedback: 'On-time' },
                { id: '1003', qr: 'QR-C3', date: '2026-03-07', site: 'Metro Mall', supervisor: 'Anil Yadav', sid: 'S003', btime: '09:15 AM', bimg: 'Img5', atime: '10:00 AM', aimg: 'Img6', ward: '56-Mandi Ramdas', fill: '95%', feedback: 'Overfilled' },
            ]);
            setLoading(false);
        }, 800);
    };
    // Stats data structure
    const bulkStats = [
        { title: 'Today', total: 42, unique: 12, tat: '45 m', icon: Calendar, color: 'text-purple-600 bg-purple-100' },
        { title: 'Yesterday', total: 118, unique: 35, tat: '52 m', icon: Clock, color: 'text-pink-500 bg-pink-100' },
        { title: 'Till Month', total: 842, unique: 145, tat: '48 m', icon: Calendar, color: 'text-green-600 bg-green-100' },
        { title: 'Previous Month', total: 2450, unique: 148, tat: '50 m', icon: Calendar, color: 'text-blue-600 bg-blue-100' },
    ];

    const BulkStatCard = ({ title, total, unique, tat, icon: Icon, color }: any) => (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
                    <Icon size={18} className={color.split(' ')[0]} />
                </div>
                <h4 className="font-bold text-gray-800 dark:text-white text-sm">{title}</h4>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Total Scans</span>
                    <span className="font-bold text-gray-800 dark:text-white">{total}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Unique Scans</span>
                    <span className="font-bold text-gray-800 dark:text-white">{unique}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400">TAT</span>
                    <span className="font-bold text-gray-800 dark:text-white">{tat}</span>
                </div>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-50 dark:border-gray-700 text-[10px] text-gray-400 dark:text-gray-500 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1">
                View More <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[8px]">@</div>
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

                <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-gray-50/50 dark:bg-gray-800/50 p-2 rounded-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full md:w-auto flex-1">
                        <select className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 shadow-sm">
                            <option>Select Category</option>
                        </select>
                        <select className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 shadow-sm">
                            <option>Zone</option>
                        </select>
                        <select className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 shadow-sm">
                            <option>All Wards</option>
                        </select>
                        <button className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 text-green-700 dark:text-green-400 text-xs font-medium rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50">
                            <Calendar size={14} /> Date Filter
                        </button>
                    </div>
                    <div className="w-full md:w-auto">
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className={`w-full md:w-auto flex items-center justify-center gap-1.5 px-6 py-2 bg-[#22c55e] text-white text-xs font-bold rounded-lg hover:bg-[#16a34a] shadow-sm ${loading ? 'opacity-70' : ''}`}
                        >
                            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1400px]">
                        <thead className="bg-[#22c55e] text-white">
                            <tr>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider w-12 border-r border-green-400/30">
                                    <div className="flex items-center justify-center">▶</div>
                                </th>
                                {[
                                    'Scan ID', 'QR Code ID', 'Date of Scan', 'Site Name', 'Supervisor Name', 'Supervisor ID',
                                    'Before Clean Time', 'Before Image', 'After Clean Time', 'After Image', 'Ward Name', 'Dustbin Fill %', 'Feedback'
                                ].map((h) => (
                                    <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30 last:border-none">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {records.map((r, i) => (
                                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors text-[11px] font-bold text-gray-700 dark:text-gray-300">
                                    <td className="px-4 py-4 text-center border-r dark:border-gray-700 text-emerald-500">▶</td>
                                    <td className="px-4 py-4 border-r dark:border-gray-700">{r.id}</td>
                                    <td className="px-4 py-4 border-r dark:border-gray-700">{r.qr}</td>
                                    <td className="px-4 py-4 border-r dark:border-gray-700">{r.date}</td>
                                    <td className="px-4 py-4 border-r dark:border-gray-700">{r.site}</td>
                                    <td className="px-4 py-4 border-r dark:border-gray-700">{r.supervisor}</td>
                                    <td className="px-4 py-4 border-r dark:border-gray-700 tracking-tighter">{r.sid}</td>
                                    <td className="px-4 py-4 border-r dark:border-gray-700">{r.btime}</td>
                                    <td className="px-4 py-4 border-r dark:border-gray-700 text-blue-500 underline cursor-pointer">{r.bimg}</td>
                                    <td className="px-4 py-4 border-r dark:border-gray-700">{r.atime}</td>
                                    <td className="px-4 py-4 border-r dark:border-gray-700 text-blue-500 underline cursor-pointer">{r.aimg}</td>
                                    <td className="px-4 py-4 border-r dark:border-gray-700">{r.ward}</td>
                                    <td className="px-4 py-4 border-r dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${parseInt(r.fill) > 80 ? 'bg-red-500' : 'bg-green-500'}`}
                                                    style={{ width: r.fill }}
                                                ></div>
                                            </div>
                                            <span className={parseInt(r.fill) > 80 ? 'text-red-500 font-black' : ''}>{r.fill}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">{r.feedback}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {records.length === 0 && (
                    <NoDataView message={loading ? "Searching records..." : "No bulk collection records found"} illustration={loading ? RefreshCw : BinIllustration} />
                )}

                {/* Pagination */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
                    <div className="relative">
                        <select className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-green-500">
                            <option>10</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                    <div className="flex gap-1">
                        <button className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-400 text-xs disabled:opacity-50">«</button>
                        <button className="px-2.5 py-1 bg-[#22c55e] text-white rounded text-xs font-medium shadow-sm">1</button>
                        <button className="px-2.5 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-600">2</button>
                        <button className="px-2.5 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-600">3</button>
                        <button className="px-2.5 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-600">4</button>
                        <button className="px-2.5 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-600">5</button>
                        <button className="px-2.5 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-600">6</button>
                        <button className="px-2.5 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-600">7</button>
                        <button className="px-2.5 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-600">8</button>
                        <button className="px-2.5 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-600">9</button>
                        <button className="px-2.5 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-600">10</button>
                        <button className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 text-xs hover:bg-gray-300 dark:hover:bg-gray-600">»</button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default BulkCollectionPage;
