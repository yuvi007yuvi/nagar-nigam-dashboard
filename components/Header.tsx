import React, { useState, useEffect } from 'react';
import { LogOut, User, Shield, Home, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Left side - Menu button and title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 lg:hidden transition-all duration-200"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>

          <h1 className="text-lg sm:text-xl font-bold text-gray-800 tracking-tight truncate">
            {title}
          </h1>
        </div>

        {/* Right side - User info and actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Info */}
          <div className="flex items-center gap-2.5 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer group">
            {/* Avatar */}
            <div className="relative">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={getUserDisplayName()}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-green-500 ring-offset-2 group-hover:ring-green-600 transition-all duration-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm ring-2 ring-green-500 ring-offset-2 group-hover:ring-green-600 transition-all duration-200 ${user?.photoURL ? 'hidden' : ''}`}>
                {getUserDisplayName().charAt(0).toUpperCase()}
              </div>
            </div>

            {/* User Details - Hidden on mobile */}
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-800 leading-tight">
                {getUserDisplayName()}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <Shield size={11} className="text-green-600" />
                <span>{roleDisplayNames[userRole] || 'User'}</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-gray-200"></div>

          {/* Profile Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewProfile}
            className="p-2 rounded-lg hover:bg-green-50 text-gray-600 hover:text-green-600 transition-all duration-200"
            aria-label="My Profile"
          >
            <Home size={20} />
          </motion.button>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-all duration-200"
            aria-label="Logout"
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-gray-50 to-gray-50/50 border-t border-gray-100 flex items-center text-xs text-gray-600 overflow-x-auto scrollbar-hide">
        <span className="text-green-600 font-medium cursor-pointer hover:text-green-700 transition-colors">
          Home
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-2 shrink-0 text-gray-400" width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        <span className="font-medium text-gray-800">{title}</span>
      </div>
    </header>
  );
};

export default Header;