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

// --- Attendance Page ---
const AttendancePage = () => {
    // Stats for Top Cards
    const attendanceStats = [
        {
            title: 'Today',
            data: [{ label: 'Present', val: '0/0' }, { label: 'Absent', val: '0/0' }, { label: 'Missed Punch', val: '0' }],
            icon: CalendarCheck,
            color: 'text-purple-600 bg-purple-100'
        },
        {
            title: 'Yesterday',
            data: [{ label: 'Present', val: '0/0' }, { label: 'Absent', val: '0/0' }, { label: 'Missed Punch', val: '0' }],
            icon: Clock,
            color: 'text-pink-500 bg-pink-100'
        },
        {
            title: 'Till Month',
            data: [{ label: 'Present', val: '0%' }, { label: 'Absent', val: '0%' }, { label: 'Missed Punch', val: '0' }],
            icon: Calendar,
            color: 'text-green-600 bg-green-100'
        },
        {
            title: 'Previous Month',
            data: [{ label: 'Present', val: '0%' }, { label: 'Absent', val: '0%' }, { label: 'Missed Punch', val: '0' }],
            icon: Calendar,
            color: 'text-blue-600 bg-blue-100'
        },
    ];

    const AttendanceStatCard = ({ title, data, icon: Icon, color }: any) => (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
                    <Icon size={18} className={color.split(' ')[0]} />
                </div>
                <h4 className="font-bold text-gray-800 dark:text-white text-sm">{title}</h4>
            </div>
            <div className="space-y-2">
                {data.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">{item.label}</span>
                        <span className={`font-bold ${item.label === 'Present' ? 'text-gray-800 dark:text-gray-200' : item.label === 'Absent' ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>{item.val}</span>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-2 border-t border-gray-50 dark:border-gray-700 text-[10px] text-gray-400 dark:text-gray-500 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1">
                View More <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[8px]">@</div>
            </div>
        </div>
    );

    // Empty data for Table (removing mock data)
    const staffData = [];

    // Helper to generate status grid
    const getStatusForDay = (pattern: string, day: number) => {
        // Just cycling through the pattern string for demo purposes
        const char = pattern[day % pattern.length];
        if (char === 'P') return { label: 'P', color: 'bg-green-600' };
        if (char === 'A') return { label: 'A', color: 'bg-red-600' };
        if (char === 'M') return { label: 'M', color: 'bg-blue-600' };
        return { label: '-', color: 'bg-gray-200' };
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-2">
            <PageHeader title="Attendance" description="Daily staff attendance tracking and monthly logs." />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {attendanceStats.map((stat, i) => (
                    <AttendanceStatCard key={i} {...stat} />
                ))}
            </div>

            {/* Filter Header Section */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Attendance Calender NOV - 2025</h3>
                    <button className="flex items-center gap-1 bg-[#22c55e] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-[#16a34a] shadow-sm">
                        <Download size={14} /> Export
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-end lg:items-center">
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 w-full lg:w-auto flex-1">
                        {/* Date Picker Placeholder */}
                        <div className="relative">
                            <input type="text" value="11/2025" readOnly className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none" />
                        </div>
                        <select className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 shadow-sm">
                            <option>Zone</option>
                        </select>
                        <select className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 shadow-sm">
                            <option>Wards</option>
                        </select>
                        <select className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 shadow-sm">
                            <option>Designation</option>
                        </select>
                        <select className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 shadow-sm">
                            <option>Shift</option>
                        </select>
                    </div>
                    <div className="w-full lg:w-auto">
                        <button className="w-full lg:w-auto flex items-center justify-center gap-1.5 px-6 py-2 bg-[#22c55e] text-white text-xs font-bold rounded-lg hover:bg-[#16a34a] shadow-sm">
                            <Search size={14} /> Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-end gap-4 text-[10px] text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500"></span> Present</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-600"></span> Absent</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500"></span> Missed Punch</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-400"></span> Half-Day</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-500"></span> Present-Day</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"></span> N/A</div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead className="bg-[#22c55e] text-white">
                            <tr>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider w-10 border-r border-green-400/30 text-center">
                                    <div className="flex justify-center">▶</div>
                                </th>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">S.No.</th>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">Employee Pic</th>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">Employee Name</th>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">Employee ID</th>
                                <th className="px-2 py-3 text-[10px] font-bold uppercase tracking-wider border-r border-green-400/30 text-center">No. of Present</th>
                                <th className="px-2 py-3 text-[10px] font-bold uppercase tracking-wider border-r border-green-400/30 text-center">No. of Absent</th>
                                <th className="px-2 py-3 text-[10px] font-bold uppercase tracking-wider border-r border-green-400/30 text-center">No. of Missed Punch</th>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30 whitespace-nowrap">Calender View</th>
                                {/* Calendar Days Header (1-12 as per screenshot, extending to 15 for space) */}
                                {[...Array(12)].map((_, i) => (
                                    <th key={i} className="px-1 py-3 text-[10px] font-bold text-center border-r border-green-400/30 w-8">{i + 1}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {staffData.map((staff, idx) => (
                                <tr key={staff.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-4 py-3 text-center border-r border-gray-100 dark:border-gray-700"><span className="text-gray-400 text-xs">▶</span></td>
                                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 border-r border-gray-100 dark:border-gray-700">{idx + 1}</td>
                                    <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-700">
                                        {staff.img ? (
                                            <img src={staff.img} alt="emp" className="w-8 h-8 rounded-md object-cover shadow-sm" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600"><User size={16} /></div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-xs font-medium text-gray-700 dark:text-gray-200 border-r border-gray-100 dark:border-gray-700">{staff.name}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">{staff.empId}</td>
                                    <td className="px-2 py-3 text-xs text-center border-r border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300">{staff.present}</td>
                                    <td className="px-2 py-3 text-xs text-center border-r border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300">{staff.absent}</td>
                                    <td className="px-2 py-3 text-xs text-center border-r border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300">{staff.missed}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700 whitespace-nowrap">Nov-2025</td>
                                    {/* Calendar Grid Cells */}
                                    {[...Array(12)].map((_, i) => {
                                        const status = getStatusForDay(staff.statusPattern, i);
                                        return (
                                            <td key={i} className="px-1 py-3 text-center border-r border-gray-100 dark:border-gray-700">
                                                <div className={`w-5 h-5 mx-auto flex items-center justify-center rounded text-[9px] font-bold text-white ${status.color}`}>
                                                    {status.label}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            {/* Total Summary Row */}
                            <tr className="bg-gray-50 dark:bg-gray-700/30 font-bold text-xs text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
                                <td colSpan={9} className="px-4 py-3 text-right">Total Present</td>
                                {[...Array(12)].map((_, i) => (
                                    <td key={i} className="px-1 py-3 text-center border-l border-gray-200 dark:border-gray-700 text-[10px] text-gray-400 dark:text-gray-500">
                                        0
                                    </td>
                                ))}
                            </tr>
                            <tr className="bg-gray-50 dark:bg-gray-700/30 font-bold text-xs text-gray-600 dark:text-gray-300">
                                <td colSpan={9} className="px-4 py-3 text-right">Total Absent</td>
                                {[...Array(12)].map((_, i) => (
                                    <td key={i} className="px-1 py-3 text-center border-l border-gray-200 dark:border-gray-700 text-[10px] text-gray-400 dark:text-gray-500">
                                        0
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>

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
                        <button className="px-2.5 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded text-xs font-medium shadow-sm">1</button>
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

export default AttendancePage;
