import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, CheckCircle, AlertCircle, X, Edit, MoreHorizontal, Clock, Search, Users, Shield } from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { getAllUsersWithRoles, getAllUsers, assignRoleToUser, ROLES } from '../../services/userRoleService';

const RoleAssignmentPage = () => {
  const [users, setUsers] = useState<any[]>([
    // Mock data for demonstration
    { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
    { id: '2', name: 'Regular User', email: 'user@example.com', role: 'basic_user' }
  ]);
  const [allUsers, setAllUsers] = useState<any[]>([
    // Mock data for demonstration
    { id: '1', name: 'Admin User', email: 'admin@example.com' },
    { id: '2', name: 'Regular User', email: 'user@example.com' },
    { id: '3', name: 'New User', email: 'newuser@example.com' }
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES.ADMIN);
  const [message, setMessage] = useState<{type: string, text: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Filter users based on search term
  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Assign role to user
  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      setMessage({ type: 'error', text: 'Please select both user and role' });
      return;
    }

    try {
      setLoading(true);
      const result = await assignRoleToUser(selectedUser, selectedRole);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Role assigned successfully' });
        // Update local state
        setUsers(users.map(user => 
          user.id === selectedUser ? { ...user, role: selectedRole } : user
        ));
        // Reset form
        setSelectedUser('');
        setSelectedRole(ROLES.ADMIN);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to assign role' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to assign role' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-4"
    >
      <PageHeader 
        title="Role Assignment" 
        description="Assign roles to users"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Assignment Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Assign Role</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
                <select 
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                >
                  <option value="">Choose a user</option>
                  {filteredUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                <select 
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                >
                  <option value="">Choose a role</option>
                  <option value={ROLES.ADMIN}>Admin</option>
                  <option value={ROLES.BASIC_USER}>Basic User</option>
                </select>
              </div>
              
              <button 
                onClick={handleAssignRole}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Assigning...
                  </>
                ) : (
                  <>
                    <Shield size={18} />
                    Assign Role
                  </>
                )}
              </button>
            </div>
            
            {message && (
              <div className={`mt-4 p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}
          </div>
        </div>
        
        {/* Users List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Users</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage user roles and permissions</p>
                </div>
                
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm" 
                  />
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {filteredUsers.map(user => {
                const userWithRole = users.find(u => u.id === user.id);
                return (
                  <div key={user.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{user.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {userWithRole ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            {userWithRole.role === ROLES.ADMIN ? 'Admin' : 'Basic User'}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                            No Role
                          </span>
                        )}
                        <button 
                          onClick={() => {
                            setSelectedUser(user.id);
                            setSelectedRole(userWithRole?.role || ROLES.ADMIN);
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RoleAssignmentPage;