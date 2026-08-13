import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { connectSocket, disconnectSocket, getSocket } from '../services/socketService';
import { addNotification } from '../redux/slices/notificationSlice';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  // Flush queued offline GPS coordinate updates
  const flushOfflineGpsQueue = (socket) => {
    try {
      const queue = JSON.parse(localStorage.getItem('gps_offline_queue') || '[]');
      if (queue.length > 0 && socket?.connected) {
        queue.forEach((item) => {
          socket.emit('updateLocation', item);
        });
        localStorage.removeItem('gps_offline_queue');
        toast.success(`Synced ${queue.length} offline location logs!`, { icon: '📡' });
      }
    } catch (e) {
      console.error('Failed to flush offline GPS logs', e);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      socketRef.current = connectSocket(token);

      socketRef.current.on('connect', () => {
        flushOfflineGpsQueue(socketRef.current);
      });

      socketRef.current.on('newNotification', (notification) => {
        dispatch(addNotification(notification));
        toast(notification.message, { icon: '🔔' });
      });

      const handleOnline = () => {
        flushOfflineGpsQueue(socketRef.current);
      };
      window.addEventListener('online', handleOnline);

      return () => {
        window.removeEventListener('online', handleOnline);
        disconnectSocket();
      };
    }
  }, [isAuthenticated, token, dispatch]);

  /**
   * Helper for drivers to send location updates with offline resilience
   */
  const sendDriverLocation = (locationData) => {
    const socket = getSocket();
    if (navigator.onLine && socket?.connected) {
      socket.emit('updateLocation', locationData);
    } else {
      const queue = JSON.parse(localStorage.getItem('gps_offline_queue') || '[]');
      queue.push({ ...locationData, timestamp: new Date().toISOString() });
      localStorage.setItem('gps_offline_queue', JSON.stringify(queue));
      toast('Network weak: Location queued offline', { icon: '📴' });
    }
  };

  return { socket: getSocket(), sendDriverLocation };
};
