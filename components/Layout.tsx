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
    const [isCollapsed, setIsCollapsed] = useState(true); // Default to mini sidebar
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
        if (cleanPath === 'live-vehicle') return 'Live Vehicle';
        if (cleanPath === 'kpi-dashboard') return 'KPI Dashboard';

        // Default formatting: Capitalize first letter
        return cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1);
    };

    return (
        <div className="min-h-screen text-gray-800 dark:text-gray-100 font-sans overflow-hidden relative bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Background Elements for depth */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/10 blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[100px]"></div>
            </div>

            <Sidebar
                isOpen={isSidebarOpen}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
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
                        className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className={`ml-0 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-72'} transition-all duration-300 min-h-screen flex flex-col`}>
                <Header
                    onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    title={getPageTitle()}
                    userId={userId}
                />

                <main className="p-4 sm:p-6 flex-1 overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="w-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default Layout;
