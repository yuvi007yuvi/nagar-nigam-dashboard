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
import { useData } from '../../services/DataContext';
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

const WeighmentPage = () => {
    const { weighments, loading } = useData();

    const weighStats = [
        { label: 'Total Weight (Today)', value: `${(weighments.reduce((sum, e) => sum + (e.netWeight || 0), 0) / 1000).toFixed(2)} MT`, icon: Scale, color: 'bg-emerald-500' },
        { label: 'Total Trips', value: weighments.length.toString(), icon: Truck, color: 'bg-blue-500' },
        { label: 'Avg. Payload', value: `${(weighments.reduce((sum, e) => sum + (e.netWeight || 0), 0) / (weighments.length || 1) / 1000).toFixed(2)} MT`, icon: Layers, color: 'bg-amber-500' },
        { label: 'Rejected Loads', value: '0', icon: AlertTriangle, color: 'bg-red-500' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-2">
            <PageHeader title="Weighment Monitoring" description="Real-time tracking of waste dumping and weighbridge operations." />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {weighStats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stat.value}</h3>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10 dark:bg-opacity-20 text-white shadow-sm`}>
                            <stat.icon size={24} className={stat.color.replace('bg-', 'text-')} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Hourly Chart Placeholder */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white">Weighment Trends</h3>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Hourly breakdown of waste collection</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"><TrendingUp size={16} /></button>
                        </div>
                    </div>

                    <div className="flex-1 flex items-end justify-between gap-3 px-2 pb-2">
                        {[15, 30, 45, 60, 40, 75, 50, 85, 65, 45, 30, 20, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end group h-full max-h-[200px] relative cursor-pointer">
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                    {i}:00 - {h}%
                                </div>
                                <div
                                    className="w-full bg-emerald-100 dark:bg-emerald-900/40 group-hover:bg-emerald-400 dark:group-hover:bg-emerald-500 transition-all duration-300 rounded-t-[2px]"
                                    style={{ height: h > 0 ? `${h}%` : '4px' }}
                                ></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-2 px-1 font-mono uppercase">
                        <span>00:00</span>
                        <span>06:00</span>
                        <span>12:00</span>
                        <span>18:00</span>
                        <span>23:59</span>
                    </div>
                </div>
            </div>

            {/* Filter & Data Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto">
                        {['Zone', 'Ward', 'Vehicle Type', 'Weighbridge'].map(f => (
                            <div key={f} className="relative">
                                <select className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-green-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    <option>{f}</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 w-full md:w-auto justify-end">
                        <button className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                            <Calendar size={14} /> Date
                        </button>
                        <button className="flex items-center gap-1.5 px-4 py-2 bg-[#10b981] text-white text-xs font-medium rounded-lg hover:bg-[#059669] shadow-sm shadow-green-200 transition-all active:scale-95">
                            <Search size={14} /> Search
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                            <Download size={14} /> Export
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="bg-[#10b981] text-white">
                            <tr>
                                {['S.No', 'Ticket No', 'Vehicle No', 'Ward', 'Transporter', 'Gross Wt(Kg)', 'Tare Wt(Kg)', 'Net Wt(Kg)', 'Material', 'Time In', 'Time Out', 'Status'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap border-r border-green-400/30 last:border-none">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-green-50">
                                            {h} <div className="flex flex-col"><ChevronDown size={8} className="rotate-180 -mb-0.5" /><ChevronDown size={8} /></div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {weighments.map((w, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-xs text-gray-600 dark:text-gray-300">
                                    <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700">{idx + 1}</td>
                                    <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700 font-bold text-gray-800 dark:text-gray-200">TKT-{1050 + idx}</td>
                                    <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700 font-black">{w.vehicleId}</td>
                                    <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700">Ward 01</td>
                                    <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700">Nagar Nigam</td>
                                    <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700 font-bold">{w.grossWeight}</td>
                                    <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700 text-gray-400 font-medium">{w.tareWeight}</td>
                                    <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700 text-emerald-600 font-black">{w.netWeight}</td>
                                    <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700 italic">{w.type || 'Solid Waste'}</td>
                                    <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700">09:12 AM</td>
                                    <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700">{w.time || '10:05 AM'}</td>
                                    <td className="px-4 py-4">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-tighter">Accepted</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {weighments.length === 0 && (
                    <NoDataView message="No weighment transactions found" illustration={BinIllustration} />
                )}

                {/* Pagination */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
                    <div className="relative">
                        <select className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-green-500">
                            <option>10</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                    <div className="flex gap-1">
                        <button className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-400 text-xs disabled:opacity-50">«</button>
                        <button className="px-2.5 py-1 bg-[#10b981] text-white rounded text-xs font-medium shadow-sm">1</button>
                        <button className="px-2.5 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-600">2</button>
                        <button className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 text-xs hover:bg-gray-300 dark:hover:bg-gray-600">»</button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default WeighmentPage;
