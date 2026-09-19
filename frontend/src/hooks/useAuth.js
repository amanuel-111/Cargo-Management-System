import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { logoutUser } from '../redux/slices/authSlice';
import { disconnectSocket } from '../services/socketService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, loading, token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    disconnectSocket();
    dispatch(logoutUser());
    queryClient.clear();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    const paths = {
      customer: '/customer/dashboard',
      driver: '/driver/dashboard',
      fleet_manager: '/fleet/dashboard',
      admin: '/admin/dashboard',
    };
    return paths[user.role] || '/login';
  };

  return { user, isAuthenticated, loading, token, logout: handleLogout, getDashboardPath };
};
