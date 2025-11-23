import React, { useState, useEffect } from 'react';
import { getUserRole } from '../services/userRoleService';
import { Shield, AlertCircle } from 'lucide-react';

interface UserRoleDisplayProps {
  userId: string;
  showLabel?: boolean;
}

const UserRoleDisplay: React.FC<UserRoleDisplayProps> = ({ userId, showLabel = true }) => {
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserRole();
    }
  }, [userId]);

  const fetchUserRole = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getUserRole(userId);
      
      if (result.success) {
        setUserRole(result.data.role);
      } else {
        setError('Failed to fetch user role');
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
      setError('Error fetching user role');
    } finally {
      setLoading(false);
    }
  };

  // Role display names
  const roleDisplayNames: Record<string, string> = {
    'admin': 'Administrator',
    'basic_user': 'User',
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm">Loading role...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle size={16} />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-sm text-gray-600">Role:</span>
      )}
      <div className="flex items-center gap-1 text-sm font-medium">
        <Shield size={14} className="text-gray-500" />
        <span className="text-gray-800">
          {roleDisplayNames[userRole] || userRole || 'Unknown'}
        </span>
      </div>
    </div>
  );
};

export default UserRoleDisplay;