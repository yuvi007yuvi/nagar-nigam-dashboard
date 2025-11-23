import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Wallet, Fuel, Scale,
  Trash2, Map, CalendarCheck, AlertCircle,
  Settings, BarChart3, X, ChevronRight, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllowedModules } from '../services/userRoleService';
import logo from './images/logo.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, userId }) => {
  const [allowedModules, setAllowedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (userId) {
      fetchAllowedModules();
    }
  }, [userId]);

  const fetchAllowedModules = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      const result = await getAllowedModules(userId);
      if (result.success) {
        setAllowedModules(result.data);
      }
    } catch (error) {
      console.error('Error fetching allowed modules:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // All possible menu items
  const allMenuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Customers', icon: Users, path: '/customers' },
    { name: 'User Charge', icon: Wallet, path: '/user-charge' },
    { name: 'Fuel', icon: Fuel, path: '/fuel' },
    { name: 'Weighment', icon: Scale, path: '/weighment' },
    { name: 'Bulk Collection', icon: Trash2, path: '/bulk-collection' },
    { name: 'Coverage Monitoring', icon: Map, path: '/coverage-monitoring' },
    { name: 'Attendance', icon: CalendarCheck, path: '/attendance' },
    { name: 'Complaint', icon: AlertCircle, path: '/complaint' },
    { name: 'Admin', icon: Settings, path: '/admin' },
    { name: 'KPI Dashboard', icon: BarChart3, path: '/kpi-dashboard' },
    { name: 'Roles', icon: Users, path: '/roles' }
  ];

  // Filter menu items based on user's allowed modules
  const menuItems = allMenuItems.filter(item =>
    allowedModules.includes(item.name)
  );

  const handleNavigate = (path: string) => {
    navigate(path);
    // On mobile, close sidebar after selection
    if (window.innerWidth < 1024) onClose();
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  if (loading) {
    return (
      <aside
        className={`w-72 bg-gradient-to-b from-[#009966] to-[#046c4e] text-white flex flex-col h-screen fixed left-0 top-0 z-40 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`w-72 bg-gradient-to-b from-[#009966] to-[#046c4e] text-white flex flex-col h-screen fixed left-0 top-0 z-40 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
    >
      {/* Header - Fixed */}
      <div className="shrink-0 p-6 flex items-center justify-between relative z-20 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.8 }}
            className="w-11 h-11 bg-white rounded-xl shadow-lg flex items-center justify-center border-2 border-green-100 overflow-hidden"
          >
            <img src={logo} alt="Waste Management Logo" className="w-full h-full object-contain" />
          </motion.div>
          <div>
            <h1 className="font-bold text-base leading-tight tracking-tight">Waste Management</h1>
            <p className="text-[11px] font-medium text-green-100/80 uppercase tracking-wider mt-0.5">Portal</p>
          </div>
        </div>

        <div className="flex gap-1">
          <button
            onClick={fetchAllowedModules}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Scrollable Navigation Area */}
      <nav className="flex-1 overflow-y-auto scrollbar-hide py-6 px-4 space-y-1.5">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <motion.div
              key={item.name}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <button
                onClick={() => handleNavigate(item.path)}
                className={`w-full group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden text-left
                    ${active
                    ? 'bg-white text-[#009966] shadow-lg shadow-black/5 font-semibold'
                    : 'text-green-50 hover:bg-white/10 hover:text-white font-medium'}`}
              >
                <div className="flex items-center gap-3.5 relative z-10">
                  <item.icon
                    size={20}
                    className={`transition-colors duration-300 ${active ? 'text-[#009966]' : 'text-green-200 group-hover:text-white'}`}
                  />
                  <span className="text-sm tracking-wide">{item.name}</span>
                </div>

                {active && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10"
                  >
                    <ChevronRight size={16} />
                  </motion.div>
                )}
              </button>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer - Fixed */}
      <div className="shrink-0 p-4 border-t border-white/10 bg-[#008f5f]/20 backdrop-blur-sm relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

        <motion.div
          className="relative z-10 flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-white/10"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 text-xs font-bold text-green-100 uppercase tracking-widest mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></div>
            Helpline
          </div>
          <p className="text-xl font-bold text-white tracking-wide">9993325830</p>
        </motion.div>

        <div className="mt-3 text-center text-[10px] text-green-200/60">
          © 2025 Yuvraj Singh Tomar — Developed with purpose and ❤️ use this
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;