import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';

const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ef4444', '#eab308', '#06b6d4'];

const FleetReports = () => {
  const { data: trends } = useQuery({
    queryKey: ['trends'],
    queryFn: () => api.get('/analytics/shipment-trends?days=14').then((r) => r.data.data),
  });

  const { data: distribution } = useQuery({
    queryKey: ['distribution'],
    queryFn: () => api.get('/analytics/status-distribution').then((r) => r.data.data),
  });

  const { data: revenue } = useQuery({
    queryKey: ['revenue'],
    queryFn: () => api.get('/analytics/revenue?months=6').then((r) => r.data.data),
  });

  const { data: routes } = useQuery({
    queryKey: ['top-routes'],
    queryFn: () => api.get('/analytics/top-routes').then((r) => r.data.data),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Shipment trends */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Shipment Trends (14 days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trends || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} name="Shipments" />
              <Bar dataKey="delivered" fill="#22c55e" radius={[4, 4, 0, 0]} name="Delivered" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status distribution */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={distribution || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}>
                {(distribution || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue (ETB)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenue || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top routes */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Routes</h3>
          <div className="space-y-3">
            {(routes || []).slice(0, 6).map((r, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-xs flex items-center justify-center font-semibold">{i + 1}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{r._id.from} → {r._id.to}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{r.count} trips</span>
                  <p className="text-xs text-gray-500">{formatCurrency(r.revenue)}</p>
                </div>
              </div>
            ))}
            {(!routes || routes.length === 0) && (
              <p className="text-center text-gray-500 text-sm py-4">No route data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetReports;
