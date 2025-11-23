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

const SearchAndFilter = () => (
    <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search records..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium shadow-sm">
            <Filter size={16} />
            Filters
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium shadow-sm ml-auto">
            <Download size={16} />
            Export
        </button>
    </div>
);

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

// --- Customers Page ---
const CustomersPage = () => {
  const { customers, loading, error } = useData();
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);

  useEffect(() => {
    setFilteredCustomers(customers);
  }, [customers]);

  // Stats Card Component for Customers Page
  const CustomerStatCard = ({ label, value, icon: Icon, colorClass, subText }: any) => (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between min-h-[100px]">
        <div>
            <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 w-fit mb-3`}>
                <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
        </div>
        {subText && (
             <div className="text-[10px] text-gray-400 mt-1 cursor-pointer hover:text-blue-600 flex items-center gap-1">
                {subText}
             </div>
        )}
    </div>
  );

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-2 space-y-6">
        <PageHeader 
            title="Customer Management" 
            description="Manage residential, commercial, and industrial waste generators." 
        />
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-2 space-y-6">
        <PageHeader 
            title="Customer Management" 
            description="Manage residential, commercial, and industrial waste generators." 
        />
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          Error loading data: {error}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-2 space-y-6">
        <PageHeader 
            title="Customer Management" 
            description="Manage residential, commercial, and industrial waste generators." 
        />

        {/* Top Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CustomerStatCard 
                label="Residential" 
                value={customers.filter(c => c.propertyType === 'Residential').length || "0"} 
                icon={Home} 
                colorClass="bg-orange-500 text-orange-500"
                subText="View More"
            />
            <CustomerStatCard 
                label="Commercial" 
                value={customers.filter(c => c.propertyType === 'Commercial').length || "0"} 
                icon={Briefcase} 
                colorClass="bg-red-400 text-red-400"
                subText="View More"
            />
            <CustomerStatCard 
                label="Industrial" 
                value={customers.filter(c => c.propertyType === 'Industrial').length || "0"} 
                icon={Factory} 
                colorClass="bg-blue-500 text-blue-500"
                subText="View More"
            />
            <CustomerStatCard 
                label="Institutional" 
                value={customers.filter(c => c.propertyType === 'Institutional').length || "0"} 
                icon={Building2} 
                colorClass="bg-purple-500 text-purple-500"
                subText="View More"
            />
        </div>

        {/* POI Distribution Banner (Features only) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-0 overflow-hidden flex flex-col md:flex-row h-auto md:h-64">
             <div className="p-4 flex flex-col justify-center min-w-[200px] border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                        <Layers size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">0 / 0</h3>
                        <p className="text-xs text-gray-500">Wards / Customer</p>
                    </div>
                 </div>
                 <p className="text-[10px] text-blue-600 cursor-pointer hover:underline mt-2">View Detailed Report</p>
             </div>
             <div className="flex-1 flex flex-col md:flex-row">
                  {/* Visual Layout for Distribution - Present Month */}
                  <div className="flex-1 bg-[#22c55e] p-6 flex flex-col items-center justify-center text-white text-center hover:bg-[#16a34a] transition-colors cursor-pointer relative group">
                      <span className="font-medium">Present Month</span>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                   {/* Last Month */}
                  <div className="flex-1 bg-[#fbbf24] p-6 flex flex-col items-center justify-center text-white text-center hover:bg-[#f59e0b] transition-colors cursor-pointer relative group">
                      <span className="font-medium">Last Month</span>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                  {/* Right Split */}
                  <div className="flex-1 flex flex-col">
                      <div className="flex-1 bg-[#0ea5e9] p-4 flex items-center justify-center text-white text-center border-b border-white/20">
                          <span className="font-medium text-sm">2-3 Month</span>
                      </div>
                      <div className="flex-1 bg-[#a855f7] p-4 flex items-center justify-center text-white text-center">
                           <span className="font-medium text-sm">4-6 Month</span>
                      </div>
                  </div>
                  <div className="flex-1 bg-white p-6 flex flex-col items-center justify-center text-gray-400 text-center border-l border-gray-100">
                      <span className="font-medium">Never</span>
                  </div>
             </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <div className="grid grid-cols-2 md:grid-cols-5 gap-2 w-full md:w-auto">
                 {/* Filters */}
                 {['Zone', 'All Wards', 'Property Type', 'Supervisor', 'Last Payment Period'].map((placeholder) => (
                     <div key={placeholder} className="relative">
                         <select className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-green-500 cursor-pointer">
                             <option>{placeholder}</option>
                         </select>
                         <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                     </div>
                 ))}
             </div>
             
             <div className="flex gap-2 w-full md:w-auto justify-end">
                 <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50">
                     <Calendar size={14} /> Date Filter
                 </button>
                 <button className="flex items-center gap-1.5 px-4 py-2 bg-[#10b981] text-white text-xs font-medium rounded-lg hover:bg-[#059669] shadow-sm shadow-green-200">
                     <Search size={14} /> Search
                 </button>
             </div>
        </div>

        {/* Main Actions */}
        <div className="flex justify-end gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2 bg-[#22c55e] text-white text-xs font-bold rounded-lg hover:bg-[#16a34a] shadow-sm transition-transform active:scale-95">
                <Plus size={16} /> Add Customer
            </button>
             <button className="flex items-center gap-1.5 px-4 py-2 bg-[#22c55e] text-white text-xs font-bold rounded-lg hover:bg-[#16a34a] shadow-sm transition-transform active:scale-95">
                <FileText size={16} /> Generate Invoice
            </button>
             <button className="flex items-center gap-1.5 px-4 py-2 bg-[#22c55e] text-white text-xs font-bold rounded-lg hover:bg-[#16a34a] shadow-sm transition-transform active:scale-95">
                <Download size={16} /> Export
            </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead className="bg-[#22c55e] text-white">
                        <tr>
                            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider w-10 border-r border-green-400/30 text-center">
                                <div className="flex justify-center">▶</div>
                            </th>
                            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">S.No.</th>
                            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">Customer ID</th>
                            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">Customer Name</th>
                            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">Property Type</th>
                            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">Ward</th>
                            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">Mobile</th>
                            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">Email</th>
                            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">KYC Status</th>
                            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">Last Payment</th>
                            <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider border-r border-green-400/30">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((customer, index) => (
                                <tr key={customer.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 border-r border-gray-100 text-center text-xs">
                                        <div className="flex justify-center">
                                            <input type="checkbox" className="rounded text-green-500 focus:ring-green-500" />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-100 text-xs">{index + 1}</td>
                                    <td className="px-4 py-3 border-r border-gray-100 text-xs font-medium">{customer.customerId || 'N/A'}</td>
                                    <td className="px-4 py-3 border-r border-gray-100 text-xs">{customer.name || 'N/A'}</td>
                                    <td className="px-4 py-3 border-r border-gray-100 text-xs">
                                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                            {customer.propertyType || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-100 text-xs">{customer.ward || 'N/A'}</td>
                                    <td className="px-4 py-3 border-r border-gray-100 text-xs">{customer.phone || 'N/A'}</td>
                                    <td className="px-4 py-3 border-r border-gray-100 text-xs">{customer.email || 'N/A'}</td>
                                    <td className="px-4 py-3 border-r border-gray-100 text-xs">
                                        {customer.kycStatus === 'Completed' ? (
                                            <span className="flex items-center gap-1 text-green-600">
                                                <CheckCircle size={14} /> Completed
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-orange-500">
                                                <Clock size={14} /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 border-r border-gray-100 text-xs">N/A</td>
                                    <td className="px-4 py-3 border-r border-gray-100 text-xs">
                                        <div className="flex gap-2">
                                            <button className="p-1.5 rounded hover:bg-gray-200 text-gray-600">
                                                <Edit size={14} />
                                            </button>
                                            <button className="p-1.5 rounded hover:bg-gray-200 text-gray-600">
                                                <MoreHorizontal size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={11} className="px-4 py-8 border-r border-gray-100 text-center">
                                    <NoDataView message="No customer records found" illustration={PeopleIllustration} />
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
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
                <div className="flex gap-1">
                    <button className="px-2 py-1 bg-gray-200 rounded text-gray-500 text-xs disabled:opacity-50">«</button>
                    <button className="px-2.5 py-1 bg-[#22c55e] text-white rounded text-xs font-medium shadow-sm">1</button>
                    <button className="px-2.5 py-1 bg-white border border-gray-300 text-gray-600 rounded text-xs hover:bg-gray-50">2</button>
                    <button className="px-2.5 py-1 bg-white border border-gray-300 text-gray-600 rounded text-xs hover:bg-gray-50">3</button>
                    <button className="px-2 py-1 bg-gray-200 rounded text-gray-600 text-xs hover:bg-gray-300">»</button>
                </div>
            </div>
        </div>
    </motion.div>
  );
};

export default CustomersPage;