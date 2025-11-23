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

// --- Coverage Monitoring Page ---
const CoverageMonitoringPage = () => {
  // Stats Data
  const coverageStats = [
    { label: 'Total', value: '0', icon: Layers, color: 'text-purple-600 bg-purple-100', sub: 'View More' },
    { label: 'Data Not Receiving', value: '0', icon: WifiOff, color: 'text-orange-500 bg-orange-100', sub: 'View More' },
    { label: 'Running', value: '0', icon: PlayCircle, color: 'text-green-500 bg-green-100', sub: 'View More' },
    { label: 'Over Speeding', value: '0', icon: OctagonAlert, color: 'text-red-500 bg-red-100', sub: 'View More' },
    { label: 'Standing', value: '0', icon: PauseCircle, color: 'text-pink-500 bg-pink-100', sub: 'View More' },
    { label: 'Stopped', value: '0', icon: StopCircle, color: 'text-blue-500 bg-blue-100', sub: 'View More' },
  ];

  const CoverageStatCard = ({ label, value, icon: Icon, color, sub }: any) => (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <div className={`p-2.5 rounded-full w-fit mb-3 ${color}`}>
            <Icon size={20} />
          </div>
          <p className="text-xs font-bold text-gray-500 uppercase">{label}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-0.5">{value}</h3>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <span className="text-[10px] text-gray-400 cursor-pointer hover:text-blue-600 flex items-center gap-1">
          {sub} <div className="w-3 h-3 rounded-full border border-gray-300 flex items-center justify-center text-[8px]">▶</div>
        </span>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-2">
      <PageHeader title="Coverage Monitoring" description="Live vehicle tracking and route coverage analysis." />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {coverageStats.map((stat, i) => (
          <CoverageStatCard key={i} {...stat} />
        ))}
      </div>

      {/* Reports Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-600">Reports</h3>
        <div className="flex flex-wrap gap-3">
          {['Trip Report', 'POI Report', 'Coverage Overview', 'Distance Report'].map((report) => (
            <button key={report} className="flex items-center gap-2 px-4 py-2 bg-white border border-cyan-100 text-cyan-700 rounded-lg shadow-sm hover:bg-cyan-50 hover:shadow text-xs font-bold transition-all">
              <div className="p-1 bg-cyan-100 rounded text-cyan-600"><FileText size={14} /></div>
              {report}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full xl:w-auto flex-1">
          <select className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500">
            <option>Zone</option>
          </select>
          <select className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500">
            <option>Ward</option>
          </select>
          <div className="relative">
            <select className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500">
              <option>Routes</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full xl:w-auto justify-end">
          <button className="px-4 py-2 bg-orange-400 text-white text-xs font-bold rounded-lg hover:bg-orange-500 shadow-sm">Load Route</button>
          <button className="px-4 py-2 bg-orange-400 text-white text-xs font-bold rounded-lg hover:bg-orange-500 shadow-sm">Load Customer</button>
          <button className="px-4 py-2 bg-rose-400 text-white text-xs font-bold rounded-lg hover:bg-rose-500 shadow-sm">Track Assist</button>
          <button className="px-4 py-2 bg-rose-400 text-white text-xs font-bold rounded-lg hover:bg-rose-500 shadow-sm">Snap Locations</button>
        </div>
      </div>

      {/* Map Area */}
      <div className="relative h-[600px] rounded-xl overflow-hidden border border-gray-300 shadow-inner">
        {/* Free OpenStreetMap Implementation */}
        <iframe
          src="https://www.openstreetmap.org/export/embed.html?bbox=77.6537,27.4724,77.6937,27.5124&layer=mapnik"
          className="w-full h-full border-0"
          title="Coverage Monitoring Map"
        ></iframe>

        {/* Map Controls */}
        <div className="absolute top-4 left-4 flex flex-col bg-white rounded shadow-md border border-gray-200 overflow-hidden">
          <button className="p-2 hover:bg-gray-50 border-b border-gray-200 text-gray-600">
            <Plus size={18} />
          </button>
          <button className="p-2 hover:bg-gray-50 border-b border-gray-200 text-gray-600">
            <Minus size={18} />
          </button>
          <button className="p-2 hover:bg-gray-50 text-gray-600">
            <Layers size={18} />
          </button>
        </div>

        {/* Switch Map Toggle */}
        <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded shadow-md border border-gray-200 flex items-center gap-2">
          <span className="text-xs font-bold text-gray-600">Switch Map</span>
          <div className="relative inline-block w-8 h-4 align-middle select-none">
            <input type="checkbox" className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 right-0" />
            <span className="toggle-label block overflow-hidden h-4 rounded-full bg-gray-300"></span>
          </div>
        </div>

        {/* Map Attribution */}
        <div className="absolute bottom-1 left-2 bg-white/80 px-2 py-0.5 rounded text-[10px] text-gray-500 font-medium">
          Map data © <a href="https://openstreetmap.org" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors
        </div>
      </div>
    </motion.div>
  );
}

export default CoverageMonitoringPage;
