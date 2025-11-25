import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Bell, Shield, Globe, Moon, Sun,
    Smartphone, Mail, Lock, LogOut, ChevronRight,
    Save, CheckCircle, Monitor
} from 'lucide-react';
import PageHeader from '../shared/PageHeader';

import { useTheme } from '../../services/ThemeContext';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('general');
    const { theme, setTheme } = useTheme();
    const darkMode = theme === 'dark';
    const setDarkMode = (isDark: boolean) => setTheme(isDark ? 'dark' : 'light');
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 1500);
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Settings"
                description="Manage your preferences and account settings"
            />

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 shrink-0">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/50 p-2 space-y-1 sticky top-24">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm relative overflow-hidden group ${isActive
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400 hover:shadow-sm'
                                        }`}
                                >
                                    <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-emerald-500'} />
                                    <span className="relative z-10">{tab.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 -z-0"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/50 p-6 lg:p-8 min-h-[500px]"
                    >
                        {/* General Settings */}
                        {activeTab === 'general' && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Appearance</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Customize how the application looks on your device.</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setDarkMode(false)}
                                            className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${!darkMode ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/20' : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!darkMode ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                <Sun size={20} />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-semibold text-gray-800 dark:text-gray-200">Light Mode</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Default light theme</div>
                                            </div>
                                            {!darkMode && <CheckCircle size={18} className="ml-auto text-emerald-500" />}
                                        </button>

                                        <button
                                            onClick={() => setDarkMode(true)}
                                            className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${darkMode ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/20' : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                <Moon size={20} />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-semibold text-gray-800 dark:text-gray-200">Dark Mode</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Easy on the eyes</div>
                                            </div>
                                            {darkMode && <CheckCircle size={18} className="ml-auto text-emerald-500" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Language & Region</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Set your preferred language and regional settings.</p>

                                    <div className="max-w-md space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Language</label>
                                            <select className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-gray-800 dark:text-white">
                                                <option>English (US)</option>
                                                <option>Hindi</option>
                                                <option>Marathi</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Time Zone</label>
                                            <select className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-gray-800 dark:text-white">
                                                <option>(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Profile Settings */}
                        {activeTab === 'profile' && (
                            <div className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                            YS
                                        </div>
                                        <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-gray-100 text-gray-600 hover:text-emerald-600 transition-colors">
                                            <User size={16} />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Yuvraj Singh</h3>
                                        <p className="text-gray-500 dark:text-gray-400">Administrator</p>
                                        <button className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline">Change Avatar</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            defaultValue="Yuvraj Singh"
                                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-gray-800 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                                        <input
                                            type="email"
                                            defaultValue="yuvraj@nagarnigam.com"
                                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-gray-800 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                                        <input
                                            type="tel"
                                            defaultValue="+91 98765 43210"
                                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-gray-800 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
                                        <input
                                            type="text"
                                            defaultValue="IT Administration"
                                            disabled
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Bio</h3>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm resize-none text-gray-800 dark:text-white"
                                        placeholder="Write a short bio..."
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        {/* Notification Settings */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Email Notifications</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Manage what emails you receive from us.</p>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                                <Mail size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-semibold text-gray-800 dark:text-white">Weekly Reports</h4>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} className="sr-only peer" />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Receive a weekly summary of vehicle activity and collections.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Push Notifications</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Manage alerts on your mobile device.</p>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                                <Smartphone size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-semibold text-gray-800 dark:text-white">Critical Alerts</h4>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" checked={pushNotifs} onChange={() => setPushNotifs(!pushNotifs)} className="sr-only peer" />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                                    </label>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Get notified immediately for vehicle breakdowns or route deviations.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Settings */}
                        {activeTab === 'security' && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Password</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Update your password to keep your account secure.</p>

                                    <div className="max-w-md space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Current Password</label>
                                            <input
                                                type="password"
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-gray-800 dark:text-white"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                                            <input
                                                type="password"
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-gray-800 dark:text-white"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm New Password</label>
                                            <input
                                                type="password"
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-gray-800 dark:text-white"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <button className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors">
                                            Update Password
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Sessions</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Manage your active sessions.</p>

                                    <div className="bg-white dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <Monitor size={20} className="text-gray-400" />
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-800 dark:text-white">Windows PC - Chrome</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Indore, India • Active now</div>
                                                </div>
                                            </div>
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Current</span>
                                        </div>
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Smartphone size={20} className="text-gray-400" />
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-800 dark:text-white">iPhone 13 - Safari</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Indore, India • 2 hours ago</div>
                                                </div>
                                            </div>
                                            <button className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors">
                                                <LogOut size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50 flex justify-end">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSave}
                                disabled={loading}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all ${saved ? 'bg-green-500' : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                                    }`}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : saved ? (
                                    <>
                                        <CheckCircle size={18} />
                                        Saved!
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
