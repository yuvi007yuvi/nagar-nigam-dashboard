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
  CalendarCheck, Edit, MessageSquare
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
export { default as CoverageMonitoringPage } from './pages/CoverageMonitoringPage';
export { default as AttendancePage } from './pages/AttendancePage';
export { default as ComplaintPage } from './pages/ComplaintPage';
export { default as AdminPage } from './pages/AdminPage';
export { default as KPIDashboardPage } from './pages/KPIDashboardPage';
export { default as RoleAssignmentPage } from './pages/RoleAssignmentPage';
export { default as RolesPage } from './pages/RolesPage';
export { default as CitizenPage } from './pages/CitizenPage';
export { default as UserManagement } from './pages/UserManagement';

const PageHeader = ({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) => {
  useEffect(() => {
    document.title = `${title} - Waste Management Portal`;
  }, [title]);
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      {action}
    </div>
  );
};

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