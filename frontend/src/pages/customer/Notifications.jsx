import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiCheck, FiCheckCircle, FiTrash2, FiPackage, FiTruck, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api';
import { timeAgo } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  shipment_created:     <FiPackage className="text-blue-500"   size={16} />,
  shipment_assigned:    <FiTruck   className="text-purple-500" size={16} />,
  shipment_picked_up:   <FiTruck   className="text-orange-500" size={16} />,
  shipment_in_transit:  <FiTruck   className="text-orange-500" size={16} />,
  shipment_delivered:   <FiCheckCircle className="text-green-500" size={16} />,
  shipment_failed:      <FiAlertCircle className="text-red-500"   size={16} />,
  shipment_cancelled:   <FiAlertCircle className="text-gray-500"  size={16} />,
  payment_received:     <FiCheckCircle className="text-green-500" size={16} />,
  driver_assigned:      <FiTruck   className="text-purple-500" size={16} />,
  system:               <FiBell    className="text-gray-500"   size={16} />,
  alert:                <FiAlertCircle className="text-red-500" size={16} />,
};

const Notifications = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications?limit=50').then((r) => r.data),
    refetchInterval: 30000,
  });

  const markRead = useMutation({
    mutationFn: (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('All notifications marked as read');
    },
  });

  const deleteNotif = useMutation({
    mutationFn: (id) => api.delete(`/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const notifications = data?.data || [];
  const unread = data?.unreadCount || 0;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          {unread > 0 && (
            <span className="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <FiCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      <div className="card divide-y divide-gray-50 dark:divide-dark-700">
        {isLoading ? (
          <div className="space-y-3 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-dark-700 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <FiBell className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors ${
                  !n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                }`}
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  !n.isRead ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-dark-700'
                }`}>
                  {TYPE_ICONS[n.type] || <FiBell size={16} className="text-gray-500" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => markRead.mutate(n.id)}
                      className="p-1.5 rounded-lg hover:bg-primary-100 text-primary-500 transition-colors"
                      title="Mark as read"
                    >
                      <FiCheck size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotif.mutate(n.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Notifications;
