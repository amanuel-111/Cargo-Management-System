import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';

const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ef4444', '#eab308'];

const AdminAnalytics = () => {
  const { data: revenue } = useQuery({ queryKey: ['rev'], queryFn: () => api.get('/analytics/revenue?months=12').then(r => r.data.data) });
  const { data: trends } = useQuery({ queryKey: ['tr'], queryFn: () => api.get('/analytics/shipment-trends?days=30').then(r => r.data.data) });
  const { data: distribution } = useQuery({ queryKey: ['dist'], queryFn: () => api.get('/analytics/status-distribution').then(r => r.data.data) });
  const { data: routes } = useQuery({ queryKey: ['routes'], queryFn: () => api.get('/analytics/top-routes').then(r => r.data.data) });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Analytics</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue (12 months)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenue || []}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Daily Shipments (30 days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={trends || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#f97316" radius={[3, 3, 0, 0]} name="Total" />
              <Bar dataKey="delivered" fill="#22c55e" radius={[3, 3, 0, 0]} name="Delivered" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Shipment Status Distribution</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={distribution || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80}>
                  {(distribution || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {(distribution || []).map((d, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-600 dark:text-gray-400 capitalize text-xs">{d._id?.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top 10 Routes</h3>
          <div className="space-y-2">
            {(routes || []).map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{r._id.from} → {r._id.to}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{r.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-dark-700 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-primary-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, (r.count / (routes[0]?.count || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!routes || routes.length === 0) && <p className="text-center text-gray-500 text-sm py-4">No data available</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
