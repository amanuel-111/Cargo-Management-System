import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { connectSocket, disconnectSocket, getSocket } from '../services/socketService';
import { addNotification } from '../redux/slices/notificationSlice';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      socketRef.current = connectSocket(token);

      socketRef.current.on('newNotification', (notification) => {
        dispatch(addNotification(notification));
        toast(notification.message, { icon: '🔔' });
      });

      return () => {
        disconnectSocket();
      };
    }
  }, [isAuthenticated, token, dispatch]);

  return getSocket();
};
