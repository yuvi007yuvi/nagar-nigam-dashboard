import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROLES } from '../../services/userRoleService';
import { User, Shield, Users, Plus, RefreshCw, Settings, Database, Bell, BarChart3, Lock, Key, Monitor } from 'lucide-react';
import PageHeader from '../shared/PageHeader';

// --- Admin Page ---
const AdminPage = ({ currentUser }: { currentUser: any }) => {
    const [activeTab, setActiveTab] = useState('modules');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: string, text: string } | null>(null);
    const navigate = useNavigate();

    const adminModules = [
        {
            title: 'User Management',
            description: 'Manage users, roles and permissions',
            icon: User,
            color: 'bg-blue-500',
            path: '/user-management'
        },
        {
            title: 'System Settings',
            description: 'Configure system-wide settings',
            icon: Settings,
            color: 'bg-purple-500',
            path: '#'
        },
        {
            title: 'Database Management',
            description: 'Manage database connections and backups',
            icon: Database,
            color: 'bg-indigo-500',
            path: '#'
        },
        {
            title: 'Security',
            description: 'Manage security settings and policies',
            icon: Lock,
            color: 'bg-red-500',
            path: '#'
        },
        {
            title: 'Notifications',
            description: 'Configure system notifications',
            icon: Bell,
            color: 'bg-yellow-500',
            path: '#'
        },
        {
            title: 'Analytics',
            description: 'View system analytics and reports',
            icon: BarChart3,
            color: 'bg-green-500',
            path: '#'
        }
    ];

    // Clear messages after 5 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <PageHeader
                title="Administration"
                description="Manage system settings and configurations"
            />

            {/* Admin Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminModules.map((module, index) => {
                    const IconComponent = module.icon;
                    return (
                        <motion.div
                            key={index}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => module.path !== '#' && navigate(module.path)}
                        >
                            <div className={`w-12 h-12 ${module.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                                <IconComponent size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-800 mb-2">{module.title}</h3>
                            <p className="text-sm text-gray-500">{module.description}</p>
                            {module.path === '#' && (
                                <div className="mt-3 flex items-center text-xs text-gray-400">
                                    <Lock size={12} className="mr-1" />
                                    Coming soon
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default AdminPage;