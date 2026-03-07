import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAllowedModules } from '../services/userRoleService';

interface ProtectedRouteProps {
    userId: string;
    requiredModule: string;
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ userId, requiredModule, children }) => {
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [redirectTo, setRedirectTo] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        console.log('ProtectedRoute: Checking access for', requiredModule);
        const checkAccess = async () => {
            try {
                const result = await getAllowedModules(userId);
                console.log('ProtectedRoute: Allowed modules:', result.data);
                if (result.success) {
                    const allowed = result.data.includes(requiredModule);
                    console.log('ProtectedRoute: Has access?', allowed);
                    setHasAccess(allowed);

                    // If no access, find first allowed module to redirect to
                    if (!allowed && result.data.length > 0) {
                        // Map module names to routes
                        const moduleRoutes: Record<string, string> = {
                            'Dashboard': '/dashboard',
                            'Customers': '/customers',
                            'User Charge': '/user-charge',
                            'Fuel': '/fuel',
                            'Weighment': '/weighment',
                            'Bulk Collection': '/bulk-collection',
                            'Live Vehicle': '/live-vehicle',
                            'Attendance': '/attendance',
                            'Complaint': '/complaint',
                            'Admin': '/admin',
                            'KPI Dashboard': '/kpi-dashboard',
                            'Roles': '/roles',
                            'Profile': '/profile'
                        };

                        // Find first allowed module that has a route
                        const firstAllowedModule = result.data.find(module => moduleRoutes[module]);
                        if (firstAllowedModule) {
                            console.log('ProtectedRoute: Redirecting to:', firstAllowedModule);
                            setRedirectTo(moduleRoutes[firstAllowedModule]);
                        }
                    }
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

    // Redirect to first allowed module if available
    if (redirectTo) {
        return <Navigate to={redirectTo} replace />;
    }

    if (!hasAccess) {
        // Redirect to dashboard with access denied state
        return <Navigate to="/dashboard?access=denied" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
