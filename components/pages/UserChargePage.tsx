import React, { useEffect, useState } from 'react';
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
                <Illustration size={32} className="text-gray-400" />
            )}
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{message}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
            There is currently no data to display in this section. New records will appear here automatically.
        </p>
    </div>
);

// --- User Charge Page ---
const UserChargePage = () => {
    const { userCharges, customers, loading, error } = useData();
    const [filteredCharges, setFilteredCharges] = useState<any[]>([]);

    useEffect(() => {
        setFilteredCharges(userCharges);
    }, [userCharges]);

    // Stats Data Structure (Empty/Zero for now)
    const collectionStats = [
        { title: 'Today', amount: `₹${userCharges.filter(c => new Date(c.date).toDateString() === new Date().toDateString()).reduce((sum, c) => sum + (c.amount || 0), 0)}`, receipt: userCharges.filter(c => new Date(c.date).toDateString() === new Date().toDateString()).length, icon: Calendar, colorClass: 'text-purple-600 bg-purple-600' },
        { title: 'Yesterday', amount: `₹${userCharges.filter(c => new Date(c.date).toDateString() === new Date(Date.now() - 86400000).toDateString()).reduce((sum, c) => sum + (c.amount || 0), 0)}`, receipt: userCharges.filter(c => new Date(c.date).toDateString() === new Date(Date.now() - 86400000).toDateString()).length, icon: Clock, colorClass: 'text-pink-500 bg-pink-500' },
        { title: 'Till Month', amount: `₹${userCharges.filter(c => new Date(c.date).getMonth() === new Date().getMonth() && new Date(c.date).getFullYear() === new Date().getFullYear()).reduce((sum, c) => sum + (c.amount || 0), 0)}`, receipt: userCharges.filter(c => new Date(c.date).getMonth() === new Date().getMonth() && new Date(c.date).getFullYear() === new Date().getFullYear()).length, icon: Calendar, colorClass: 'text-green-600 bg-green-600' },
        { title: 'Previous Month', amount: `₹${userCharges.filter(c => new Date(c.date).getMonth() === new Date().getMonth() - 1 && new Date(c.date).getFullYear() === new Date().getFullYear()).reduce((sum, c) => sum + (c.amount || 0), 0)}`, receipt: userCharges.filter(c => new Date(c.date).getMonth() === new Date().getMonth() - 1 && new Date(c.date).getFullYear() === new Date().getFullYear()).length, icon: Calendar, colorClass: 'text-blue-600 bg-blue-600' },
    ];

    const CollectionStatCard = ({ title, amount, receipt, icon: Icon, colorClass }: any) => {
        const safeColorClass = colorClass || "text-gray-500 bg-gray-500";
        const textColor = safeColorClass.split(' ')[0];

        return (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2.5 rounded-lg ${safeColorClass} bg-opacity-10 w-fit`}>
                        <Icon size={20} className={textColor} />
                    </div>
                    <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">{title}</span>
                </div>
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Amount</p>
                        <h3 className={`text-xl font-bold ${textColor}`}>{amount}</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Receipt</p>
                        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">{receipt}</h3>
                    </div>
                </div>
                <div className="pt-2 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                    <span>View Details</span>
                    <ArrowRight size={12} />
                </div>
            </div>
        );
    };

    const PropertyTypeCard = ({ label, amount, icon: Icon, colorClass }: any) => {
        const safeColorClass = colorClass || "text-gray-500 bg-gray-500";
        const textColor = safeColorClass.split(' ')[0];

        return (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${safeColorClass} bg-opacity-10`}>
                        <Icon size={20} className={textColor} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{amount}</h3>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{label}</p>
                    </div>
                </div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 self-end">Month-till-date</div>
            </div>
        );
    };

    if (loading) {
        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 p-2">
                <PageHeader title="User Charge Collection" description="Monitor daily collections, UCC, and property-wise revenue." />
                <div className="flex justify-center items-center h-64">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 p-2">
                <PageHeader title="User Charge Collection" description="Monitor daily collections, UCC, and property-wise revenue." />
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                    Error loading data: {error}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 p-2">
            <PageHeader title="User Charge Collection" description="Monitor daily collections, UCC, and property-wise revenue." />

            {/* Total Collection Section */}
            <section>
                <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-3 flex items-center gap-2">
                    Total Collection <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">(UCC + On-Demand UCC)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {collectionStats.map((stat, i) => (
                        <CollectionStatCard key={i} {...stat} />
                    ))}
                </div>
            </section>

            {/* UCC Section */}
            <section>
                <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-3">UCC</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {collectionStats.map((stat, i) => (
                        <CollectionStatCard key={`ucc-${i}`} {...stat} />
                    ))}
                </div>
            </section>

            {/* Property Type Section */}
            <section>
                <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-3">Collection by Property Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <PropertyTypeCard label="Residential" amount={`₹${customers.filter(c => c.propertyType === 'Residential').reduce((sum, c) => sum + (userCharges.find(uc => uc.customerId === c.customerId)?.amount || 0), 0)}`} icon={Home} colorClass="text-orange-500 bg-orange-500" />
                    <PropertyTypeCard label="Commercial" amount={`₹${customers.filter(c => c.propertyType === 'Commercial').reduce((sum, c) => sum + (userCharges.find(uc => uc.customerId === c.customerId)?.amount || 0), 0)}`} icon={Briefcase} colorClass="text-red-500 bg-red-500" />
                    <PropertyTypeCard label="Industrial" amount={`₹${customers.filter(c => c.propertyType === 'Industrial').reduce((sum, c) => sum + (userCharges.find(uc => uc.customerId === c.customerId)?.amount || 0), 0)}`} icon={Factory} colorClass="text-blue-500 bg-blue-500" />
                    <PropertyTypeCard label="Institutional" amount={`₹${customers.filter(c => c.propertyType === 'Institutional').reduce((sum, c) => sum + (userCharges.find(uc => uc.customerId === c.customerId)?.amount || 0), 0)}`} icon={Building2} colorClass="text-purple-500 bg-purple-500" />
                </div>
            </section>

            {/* On Demand UCC Section */}
            <section>
                <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-3">On Demand UCC</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {collectionStats.map((stat, i) => (
                        // Make these look slightly different or 0 for on-demand
                        <CollectionStatCard key={`od-${i}`} {...stat} amount="₹0" receipt={0} />
                    ))}
                </div>
            </section>

            {/* Reports & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button className="px-4 py-2 bg-white dark:bg-gray-700 text-[#10b981] shadow-sm rounded-md text-sm font-bold">UCC</button>
                    <button className="px-4 py-2 text-gray-500 dark:text-gray-400 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600">On Demand UCC</button>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 text-xs font-medium rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/30">
                        <FileText size={14} /> Collector Report
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 text-xs font-medium rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/30">
                        <Clock size={14} /> Hourly Report
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 text-xs font-medium rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/30">
                        <AlertTriangle size={14} /> Defaulter Report
                    </button>
                </div>
            </div>

            {/* Filters & Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto">
                        {['Zone', 'All Wards', 'Property Type', 'Supervisor'].map(f => (
                            <div key={f} className="relative">
                                <select className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-green-500 cursor-pointer">
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
                        <button className="flex items-center gap-1.5 px-4 py-2 bg-[#10b981] text-white text-xs font-medium rounded-lg hover:bg-[#059669] shadow-sm">
                            <Search size={14} /> Search All
                        </button>
                        <button className="flex items-center gap-1.5 px-4 py-2 bg-[#10b981] text-white text-xs font-medium rounded-lg hover:bg-[#059669] shadow-sm">
                            <Download size={14} /> Export
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead className="bg-[#10b981] text-white">
                            <tr>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider w-10 border-r border-green-400/30 text-center">
                                    <div className="flex justify-center">
                                        <input type="checkbox" className="rounded text-white focus:ring-white" />
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">S.No.</th>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">Receipt No</th>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">Customer ID</th>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">Customer Name</th>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">Ward</th>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">Amount</th>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">Payment Mode</th>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">Date</th>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">Status</th>
                                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredCharges.length > 0 ? (
                                filteredCharges.map((charge, index) => {
                                    const customer = customers.find(c => c.customerId === charge.customerId);
                                    return (
                                        <tr key={charge.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-700 text-center text-xs">
                                                <input type="checkbox" className="rounded text-green-500 focus:ring-green-500" />
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-700 text-xs dark:text-gray-300">{index + 1}</td>
                                            <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-700 text-xs font-medium dark:text-gray-200">{charge.receiptNumber || 'N/A'}</td>
                                            <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-700 text-xs dark:text-gray-300">{charge.customerId || 'N/A'}</td>
                                            <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-700 text-xs dark:text-gray-300">{customer?.name || 'N/A'}</td>
                                            <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-700 text-xs dark:text-gray-300">{customer?.ward || 'N/A'}</td>
                                            <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-700 text-xs dark:text-gray-300">₹{charge.amount || 0}</td>
                                            <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-700 text-xs">
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs dark:text-gray-300">
                                                    {charge.paymentMode || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-700 text-xs dark:text-gray-300">
                                                {charge.date ? new Date(charge.date).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-700 text-xs">
                                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs">
                                                    Paid
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-100 dark:border-gray-700 text-xs">
                                                <div className="flex gap-2">
                                                    <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400">
                                                        <Edit size={14} />
                                                    </button>
                                                    <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400">
                                                        <MoreHorizontal size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={11} className="px-4 py-8 border-r border-gray-100 dark:border-gray-700 text-center">
                                        <NoDataView message="No user charge records found" illustration={WalletIllustration} />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <NoDataView message="No user charge transactions found" illustration={WalletIllustration} />

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

export default UserChargePage;