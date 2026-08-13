import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiTruck, FiUsers, FiTarget, FiAward } from 'react-icons/fi';
import api from '../../services/api';

const AboutPage = () => {
  const { data: publicStats } = useQuery({
    queryKey: ['public-stats'],
    queryFn: () => api.get('/analytics/public-stats').then((res) => res.data.data),
  });

  const stats = [
    { icon: FiTruck, label: 'Fleet Vehicles', value: (publicStats?.fleetVehicles ?? 0).toLocaleString() },
    { icon: FiUsers, label: 'Active Drivers', value: (publicStats?.activeDrivers ?? 0).toLocaleString() },
    { icon: FiTarget, label: 'Deliveries Completed', value: (publicStats?.deliveriesCompleted ?? 0).toLocaleString() },
    { icon: FiAward, label: 'On-Time Rate', value: publicStats?.onTimeRate || '100%' },
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-dark-900 to-dark-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold mb-4">
            About Smart Transport
          </motion.h1>
          <p className="text-gray-300 text-lg">Ethiopia's leading digital logistics platform, connecting businesses with reliable transport solutions.</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-4">We're on a mission to modernize Ethiopia's transport and logistics industry through technology, making cargo movement efficient, transparent, and accessible for all businesses.</p>
              <p className="text-gray-600">From small businesses in Addis Ababa to large enterprises across all regions, we provide the tools and network to move goods reliably.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="card text-center">
                  <Icon className="text-primary-500 mx-auto mb-2" size={24} />
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
