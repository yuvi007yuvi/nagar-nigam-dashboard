import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { AnimatePresence, motion } from 'framer-motion';

interface LayoutProps {
    userId: string;
}

const Layout: React.FC<LayoutProps> = ({ userId }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    // Determine title based on current path
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/' || path === '/dashboard') return 'Dashboard';

        // Remove leading slash
        const cleanPath = path.substring(1);

        // Handle special cases or formatting
        if (cleanPath === 'user-charge') return 'User Charge';
        if (cleanPath === 'bulk-collection') return 'Bulk Collection';
        if (cleanPath === 'coverage-monitoring') return 'Coverage Monitoring';
        if (cleanPath === 'kpi-dashboard') return 'KPI Dashboard';

        // Default formatting: Capitalize first letter
        return cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1);
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] text-gray-800 font-sans overflow-hidden">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                userId={userId}
            />

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="ml-0 lg:ml-72 transition-all duration-300 min-h-screen flex flex-col">
                <Header
                    onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    title={getPageTitle()}
                    userId={userId}
                />

                <main className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
