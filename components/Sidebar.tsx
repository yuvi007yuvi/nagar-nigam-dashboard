import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Wallet, Fuel, Scale,
  Trash2, Map, CalendarCheck, AlertCircle,
  Settings, BarChart3, X, ChevronRight, RefreshCw, User,
  LogOut, HelpCircle, Shield, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllowedModules } from '../services/userRoleService';
import logo from './images/logo.png';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onClose: () => void;
  userId: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isCollapsed, setIsCollapsed, onClose, userId }) => {
  const [allowedModules, setAllowedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      console.error('Sidebar: Error fetching allowed modules:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const allMenuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Customers', icon: Users, path: '/customers' },
    { name: 'User Charge', icon: Wallet, path: '/user-charge' },
    { name: 'Fuel', icon: Fuel, path: '/fuel' },
    { name: 'Weighment', icon: Scale, path: '/weighment' },
    { name: 'Bulk Collection', icon: Trash2, path: '/bulk-collection' },
    { name: 'Live Vehicle', icon: Map, path: '/live-vehicle' },
    { name: 'Attendance', icon: CalendarCheck, path: '/attendance' },
    { name: 'Complaint', icon: AlertCircle, path: '/complaint' },
    { name: 'Admin', icon: Shield, path: '/admin' },
    { name: 'Settings', icon: Settings, path: '/settings' },
    { name: 'KPI Dashboard', icon: BarChart3, path: '/kpi-dashboard' },
    { name: 'POI Monitoring', icon: Home, path: '/poi-monitoring' },
    { name: 'Roles', icon: Users, path: '/roles' },
    { name: 'Profile', icon: User, path: '/profile' }
  ];

  const menuItems = allMenuItems.filter(item => allowedModules.includes(item.name));

  const handleNavigate = (path: string) => {
    navigate(path);
    if (window.innerWidth < 1024) onClose();
  };

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const sidebarVariants = {
    open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  };

  if (loading) {
    return (
      <aside
        className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/20 flex flex-col h-screen fixed left-0 top-0 z-40 shadow-2xl transition-all duration-300 ${isOpen || isDesktop ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </aside>
    );
  }

  return (
    <motion.aside
      initial={false}
      animate={(isOpen || isDesktop) ? "open" : "closed"}
      variants={sidebarVariants}
      className={`${isCollapsed ? 'w-20' : 'w-72'} fixed left-0 top-0 z-40 h-screen flex flex-col shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/40 dark:border-gray-700/40 transition-all duration-300 ease-in-out px-0`}
    >
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[30%] bg-emerald-400/10 blur-[60px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[30%] bg-blue-400/10 blur-[60px] rounded-full"></div>
      </div>

      {/* Header */}
      <div className={`shrink-0 ${isCollapsed ? 'p-4' : 'p-6'} flex items-center justify-between relative z-20`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.8 }}
            className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-md flex-shrink-0 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50 overflow-hidden p-1"
          >
            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </motion.div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="whitespace-nowrap"
            >
              <h1 className="font-bold text-lg leading-tight tracking-tight text-gray-800 dark:text-gray-100 font-display">Waste Manager</h1>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Dashboard</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="absolute -right-3 top-20 z-50 lg:flex hidden">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-6 h-6 bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-900/50 rounded-full shadow-md flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors pointer-events-auto"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
          >
            <ChevronRight size={14} strokeWidth={3} />
          </motion.div>
        </button>
      </div>

      {/* Refresh and Close Buttons */}
      {!isCollapsed && (
        <div className="px-6 pb-2 flex gap-1">
          <button
            onClick={fetchAllowedModules}
            className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors text-gray-400 hover:text-emerald-600"
            title="Refresh Modules"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-gray-400 hover:text-red-500"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto scrollbar-hide py-4 ${isCollapsed ? 'px-2' : 'px-3'} space-y-1 relative z-20`}>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <motion.div
              key={item.name}
              whileHover={{ x: isCollapsed ? 0 : 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative group/item"
            >
              <button
                onClick={() => handleNavigate(item.path)}
                className={`w-full group flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden text-left
                    ${active
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm hover:text-emerald-700 dark:hover:text-emerald-400 font-medium'}`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} relative z-10 w-full`}>
                  <item.icon
                    size={18}
                    strokeWidth={active ? 2.5 : 2}
                    className={`transition-colors duration-200 flex-shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-emerald-500'}`}
                  />
                  {!isCollapsed && <span className="text-sm tracking-wide line-clamp-1">{item.name}</span>}
                </div>

                {active && !isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative z-10"
                  >
                    <ChevronRight size={14} className="text-white/80" />
                  </motion.div>
                )}
              </button>

              {/* Tooltip for mini sidebar */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-[11px] font-black rounded-lg opacity-0 pointer-events-none group-hover/item:opacity-100 group-hover/item:left-[calc(100%+4px)] transition-all z-[100] whitespace-nowrap shadow-2xl uppercase tracking-widest border border-gray-800">
                  {item.name}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-[6px] border-y-transparent border-r-[6px] border-r-gray-900"></div>
                </div>
              )}
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`shrink-0 ${isCollapsed ? 'p-2' : 'p-4'} relative z-20`}>
        <motion.div
          className={`relative flex flex-col items-center justify-center text-center ${isCollapsed ? 'p-2' : 'p-4'} rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl overflow-hidden group cursor-pointer`}
          whileHover={{ y: -2 }}
        >
          {/* Abstract shapes */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-emerald-500/20 transition-colors duration-500"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 bg-emerald-500/20 rounded-full blur-lg transform -translate-x-1/2 translate-y-1/2"></div>

          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 relative z-10">
                <HelpCircle size={12} />
                Helpline
              </div>
              <p className="text-lg font-bold text-white tracking-wide font-display relative z-10">9993325830</p>
            </>
          ) : (
            <div className="relative z-10 py-1">
              <HelpCircle size={20} className="text-emerald-400" />
              {/* Footer Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl border border-gray-800">
                Helpline: 9993325830
              </div>
            </div>
          )}
        </motion.div>

        {!isCollapsed && (
          <div className="mt-4 text-center">
            <p className="text-[10px] text-gray-400 font-medium tracking-wide">
              © 2025 Yuvraj Singh Tomar
            </p>
            <p className="text-[9px] text-gray-300/60 mt-0.5 flex items-center justify-center gap-1">
              Developed with purpose <span className="text-red-400">❤️</span>
            </p>
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;