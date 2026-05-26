import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiPackage, FiTruck, FiUsers, FiCheckCircle, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonCard } from '../../components/common/LoadingSkeleton';
import { formatDate } from '../../utils/helpers';

const FleetDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['fleet-stats'],
    queryFn: () => api.get('/analytics/dashboard').then((r) => r.data.data),
  });

  const { data: trendsData } = useQuery({
    queryKey: ['shipment-trends'],
    queryFn: () => api.get('/analytics/shipment-trends?days=7').then((r) => r.data.data),
  });

  const { data: pendingData } = useQuery({
    queryKey: ['pending-shipments'],
    queryFn: () => api.get('/shipments?status=pending&limit=5').then((r) => r.data),
  });

  const pendingShipments = pendingData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fleet Dashboard</h1>
        <Link to="/fleet/assignments" className="btn-primary text-sm">Assign Shipments</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard title="Total Shipments" value={stats?.shipments?.total || 0} icon={FiPackage} color="primary" change={stats?.shipments?.growth} />
            <StatCard title="In Transit" value={stats?.shipments?.inTransit || 0} icon={FiTruck} color="orange" />
            <StatCard title="Active Drivers" value={stats?.users?.drivers || 0} icon={FiUsers} color="blue" />
            <StatCard title="Available Vehicles" value={stats?.vehicles?.available || 0} icon={FiTruck} color="green" />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trend chart */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Shipment Trends (7 days)</h3>
          {trendsData ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendsData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#f97316" fill="url(#colorCount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">Loading chart...</div>
          )}
        </div>

        {/* Pending assignments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FiAlertCircle className="text-yellow-500" size={18} />
              Pending Assignments
            </h3>
            <Link to="/fleet/assignments" className="text-sm text-primary-500 flex items-center gap-1">
              View all <FiArrowRight size={14} />
            </Link>
          </div>
          {pendingShipments.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              <FiCheckCircle className="mx-auto mb-2 text-green-400" size={24} />
              All shipments assigned
            </div>
          ) : (
            <div className="space-y-2">
              {pendingShipments.map((s) => (
                <div key={s._id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{s.trackingNumber}</p>
                    <p className="text-xs text-gray-500">{s.pickup?.city} → {s.destination?.city}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={s.status} />
                    <Link to="/fleet/assignments" className="text-xs text-primary-500 font-medium">Assign</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FleetDashboard;
