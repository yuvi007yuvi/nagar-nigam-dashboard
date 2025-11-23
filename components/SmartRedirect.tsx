import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllowedModules } from '../services/userRoleService';

interface SmartRedirectProps {
    userId: string;
}

const SmartRedirect: React.FC<SmartRedirectProps> = ({ userId }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const redirectToAllowedModule = async () => {
            try {
                const result = await getAllowedModules(userId);
                if (result.success && result.data.length > 0) {
                    // Prioritize Dashboard if available, otherwise use first allowed module
                    const hasDashboard = result.data.includes('Dashboard');
                    const targetModule = hasDashboard ? 'Dashboard' : result.data[0];

                    // Map module names to routes
                    const moduleRoutes: Record<string, string> = {
                        'Dashboard': '/dashboard',
                        'Customers': '/customers',
                        'User Charge': '/user-charge',
                        'Fuel': '/fuel',
                        'Weighment': '/weighment',
                        'Bulk Collection': '/bulk-collection',
                        'Coverage Monitoring': '/coverage-monitoring',
                        'Attendance': '/attendance',
                        'Complaint': '/complaint',
                        'Admin': '/admin',
                        'KPI Dashboard': '/kpi-dashboard',
                        'Roles': '/roles'
                    };

                    const route = moduleRoutes[targetModule] || '/complaint';
                    navigate(route, { replace: true });
                } else {
                    // If no modules, redirect to complaint as fallback
                    navigate('/complaint', { replace: true });
                }
            } catch (error) {
                console.error('Error redirecting:', error);
                navigate('/complaint', { replace: true });
            }
        };

        redirectToAllowedModule();
    }, [userId, navigate]);

    return null;
};

export default SmartRedirect;
