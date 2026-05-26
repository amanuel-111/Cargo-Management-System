import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RoleRoute = ({ roles }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null;

  if (!roles.includes(user.role)) {
    const redirects = {
      customer: '/customer/dashboard',
      driver: '/driver/dashboard',
      fleet_manager: '/fleet/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={redirects[user.role] || '/'} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
