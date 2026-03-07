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

const FuelPage = () => {
    const { fuelEntries, loading } = useData();

    // Stats data structure
    const fuelStats = [
        { label: 'Total Fuel Consumed', value: `${fuelEntries.reduce((sum, e) => sum + (e.quantity || 0), 0)} Ltrs`, icon: Droplets, color: 'bg-blue-500', trend: '+12.5%' },
        { label: 'Total Cost', value: `₹${fuelEntries.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString()}`, icon: IndianRupee, color: 'bg-red-500', trend: '+8.2%' },
        { label: 'Avg. Mileage', value: '14.5 Km/L', icon: Gauge, color: 'bg-green-500', trend: '+2.1%' },
        { label: 'Refills Count', value: fuelEntries.length.toString(), icon: Fuel, color: 'bg-purple-500', trend: '+3' },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-2">
            <PageHeader title="Fuel Management" description="Monitor fuel consumption, costs, and vehicle efficiency." />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {fuelStats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stat.value}</h3>
                            <div className="flex items-center gap-1 mt-2">
                                <span className="text-[10px] font-medium text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">{stat.trend}</span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500">vs last month</span>
                            </div>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10 dark:bg-opacity-20 text-white`}>
                            <stat.icon size={24} className={stat.color.replace('bg-', 'text-')} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Visuals / Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm min-h-[300px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800 dark:text-white">Consumption Trend</h3>
                        <select className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs rounded-lg px-2 py-1 outline-none text-gray-600 dark:text-gray-300">
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    {/* Placeholder Chart */}
                    <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                        No consumption data available
                    </div>

                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm min-h-[300px] flex flex-col">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-6">Fuel by Vehicle Type</h3>
                    <div className="flex-1 flex items-center justify-center relative">
                        {/* Donut Chart Placeholder */}
                        <div className="w-40 h-40 rounded-full border-8 border-gray-100 dark:border-gray-700 border-t-orange-500 border-r-blue-500 border-b-green-500 border-l-purple-500 rotate-45"></div>
                        <div className="absolute text-center">
                            <span className="block text-2xl font-bold text-gray-700 dark:text-gray-200">100%</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {[{ l: 'Trucks', c: 'bg-blue-500' }, { l: 'Tractors', c: 'bg-orange-500' }, { l: 'Loaders', c: 'bg-green-500' }, { l: 'Jeeps', c: 'bg-purple-500' }].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span className={`w-2 h-2 rounded-full ${item.c}`}></span>
                                {item.l}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filter & Action Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto">
                    {['All Vehicles', 'Fuel Station', 'Driver', 'Ward'].map(f => (
                        <div key={f} className="relative">
                            <select className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-green-500">
                                <option>{f}</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 w-full md:w-auto justify-end">
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">
                        <Calendar size={14} /> Date Filter
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-[#10b981] text-white text-xs font-bold rounded-lg hover:bg-[#059669] shadow-sm">
                        <Plus size={16} /> Add Fuel Entry
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">
                        <Download size={14} /> Export
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="bg-[#10b981] text-white">
                            <tr>
                                {['S.No', 'Vehicle No', 'Vehicle Type', 'Driver Name', 'Refill Date', 'Station Name', 'Quantity(L)', 'Amount(₹)', 'Odometer(KM)', 'Mileage', 'Receipt'].map((h) => (
                                    <th key={h} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap border-r border-green-400/30 last:border-none">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {fuelEntries.map((e, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-xs text-gray-600 dark:text-gray-300">
                                    <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700">{idx + 1}</td>
                                    <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700 font-bold text-gray-800 dark:text-gray-200">{e.vehicleId}</td>
                                    <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700">Auto Tipper</td>
                                    <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700">Karan Singh</td>
                                    <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700">{e.date}</td>
                                    <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700 italic">{e.station || 'Bharat Petroleum'}</td>
                                    <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700 font-black">{e.quantity} L</td>
                                    <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700 text-red-600 font-bold">₹{e.amount}</td>
                                    <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700">12,450</td>
                                    <td className="px-4 py-4 border-r border-gray-100 dark:border-gray-700 text-green-600 font-bold">14.2</td>
                                    <td className="px-4 py-4 text-blue-600 underline cursor-pointer">{e.slipNo || 'S-001'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {fuelEntries.length === 0 && (
                    <NoDataView message="No fuel records found" illustration={TruckIllustration} />
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

export default FuelPage;
