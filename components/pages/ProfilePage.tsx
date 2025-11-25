import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth } from '../../services/firebaseConfig';
import { updateProfile } from 'firebase/auth';
import PageHeader from '../shared/PageHeader';
import { X } from 'lucide-react';

// Simple Profile Page showing real user data and allowing edit access
const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [displayName, setDisplayName] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((u) => {
            if (u) {
                setUser(u);
                setDisplayName(u.displayName || '');
                setPhotoURL(u.photoURL || '');
            } else {
                // If not logged in, redirect to login
                navigate('/login');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) return;
        try {
            await updateProfile(auth.currentUser, { displayName, photoURL });
            setMessage('Profile updated successfully');
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-4">
            <PageHeader title="My Profile" description="View and edit your personal information" />
            {message && (
                <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 p-3 rounded mb-4 flex items-center justify-between">
                    <span>{message}</span>
                    <button onClick={() => setMessage('')} className="text-green-800 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300">
                        <X size={16} />
                    </button>
                </div>
            )}
            <form onSubmit={handleSave} className="max-w-lg mx-auto space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input type="email" value={user?.email || ''} disabled className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photo URL</label>
                    <input
                        type="text"
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                    />
                </div>
                <button type="submit" className="px-4 py-2 bg-[#22c55e] text-white rounded hover:bg-[#16a34a] transition-colors shadow-sm">
                    Save Changes
                </button>
            </form>
        </motion.div>
    );
};


export default ProfilePage;

