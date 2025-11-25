import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, X, CheckCircle, AlertCircle, Shield, RefreshCw } from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { getAllRoles, createRole, updateRole, deleteRole, ALL_MODULES, Role } from '../../services/userRoleService';

const RolesPage = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: string, text: string } | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    // Form states
    const [roleId, setRoleId] = useState('');
    const [roleName, setRoleName] = useState('');
    const [roleDescription, setRoleDescription] = useState('');
    const [roleModules, setRoleModules] = useState<string[]>([]);

    const [expandedRole, setExpandedRole] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ show: boolean, roleId: string | null }>({ show: false, roleId: null });

    // Initialize roles data
    useEffect(() => {
        fetchRoles();
    }, []);

    // Fetch roles from database
    const fetchRoles = async () => {
        try {
            setLoading(true);
            const result = await getAllRoles();
            if (result.success && result.data) {
                setRoles(result.data);
            } else {
                setMessage({ type: 'error', text: 'Failed to load roles' });
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            setMessage({ type: 'error', text: 'An error occurred while loading roles' });
        } finally {
            setLoading(false);
        }
    };

    // Handle Create Role
    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!roleId || !roleName) {
            setMessage({ type: 'error', text: 'Role ID and Name are required' });
            return;
        }

        // Simple validation for ID format (alphanumeric and underscores only)
        const idRegex = /^[a-z0-9_]+$/;
        if (!idRegex.test(roleId)) {
            setMessage({ type: 'error', text: 'Role ID must contain only lowercase letters, numbers, and underscores' });
            return;
        }

        try {
            const result = await createRole(roleId, roleName, roleModules, roleDescription);
            if (result.success) {
                setMessage({ type: 'success', text: 'Role created successfully' });
                setShowCreateForm(false);
                resetForm();
                fetchRoles();
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to create role' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        }
    };

    // Handle Update Role
    const handleUpdateRole = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingRole || !roleName) {
            setMessage({ type: 'error', text: 'Role Name is required' });
            return;
        }

        try {
            const result = await updateRole(editingRole.id, roleName, roleModules, roleDescription);
            if (result.success) {
                setMessage({ type: 'success', text: 'Role updated successfully' });
                setShowEditForm(false);
                setEditingRole(null);
                resetForm();
                fetchRoles();
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to update role' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        }
    };

    // Handle Delete Role
    const handleDeleteRole = async () => {
        if (!showDeleteConfirm.roleId) return;

        try {
            const result = await deleteRole(showDeleteConfirm.roleId);
            if (result.success) {
                setMessage({ type: 'success', text: 'Role deleted successfully' });
                fetchRoles();
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to delete role' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setShowDeleteConfirm({ show: false, roleId: null });
        }
    };

    const resetForm = () => {
        setRoleId('');
        setRoleName('');
        setRoleDescription('');
        setRoleModules([]);
    };

    const toggleModule = (module: string) => {
        if (roleModules.includes(module)) {
            setRoleModules(roleModules.filter(m => m !== module));
        } else {
            setRoleModules([...roleModules, module]);
        }
    };

    const openEditForm = (role: Role) => {
        setEditingRole(role);
        setRoleId(role.id);
        setRoleName(role.name);
        setRoleDescription(role.description || '');
        setRoleModules(role.modules);
        setShowEditForm(true);
    };

    // Clear messages after 5 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading roles...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <PageHeader
                title="Role Management"
                description="Create and manage user roles and permissions"
                action={
                    <button
                        onClick={() => {
                            resetForm();
                            setShowCreateForm(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        Create Role
                    </button>
                }
            />

            {/* Message Toast */}
            {message && (
                <div className={`p-4 rounded-xl mb-4 flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <p>{message.text}</p>
                </div>
            )}

            {/* Roles List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Available Roles</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage user roles and their permissions</p>
                    </div>
                    <button
                        onClick={fetchRoles}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Refresh Roles"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {roles.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No roles found. Create a new role to get started.
                        </div>
                    ) : (
                        roles.map((role) => (
                            <div key={role.id} className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold uppercase">
                                            {role.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 dark:text-white">{role.name}</h4>
                                            <p className="text-xs text-gray-400 font-mono mb-1">ID: {role.id}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {role.modules.length} modules assigned
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                                            className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors mr-2"
                                        >
                                            {expandedRole === role.id ? 'Hide Permissions' : 'View Permissions'}
                                        </button>
                                        <button
                                            onClick={() => openEditForm(role)}
                                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm({ show: true, roleId: role.id })}
                                            className={`p-2 rounded-lg transition-colors ${role.id === 'admin'
                                                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                }`}
                                            disabled={role.id === 'admin'}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {expandedRole === role.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        {role.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 italic">{role.description}</p>
                                        )}
                                        <h5 className="font-medium text-gray-700 dark:text-gray-200 mb-2 text-sm">Assigned Modules:</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {role.modules.length > 0 ? (
                                                role.modules.map((module: string) => (
                                                    <span
                                                        key={module}
                                                        className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full"
                                                    >
                                                        {module}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-400">No modules assigned</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {(showCreateForm || showEditForm) && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                {showCreateForm ? 'Create New Role' : 'Edit Role'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setShowEditForm(false);
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role ID</label>
                                    <input
                                        type="text"
                                        value={roleId}
                                        onChange={(e) => setRoleId(e.target.value.toLowerCase())}
                                        disabled={showEditForm} // ID cannot be changed when editing
                                        placeholder="e.g. supervisor"
                                        className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${showEditForm ? 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400' : 'border-gray-200'
                                            }`}
                                    />
                                    {showCreateForm && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Unique identifier (lowercase, no spaces)</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Name</label>
                                    <input
                                        type="text"
                                        value={roleName}
                                        onChange={(e) => setRoleName(e.target.value)}
                                        placeholder="e.g. Supervisor"
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    value={roleDescription}
                                    onChange={(e) => setRoleDescription(e.target.value)}
                                    placeholder="Describe the role's responsibilities..."
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 h-24 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Module Permissions</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {ALL_MODULES.map((module) => (
                                        <label
                                            key={module}
                                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${roleModules.includes(module)
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-green-200 dark:hover:border-green-700'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${roleModules.includes(module)
                                                ? 'bg-green-500 border-green-500'
                                                : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-600'
                                                }`}>
                                                {roleModules.includes(module) && <CheckCircle size={14} className="text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={roleModules.includes(module)}
                                                onChange={() => toggleModule(module)}
                                            />
                                            <span className={`text-sm font-medium ${roleModules.includes(module) ? 'text-green-800 dark:text-green-300' : 'text-gray-600 dark:text-gray-300'
                                                }`}>
                                                {module}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setShowEditForm(false);
                                }}
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={showCreateForm ? handleCreateRole : handleUpdateRole}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-green-200 dark:shadow-none"
                            >
                                {showCreateForm ? 'Create Role' : 'Save Changes'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm.show && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                                <Trash2 className="text-red-600 dark:text-red-400" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Role?</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                Are you sure you want to delete this role? This action cannot be undone and may affect users assigned to this role.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowDeleteConfirm({ show: false, roleId: null })}
                                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteRole}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-sm shadow-red-200 dark:shadow-none"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default RolesPage;
