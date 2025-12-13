import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const usePermissions = () => {
  const { user } = useSelector(state => state.auth);

  const hasPermission = useMemo(() => (permission) => {
    if (!user || !permission) return false;
    return user.permissions?.includes(permission) || user.role === 'admin';
  }, [user]);

  const hasRole = useMemo(() => (role) => {
    if (!user || !role) return false;
    return user.role === role || user.role === 'admin';
  }, [user]);

  const userRole = useMemo(() => user?.role || 'guest', [user]);

  const permissions = useMemo(() => user?.permissions || [], [user]);

  return {
    hasPermission,
    hasRole,
    userRole,
    permissions
  };
};

export default usePermissions;
