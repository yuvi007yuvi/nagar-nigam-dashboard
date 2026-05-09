import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, Truck, Users, AlertTriangle, 
  ClipboardCheck, Package, DollarSign, 
  BarChart3, Plus, Settings, ChevronRight,
  ShieldCheck, History, Fuel, Gauge
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, 
  PieChart, Pie, Cell 
} from 'recharts';

import MaintenanceDashboardOverview from './MaintenanceDashboardOverview'; // Extracting overview later if needed
import VehicleManagement from './VehicleManagement';
import DriverManagement from './DriverManagement';
import MaintenanceWorkflow from './MaintenanceWorkflow';
import InventoryManagement from './InventoryManagement';
import MaintenanceReports from './MaintenanceReports';
import InspectionTripManagement from './InspectionTripManagement';

// --- Sub-components (to be moved to separate files later) ---

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-125`} />
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color.replace('bg-', 'bg-opacity-10 text-')}`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{value}</h3>
    </div>
  </motion.div>
);

const MaintenanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { title: 'Total Vehicles', value: '124', icon: Truck, color: 'bg-blue-500', trend: 12 },
    { title: 'In Service', value: '98', icon: ShieldCheck, color: 'bg-emerald-500', trend: 5 },
    { title: 'Under Repair', value: '18', icon: Wrench, color: 'bg-amber-500', trend: -2 },
    { title: 'Breakdowns', value: '8', icon: AlertTriangle, color: 'bg-rose-500', trend: 15 },
  ];

  const chartData = [
    { name: 'Mon', expense: 4000, fuel: 2400 },
    { name: 'Tue', expense: 3000, fuel: 1398 },
    { name: 'Wed', expense: 2000, fuel: 9800 },
    { name: 'Thu', expense: 2780, fuel: 3908 },
    { name: 'Fri', expense: 1890, fuel: 4800 },
    { name: 'Sat', expense: 2390, fuel: 3800 },
    { name: 'Sun', expense: 3490, fuel: 4300 },
  ];

  const tickets = [
    { id: 'TIC-001', vehicle: 'UP81-AT-1234', issue: 'Engine Overheating', priority: 'High', status: 'Pending Approval' },
    { id: 'TIC-002', vehicle: 'UP81-BT-5678', issue: 'Brake Pad Wear', priority: 'Medium', status: 'Assigned' },
    { id: 'TIC-003', vehicle: 'UP81-CT-9012', issue: 'Tyre Burst', priority: 'Emergency', status: 'Repairing' },
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50/50 dark:bg-gray-900/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white font-display">Maintenance ERP</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest font-black">Fleet Operations & Workflow Management</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('workflow')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus size={18} />
            Raise Complaint
          </button>
          <button className="p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 shadow-sm">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['Overview', 'Fleet', 'Drivers', 'Monthly', 'Workflow', 'Inventory', 'Reports'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
              ${activeTab === tab.toLowerCase() 
                ? 'bg-gray-900 text-white shadow-md' 
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 hover:bg-gray-50'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <StatCard key={idx} {...stat} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Chart */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <BarChart3 className="text-emerald-500" size={18} />
                    Expense & Fuel Trends
                  </h3>
                  <select className="bg-gray-50 dark:bg-gray-700 border-none rounded-lg text-xs font-bold px-3 py-1.5">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                  </select>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Area type="monotone" dataKey="expense" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                      <Area type="monotone" dataKey="fuel" stroke="#3b82f6" strokeWidth={3} fillOpacity={0} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pending Tickets */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <ClipboardCheck className="text-amber-500" size={18} />
                    Pending Tickets
                  </h3>
                  <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">View All</button>
                </div>
                <div className="space-y-4 flex-1">
                  {tickets.map((ticket, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 group hover:border-emerald-200 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{ticket.id}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full 
                          ${ticket.priority === 'Emergency' ? 'bg-rose-100 text-rose-600' : 
                            ticket.priority === 'High' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-1">{ticket.vehicle}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.issue}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-600">{ticket.status}</span>
                        <ChevronRight size={14} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Reminders / Expiry */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                  <AlertTriangle className="text-rose-500" size={18} />
                  Critical Reminders
                </h3>
                <div className="space-y-4">
                  {[
                    { title: 'Insurance Expiry', vehicle: 'UP81-AT-1234', date: 'In 2 days', color: 'rose' },
                    { title: 'Service Due', vehicle: 'UP81-BT-5678', date: 'Overdue by 1 day', color: 'amber' },
                    { title: 'PUC Expiry', vehicle: 'UP81-CT-9012', date: 'In 5 days', color: 'blue' },
                  ].map((rem, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className={`w-2 h-10 rounded-full bg-${rem.color}-500`} />
                      <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-wider">{rem.title}</p>
                        <p className="text-sm font-bold text-gray-800">{rem.vehicle}</p>
                        <p className={`text-[10px] font-bold text-${rem.color}-600 mt-0.5`}>{rem.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inventory Status */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                  <Package className="text-blue-500" size={18} />
                  Inventory Low Stock
                </h3>
                <div className="space-y-4">
                  {[
                    { item: 'Engine Oil (10W-40)', stock: '5L', min: '20L', progress: 25 },
                    { item: 'Brake Pads (Rear)', stock: '2 sets', min: '10 sets', progress: 20 },
                    { item: 'Air Filter', stock: '3 units', min: '15 units', progress: 15 },
                  ].map((inv, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-gray-700">{inv.item}</span>
                        <span className="font-black text-rose-500">{inv.stock} left</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${inv.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-100 transition-colors border border-gray-100">
                  Open Purchase Request
                </button>
              </div>

              {/* Quick Analytics */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                  <Gauge className="text-purple-500" size={18} />
                  Fleet Efficiency
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100">
                    <p className="text-[10px] font-black text-purple-400 uppercase mb-1">Avg Mileage</p>
                    <p className="text-xl font-black text-purple-700">12.5 <span className="text-[10px]">km/l</span></p>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100">
                    <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Cost/KM</p>
                    <p className="text-xl font-black text-blue-700">₹4.20</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-400 uppercase mb-1">Uptime</p>
                    <p className="text-xl font-black text-emerald-700">92%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100">
                    <p className="text-[10px] font-black text-amber-400 uppercase mb-1">Downtime</p>
                    <p className="text-xl font-black text-amber-700">18h <span className="text-[10px]">avg</span></p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'fleet' && (
          <motion.div
            key="fleet"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <VehicleManagement />
          </motion.div>
        )}

        {activeTab === 'drivers' && (
          <motion.div
            key="drivers"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <DriverManagement />
          </motion.div>
        )}

        {activeTab === 'monthly' && (
          <motion.div
            key="monthly"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <InspectionTripManagement />
          </motion.div>
        )}

        {activeTab === 'workflow' && (
          <motion.div
            key="workflow"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <MaintenanceWorkflow />
          </motion.div>
        )}

        {activeTab === 'inventory' && (
          <motion.div
            key="inventory"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <InventoryManagement />
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <MaintenanceReports />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MaintenanceDashboard;
