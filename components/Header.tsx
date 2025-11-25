import React, { useState, useEffect } from 'react';
import { LogOut, User, Shield, Home, Menu, Bell, Search, ChevronDown, Sun, Moon } from 'lucide-react';
import { useTheme } from '../services/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { logoutUser } from '../services/authService';
import { getUserRole } from '../services/userRoleService';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuToggle: () => void;
  title: string;
  userId?: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, title, userId }) => {
  const [userRole, setUserRole] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchUserRole();
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser({
          displayName: currentUser.displayName || 'User',
          email: currentUser.email || 'user@example.com',
          photoURL: currentUser.photoURL || null
        });
      } else {
        setUser({
          displayName: 'User',
          email: 'user@example.com',
          photoURL: null
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser({
        displayName: 'User',
        email: 'user@example.com',
        photoURL: null
      });
    }
  };

  const fetchUserRole = async () => {
    try {
      const result = await getUserRole(userId || '');
      if (result.success) {
        setUserRole(result.data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleViewProfile = () => {
    navigate('/citizen');
  };

  // Role display names
  const roleDisplayNames: Record<string, string> = {
    'admin': 'Administrator',
    'customer_manager': 'Customer Manager',
    'finance': 'Finance Officer',
    'fuel_manager': 'Fuel Manager',
    'weighment_operator': 'Weighment Operator',
    'collection_supervisor': 'Collection Supervisor',
    'coverage_analyst': 'Coverage Analyst',
    'hr_manager': 'HR Manager',
    'complaint_handler': 'Complaint Handler',
    'kpi_viewer': 'KPI Viewer',
    'basic_user': 'User',
    'citizen': 'Citizen'
  };

  // Get user display name, fallback to email prefix or default
  const getUserDisplayName = () => {
    if (user && user.displayName && user.displayName !== 'User') {
      return user.displayName;
    }
    if (user && user.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <header className="sticky top-0 z-30 px-4 sm:px-6 py-4">
      <div className="glass dark:bg-gray-800/80 dark:border-gray-700 rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
        {/* Left side - Menu button and title */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-xl hover:bg-gray-100/50 text-gray-600 hover:text-emerald-600 lg:hidden transition-all duration-200"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white tracking-tight truncate font-display">
              {title}
            </h1>
            {/* Breadcrumbs */}
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <span className="hover:text-emerald-600 cursor-pointer transition-colors" onClick={() => navigate('/')}>Home</span>
              <span className="mx-1.5 text-gray-300">/</span>
              <span className="font-medium text-emerald-600">{title}</span>
            </div>
          </div>
        </div>

        {/* Right side - User info and actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Search Bar (Hidden on mobile for now) */}
          <div className="hidden md:flex items-center bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-xl px-3 py-2 w-64 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500/50 transition-all">
            <Search size={16} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400 text-gray-700 dark:text-gray-200 dark:placeholder-gray-500"
            />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-gray-500 hover:text-emerald-600 transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <button className="p-2.5 rounded-xl hover:bg-gray-100/50 text-gray-500 hover:text-emerald-600 transition-all relative group">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-all border border-transparent hover:border-gray-200/50 dark:hover:border-gray-600/50"
            >
              <div className="relative">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={getUserDisplayName()}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-md"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm ring-2 ring-white shadow-md ${user?.photoURL ? 'hidden' : ''}`}>
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>

              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-gray-800 dark:text-white leading-none">
                  {getUserDisplayName()}
                </p>
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">
                  {roleDisplayNames[userRole] || 'User'}
                </p>
              </div>

              <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700 overflow-hidden z-50"
                >
                  <div className="p-2 space-y-1">
                    <button
                      onClick={handleViewProfile}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-xl transition-colors"
                    >
                      <User size={18} />
                      My Profile
                    </button>
                    <button
                      onClick={() => navigate('/settings')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-xl transition-colors"
                    >
                      <Shield size={18} />
                      Settings
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;