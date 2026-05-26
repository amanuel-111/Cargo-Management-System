import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';
import { disconnectSocket } from '../services/socketService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    disconnectSocket();
    dispatch(logout());
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
