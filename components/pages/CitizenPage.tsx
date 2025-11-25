import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, IdCard, Home, CreditCard, Search, Filter, Edit, Camera } from 'lucide-react';
import PageHeader from '../shared/PageHeader';

const CitizenPage = ({ currentUser }: { currentUser: any }) => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    // Mock user data - in a real app, this would come from Firestore
    const userData = {
        name: currentUser?.displayName || 'User',
        email: currentUser?.email || 'user@example.com',
        phone: '+91 98765 43210',
        address: '123 Main Street, Mathura',
        aadhar: '1234 5678 9012',
        ward: 'Ward 5',
        zone: 'Zone B',
        memberSince: 'Jan 2023',
        complaints: 3,
        payments: 12
    };

    // Mock complaints data
    const complaints = [
        { id: 1, title: 'Garbage Collection Delay', status: 'Open', date: '2023-06-15' },
        { id: 2, title: 'Street Light Not Working', status: 'Resolved', date: '2023-06-10' },
        { id: 3, title: 'Water Supply Issue', status: 'In Progress', date: '2023-06-05' }
    ];

    // Mock payment history
    const payments = [
        { id: 1, amount: '₹500', date: '2023-06-01', status: 'Paid' },
        { id: 2, amount: '₹500', date: '2023-05-01', status: 'Paid' },
        { id: 3, amount: '₹500', date: '2023-04-01', status: 'Paid' }
    ];

    const handleEditProfile = () => {
        console.log('Edit profile clicked');
        // Implement edit profile functionality
    };

    const handleFileComplaint = () => {
        console.log('File complaint clicked');
        // Implement file complaint functionality
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading your details...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 max-w-6xl mx-auto space-y-6"
        >
            <PageHeader
                title="My Profile"
                description="Manage your account and view your activity"
            />

            {/* Profile Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-32 relative">
                    <div className="absolute -bottom-12 left-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-700 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-gray-800 shadow-lg">
                                {userData.name.charAt(0).toUpperCase()}
                            </div>
                            <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 rounded-full p-2 shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                <Camera size={16} className="text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-6 px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{userData.name}</h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">{userData.email}</p>
                        </div>
                        <button
                            onClick={handleEditProfile}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors shadow-sm"
                        >
                            <Edit size={18} />
                            Edit Profile
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{userData.complaints}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complaints</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{userData.payments}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Payments</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{userData.ward}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ward</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{userData.memberSince}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Member Since</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="border-b border-gray-100 dark:border-gray-700 px-6 flex">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-4 py-3 font-medium text-sm relative ${activeTab === 'profile' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Profile Details
                        {activeTab === 'profile' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 dark:bg-green-500"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('complaints')}
                        className={`px-4 py-3 font-medium text-sm relative ${activeTab === 'complaints' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        My Complaints
                        {activeTab === 'complaints' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 dark:bg-green-500"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`px-4 py-3 font-medium text-sm relative ${activeTab === 'payments' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Payment History
                        {activeTab === 'payments' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 dark:bg-green-500"></div>
                        )}
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'profile' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-800 dark:text-white">Personal Information</h3>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                    <Mail className="text-gray-500 dark:text-gray-400" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                        <p className="font-medium text-gray-800 dark:text-white">{userData.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                    <Phone className="text-gray-500 dark:text-gray-400" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                        <p className="font-medium text-gray-800 dark:text-white">{userData.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                    <MapPin className="text-gray-500 dark:text-gray-400" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                                        <p className="font-medium text-gray-800 dark:text-white">{userData.address}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-800 dark:text-white">Account Information</h3>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                    <IdCard className="text-gray-500 dark:text-gray-400" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Aadhar Number</p>
                                        <p className="font-medium text-gray-800 dark:text-white">{userData.aadhar}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                    <Home className="text-gray-500 dark:text-gray-400" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Ward & Zone</p>
                                        <p className="font-medium text-gray-800 dark:text-white">{userData.ward}, {userData.zone}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                    <Calendar className="text-gray-500 dark:text-gray-400" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                                        <p className="font-medium text-gray-800 dark:text-white">{userData.memberSince}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'complaints' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-800 dark:text-white">My Complaints</h3>
                                <button
                                    onClick={handleFileComplaint}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-sm"
                                >
                                    <Search size={18} />
                                    File New Complaint
                                </button>
                            </div>

                            <div className="space-y-3">
                                {complaints.map(complaint => (
                                    <div key={complaint.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <div>
                                            <h4 className="font-medium text-gray-800 dark:text-white">{complaint.title}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Filed on {complaint.date}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${complaint.status === 'Open' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' : complaint.status === 'In Progress' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'}`}>
                                                {complaint.status}
                                            </span>
                                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                <Filter size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Payment History</h3>

                            <div className="space-y-3">
                                {payments.map(payment => (
                                    <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <div>
                                            <h4 className="font-medium text-gray-800 dark:text-white">{payment.amount}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Paid on {payment.date}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                                                {payment.status}
                                            </span>
                                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                <CreditCard size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default CitizenPage;