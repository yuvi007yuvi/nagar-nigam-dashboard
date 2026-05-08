import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Shield, Users, Plus, RefreshCw, Settings, Database, 
    Bell, BarChart3, Lock, Key, Monitor, Truck, Map as MapIcon,
    QrCode, ClipboardCheck, Navigation, Layers, Target, MapPin,
    Folder, ChevronRight, LayoutGrid, List, Search
} from 'lucide-react';

import PageHeader from '../shared/PageHeader';

interface AdminModule {
    title: string;
    description: string;
    icon: any;
    color: string;
    path: string;
}

interface AdminCategory {
    id: string;
    title: string;
    icon: any;
    color: string;
    modules: AdminModule[];
}

const AdminPage = ({ currentUser }: { currentUser: any }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>('access');

    const adminCategories: AdminCategory[] = [
        {
            id: 'access',
            title: 'User & Access Control',
            icon: Shield,
            color: 'text-blue-500',
            modules: [
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
                }
            ]
        },
        {
            id: 'fleet',
            title: 'Fleet & Logistics',
            icon: Truck,
            color: 'text-orange-500',
            modules: [
                {
                    title: 'Vehicle Master',
                    description: 'Manage vehicle fleet and IMEIs',
                    icon: Truck,
                    color: 'bg-orange-500',
                    path: '/vehicle-master'
                },
                {
                    title: 'Route Master',
                    description: 'Upload and manage ward-specific vehicle routes',
                    icon: Navigation,
                    color: 'bg-emerald-600',
                    path: '/route-master'
                },
                {
                    title: 'Route Assignment',
                    description: 'Map fleet vehicles to designated routes',
                    icon: Truck,
                    color: 'bg-blue-600',
                    path: '/route-assignments'
                },
                {
                    title: 'Route Network Map',
                    description: 'Visual audit of all uploaded vehicle routes',
                    icon: MapIcon,
                    color: 'bg-emerald-500',
                    path: '/route-network'
                }
            ]
        },
        {
            id: 'geography',
            title: 'Geography & Mapping',
            icon: MapIcon,
            color: 'text-emerald-500',
            modules: [
                {
                    title: 'Zone & Ward Master',
                    description: 'Define and manage municipal zones and wards',
                    icon: MapIcon,
                    color: 'bg-emerald-600',
                    path: '/zone-ward-master'
                },
                {
                    title: 'Map Layers',
                    description: 'Upload and manage KML boundary files',
                    icon: MapIcon,
                    color: 'bg-emerald-500',
                    path: '/map-layers'
                },
                {
                    title: 'Parking & Dump Master',
                    description: 'Define parking geofences and dump site locations',
                    icon: MapPin,
                    color: 'bg-emerald-600',
                    path: '/parking-dump-master'
                }
            ]
        },
        {
            id: 'operations',
            title: 'Operational Settings',
            icon: Settings,
            color: 'text-indigo-500',
            modules: [
                {
                    title: 'QR Data',
                    description: 'Manage bulk collection sites and QR code registration',
                    icon: QrCode,
                    color: 'bg-indigo-600',
                    path: '/qr-data'
                },
                {
                    title: 'Bulk Customer Upload',
                    description: 'Import thousands of customers via CSV/Excel',
                    icon: Users,
                    color: 'bg-orange-600',
                    path: '/bulk-customer-upload'
                },
                {
                    title: 'Property Type Master',
                    description: 'Define property categories and monthly user charges',
                    icon: Layers,
                    color: 'bg-blue-500',
                    path: '/property-type-master'
                },
                {
                    title: 'Property-wise Checking',
                    description: 'Audit customers and upload official rate gazette',
                    icon: ClipboardCheck,
                    color: 'bg-emerald-600',
                    path: '/property-wise-checking'
                }
            ]
        },
        {
            id: 'system',
            title: 'System & Config',
            icon: Database,
            color: 'text-rose-500',
            modules: [
                {
                    title: 'KPI Thresholds',
                    description: 'Set performance targets for the KPI Dashboard',
                    icon: Target,
                    color: 'bg-rose-500',
                    path: '/kpi-thresholds'
                },
                {
                    title: 'Database',
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
                }
            ]
        }
    ];

    const filteredCategories = adminCategories.map(cat => ({
        ...cat,
        modules: cat.modules.filter(m => 
            m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.modules.length > 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 p-4"
        >
            <PageHeader
                title="Administration Console"
                description="Centralized system configuration and management"
            />

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Side: Folder Navigation */}
                <div className="w-full lg:w-72 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Search modules..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-2 shadow-sm">
                        <p className="px-3 py-2 text-xs font-black text-gray-400 uppercase tracking-widest">Modules</p>
                        <div className="space-y-1">
                            {adminCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                                        selectedCategory === cat.id 
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 shadow-sm' 
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                                    }`}
                                >
                                    <Folder size={20} className={selectedCategory === cat.id ? 'fill-current' : ''} />
                                    <span className="font-bold text-sm text-left flex-1">{cat.title}</span>
                                    {selectedCategory === cat.id && <ChevronRight size={16} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Sub-modules (Subfolders) */}
                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedCategory || 'search'}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                        >
                            {(selectedCategory 
                                ? adminCategories.find(c => c.id === selectedCategory)?.modules 
                                : filteredCategories.flatMap(c => c.modules)
                            )?.map((module, index) => {
                                const IconComponent = module.icon;
                                const isComingSoon = module.path === '#';
                                
                                return (
                                    <motion.div
                                        key={index}
                                        whileHover={!isComingSoon ? { y: -4, scale: 1.02 } : {}}
                                        onClick={() => !isComingSoon && navigate(module.path)}
                                        className={`group relative bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all ${
                                            isComingSoon ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:shadow-xl hover:border-blue-200 cursor-pointer'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 ${module.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                                <IconComponent size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-800 dark:text-white group-hover:text-blue-600 transition-colors">{module.title}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{module.description}</p>
                                            </div>
                                        </div>
                                        
                                        {isComingSoon ? (
                                            <div className="absolute top-3 right-3">
                                                <Lock size={14} className="text-gray-400" />
                                            </div>
                                        ) : (
                                            <div className="mt-4 flex items-center justify-end">
                                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                    Configure <ChevronRight size={10} />
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminPage;