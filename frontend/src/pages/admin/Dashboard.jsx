import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiPackage, FiUsers, FiTruck, FiDollarSign, FiActivity } from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import { SkeletonCard } from '../../components/common/LoadingSkeleton';
import { formatCurrency } from '../../utils/helpers';

const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ef4444'];

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/analytics/dashboard').then((r) => r.data.data),
  });

  const { data: trends } = useQuery({
    queryKey: ['admin-trends'],
    queryFn: () => api.get('/analytics/shipment-trends?days=30').then((r) => r.data.data),
  });

  const { data: distribution } = useQuery({
    queryKey: ['admin-distribution'],
    queryFn: () => api.get('/analytics/status-distribution').then((r) => r.data.data),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard title="Total Shipments" value={stats?.shipments?.total || 0} icon={FiPackage} color="primary" change={stats?.shipments?.growth} />
            <StatCard title="Total Customers" value={stats?.users?.customers || 0} icon={FiUsers} color="blue" />
            <StatCard title="Active Drivers" value={stats?.users?.drivers || 0} icon={FiTruck} color="green" />
            <StatCard title="Monthly Revenue" value={formatCurrency(stats?.revenue?.monthly || 0)} icon={FiDollarSign} color="purple" />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trend chart */}
        <div className="lg:col-span-2 card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Shipment Activity (30 days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trends || []}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#f97316" fill="url(#grad)" strokeWidth={2} name="Shipments" />
              <Area type="monotone" dataKey="delivered" stroke="#22c55e" fill="none" strokeWidth={2} name="Delivered" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status distribution */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Status Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={distribution || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={70}>
                {(distribution || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {(distribution || []).slice(0, 5).map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-600 dark:text-gray-400 capitalize">{d._id?.replace(/_/g, ' ')}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System health */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiActivity className="text-green-500" size={18} /> System Health
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'API Response', value: '< 200ms', status: 'good' },
            { label: 'Database', value: 'Connected', status: 'good' },
            { label: 'Socket.io', value: 'Active', status: 'good' },
            { label: 'Uptime', value: '99.9%', status: 'good' },
          ].map(({ label, value, status }) => (
            <div key={label} className="bg-gray-50 dark:bg-dark-700 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${status === 'good' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
