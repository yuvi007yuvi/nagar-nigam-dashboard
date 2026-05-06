import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    User, Shield, Users, Plus, RefreshCw, Settings, Database, 
    Bell, BarChart3, Lock, Key, Monitor, Truck, Map as MapIcon,
    QrCode, ClipboardCheck
} from 'lucide-react';

import PageHeader from '../shared/PageHeader';

const AdminPage = ({ currentUser }: { currentUser: any }) => {
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
            title: 'Role Definitions',
            description: 'Define and configure system roles',
            icon: Shield,
            color: 'bg-emerald-600',
            path: '/roles'
        },
        {
            title: 'Role Assignments',
            description: 'Assign roles and modules to users',
            icon: ClipboardCheck,
            color: 'bg-blue-600',
            path: '/role-assignments'
        },
        {
            title: 'QR Data',
            description: 'Manage bulk collection sites and QR code registration',
            icon: QrCode,
            color: 'bg-indigo-600',
            path: '/qr-data'
        },
        {
            title: 'System Settings',
            description: 'Configure system-wide settings',
            icon: Settings,
            color: 'bg-purple-500',
            path: '/settings'
        },
        {
            title: 'Vehicle Master',
            description: 'Manage vehicle fleet and IMEIs',
            icon: Truck,
            color: 'bg-orange-500',
            path: '/vehicle-master'
        },
        {
            title: 'Map Layers',
            description: 'Upload and manage KML boundary files',
            icon: MapIcon,
            color: 'bg-emerald-500',
            path: '/map-layers'
        },
        {
            title: 'Bulk Collection',
            description: 'Manage bulk collection of waste',
            icon: Truck,
            color: 'bg-indigo-600',
            path: '/bulk-collection'
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
            className="space-y-6 p-4"
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
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => module.path !== '#' && navigate(module.path)}
                        >
                            <div className={`w-12 h-12 ${module.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                                <IconComponent size={24} />
                            </div>
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{module.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{module.description}</p>
                            {module.path === '#' && (
                                <div className="mt-3 flex items-center text-xs text-gray-400 dark:text-gray-500">
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