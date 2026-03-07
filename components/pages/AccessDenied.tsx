import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface AccessDeniedProps {
    message?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ message }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
            >
                {/* Error Icon */}
                <motion.div
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="mx-auto mb-6"
                >
                    <XCircle className="w-24 h-24 text-red-500" />
                </motion.div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Access Denied
                </h1>

                {/* Message */}
                <p className="text-gray-600 mb-8 leading-relaxed">
                    {message || "You don't have permission to access this page."}
                </p>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(-1)}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/dashboard')}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        Go to Dashboard
                    </motion.button>
                </div>

                {/* Help Text */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        Contact your administrator if you believe you should have access to this page.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default AccessDenied;
