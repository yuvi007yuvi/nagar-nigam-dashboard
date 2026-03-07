import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, Download, MoreHorizontal, MapPin,
  CheckCircle, XCircle, Clock, AlertTriangle, User,
  Fuel, Settings, Save, Bell, Inbox,
  Plus, Minus, FileText, ChevronDown, Calendar, ArrowRight,
  Home, Briefcase, Building2, Factory, Layers,
  IndianRupee, Gauge, Droplets, TrendingUp,
  Scale, Truck, WifiOff, PlayCircle, OctagonAlert, PauseCircle, StopCircle,
  CalendarCheck, Edit, MessageSquare, Sparkles
} from 'lucide-react';
import {
  TruckIllustration,
  WalletIllustration,
  MapIllustration,
  AlertIllustration,
  PeopleIllustration,
  BinIllustration
} from './Illustrations';

// Re-export all page components
export { default as CustomersPage } from './pages/CustomersPage';
export { default as UserChargePage } from './pages/UserChargePage';
export { default as FuelPage } from './pages/FuelPage';
export { default as WeighmentPage } from './pages/WeighmentPage';
export { default as BulkCollectionPage } from './pages/BulkCollectionPage';
export { default as LiveVehiclePage } from './pages/LiveVehiclePage';
export { default as AttendancePage } from './pages/AttendancePage';
export { default as ComplaintPage } from './pages/ComplaintPage';
export { default as AdminPage } from './pages/AdminPage';
export { default as KPIDashboardPage } from './pages/KPIDashboardPage';
export { default as RoleAssignmentPage } from './pages/RoleAssignmentPage';
// Profile page export
export { default as ProfilePage } from './pages/ProfilePage';
export { default as RolesPage } from './pages/RolesPage';
export { default as CitizenPage } from './pages/CitizenPage';
export { default as UserManagement } from './pages/UserManagement';
export { default as SettingsPage } from './pages/SettingsPage';
export { default as POIMonitoringPage } from './pages/POIMonitoringPage';
export { default as AccessDenied } from './pages/AccessDenied';

export const PageHeader = ({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) => {
  useEffect(() => {
    document.title = `${title} - Waste Management Portal`;
  }, [title]);
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight font-display">{title}</h2>
        <p className="text-sm text-gray-500 mt-1 font-medium">{description}</p>
      </div>
      {action}
    </div>
  );
};

export const SearchAndFilter = () => (
  <div className="flex flex-wrap gap-3 mb-6 p-1">
    <div className="relative flex-1 min-w-[240px] max-w-md group">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
      <input
        type="text"
        placeholder="Search records..."
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium shadow-sm"
      />
    </div>
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 text-sm font-semibold shadow-sm transition-all"
    >
      <Filter size={16} />
      Filters
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 text-sm font-semibold shadow-sm ml-auto transition-all"
    >
      <Download size={16} />
      Export
    </motion.button>
  </div>
);

interface NoDataViewProps {
  message?: string;
  illustration?: React.ElementType;
}

export const NoDataView = ({ message = "No records found", illustration: Illustration = Inbox }: NoDataViewProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-center bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300 m-1">
    <div className="bg-white p-6 rounded-full mb-4 shadow-sm border border-gray-100 relative">
      <div className="absolute inset-0 bg-gray-50 rounded-full scale-110 -z-10 animate-pulse"></div>
      {/* If it's a component from Illustrations, use it, else use lucide icon */}
      {typeof Illustration === 'function' && (Illustration as any).name?.includes('Illustration') ? (
        <div className="w-24 h-24"><Illustration /></div>
      ) : (
        // @ts-ignore
        <Illustration size={40} className="text-gray-400" />
      )}
    </div>
    <h3 className="text-lg font-bold text-gray-800 font-display">{message}</h3>
    <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto font-medium">
      There is currently no data to display in this section. New records will appear here automatically.
    </p>
  </div>
);