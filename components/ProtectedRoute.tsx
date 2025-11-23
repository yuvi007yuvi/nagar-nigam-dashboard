import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAllowedModules } from '../services/userRoleService';

interface ProtectedRouteProps {
    userId: string;
    requiredModule: string;
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ userId, requiredModule, children }) => {
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const result = await getAllowedModules(userId);
                if (result.success) {
                    const allowed = result.data.includes(requiredModule);
                    setHasAccess(allowed);
                } else {
                    setHasAccess(false);
                }
            } catch (error) {
                console.error('Error checking access:', error);
                setHasAccess(false);
            } finally {
                setLoading(false);
            }
        };

        checkAccess();
    }, [userId, requiredModule]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!hasAccess) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
